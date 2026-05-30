import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { CPGABI } from '../../ABI/ABI';
import Loader from '../../components/loader/Loader';
import Token from '../../components/tokenList/Token';
import { mileStoneDuration } from '../../config/data';
import { CPGAddress, DIRECT_PAYMENT, ZERO_ADDRESS } from '../../constant/constant';
import { chevronDownIcon } from '../../constant/icon';
import { CONTRACT_ADDRESS_WARNING_MSG, REQUEST_TRANSACTION_SUCCESS_MSG, SELF_PAYMENT_WARNING_MSG, TRANSACTION_ERROR_MSG, USER_REJECT_TRANSACTION_MSG } from '../../constant/toasterMessage';
import { convertBigToSmallDigitWithSpecificDecimal, fireErrorToast, fireSuccessToast, handleKeyDown, handleWheel, isContractAddress } from '../../utils/commonFunction';
import { ContractWrite } from '../../utils/contractInstance';

const SendRequest = ({ getDirectPaymentRequestData, getLockedPaymentRequestData }) => {

    const [sendPaymentRequestData, setsendPaymentRequestData] = useState({ userName: '', amount: '', description: '' });
    const [selectedOption, setSelectedOption] = useState('directPayment');
    const [milestoneCount, setMilestoneCount] = useState('');
    const [milestoneDuration, setMilestoneDuration] = useState(mileStoneDuration[0].timestamp)
    const [token, setToken] = useState({})
    const [loading, setLoading] = useState(false)
    const [isRecipientContract, setIsRecipientContract] = useState(false)
    const [buttonDetail, setButtonDetail] = useState({ name: '', bgColor: 'bg-gray-300', textColor: 'text-gray-600', isDisable: true })

    const { address: walletAddress } = useAccount()

    const onWriteError = (error) => {

        if (error) {
            if (!error?.details?.includes('MetaMask Tx Signature: User denied transaction signature')) {
                fireErrorToast(TRANSACTION_ERROR_MSG)
            }
            if (error?.details?.includes('MetaMask Tx Signature: User denied transaction signature')) {
                fireErrorToast(USER_REJECT_TRANSACTION_MSG)
            }
        }

        setLoading(false)
        // }
    }
    //********************************************** requestPayment Smart Contract Call *****************************************************************//
    const { writeContract: requestPayment, writeSuccessResponse: requestPaymentResponse, writeErrorResponse: requestPaymentErrorResponse, updateArgs: requestPaymentArgs } = ContractWrite({ address: CPGAddress, abi: CPGABI, functionName: 'requestPayment', initialArgs: [sendPaymentRequestData.userName, token?.address ?? ZERO_ADDRESS, sendPaymentRequestData.amount ?? 1], enabled: true });

    useEffect(() => {
        if (requestPaymentResponse) {
            setLoading(false)
            fireSuccessToast(REQUEST_TRANSACTION_SUCCESS_MSG)
            setsendPaymentRequestData({ userName: '', amount: '', description: '' })
            setToken({})
            getDirectPaymentRequestData()
        }
        // eslint-disable-next-line
    }, [requestPaymentResponse])

    useEffect(() => {
        if (selectedOption === 'directPayment') {
            if (token.decimals && sendPaymentRequestData.amount) {
                const trackedAmount = ethers.parseUnits(sendPaymentRequestData.amount, token?.decimals)
                requestPaymentArgs([sendPaymentRequestData.userName, token?.address ?? ZERO_ADDRESS, trackedAmount.toString()])
            }
        }
        // eslint-disable-next-line
    }, [sendPaymentRequestData, token, selectedOption])


    useEffect(() => {
        if (requestPaymentErrorResponse) {
            onWriteError(requestPaymentErrorResponse);
        }
        // eslint-disable-next-line
    }, [requestPaymentErrorResponse]);
    //**************************************************************** requestPayment Smart Contract Call *******************************************************************//

    //**************************************************************** requestLockedPayment Smart Contract Call *******************************************************************//
    const { writeContract: requestLockedPayment, writeSuccessResponse: requestLockedPaymentResponse, writeErrorResponse: requestLockedPaymentErrorResponse, updateArgs: requestLockedPaymentArgs } = ContractWrite({ address: CPGAddress, abi: CPGABI, functionName: 'requestLockedPayment', initialArgs: [sendPaymentRequestData.userName, token?.address ?? ZERO_ADDRESS, sendPaymentRequestData.amount ?? 1, milestoneCount, mileStoneDuration], enabled: true });

    useEffect(() => {
        if (requestLockedPaymentResponse) {
            setLoading(false)
            setsendPaymentRequestData({ userName: '', amount: '', description: '' })
            setMilestoneCount('')
            setSelectedOption('directPayment')
            setToken({})
            setMilestoneDuration(mileStoneDuration[0].timestamp)
            getLockedPaymentRequestData()
            fireSuccessToast(REQUEST_TRANSACTION_SUCCESS_MSG)
        }
        // eslint-disable-next-line
    }, [requestLockedPaymentResponse])

    useEffect(() => {
        if (selectedOption === 'milestone') {
            if (token.decimals && milestoneCount) {
                const trackedAmount = ethers.parseUnits(sendPaymentRequestData.amount.toString(), token?.decimals)
                requestLockedPaymentArgs([sendPaymentRequestData.userName, token?.address ?? ZERO_ADDRESS, trackedAmount.toString(), milestoneCount, milestoneDuration])
            }
        }
        // eslint-disable-next-line
    }, [sendPaymentRequestData, token, milestoneDuration, milestoneCount, selectedOption])


    useEffect(() => {
        if (requestLockedPaymentErrorResponse) {
            onWriteError(requestLockedPaymentErrorResponse);
        }
        // eslint-disable-next-line
    }, [requestLockedPaymentErrorResponse]);
    //**************************************************************** requestLockedPayment Smart Contract Call *******************************************************************//


    const handleChangeMilestoneCount = (e) => {
        setMilestoneCount(e.target.value);
    };

    const handleChange = (e) => {
        setsendPaymentRequestData({ ...sendPaymentRequestData, [e.target.name]: e.target.value })
    }

    const handleSelectChange = (event) => {
        setMilestoneDuration(Number(event.target.value));
    };

    const handleSelectToken = (item) => {
        setToken(item);
    };

    useEffect(() => {
        const checkAddress = async () => {
            if (ethers.isAddress(sendPaymentRequestData.userName)) {
                const result = await isContractAddress(sendPaymentRequestData.userName);
                setIsRecipientContract(result);
            } else {
                setIsRecipientContract(false);
            }
        };
        checkAddress();
    }, [sendPaymentRequestData.userName]);

    const handleOptionChange = (e) => {
        setSelectedOption(e.target.value);
    };

    const handleSubmit = async (e) => {
        try {
            setLoading(true)
            e.preventDefault()
            if (!ethers.isAddress(sendPaymentRequestData.userName)) {
                fireErrorToast('Enter a valid receiver wallet address')
                setLoading(false)
                return
            }
            if (sendPaymentRequestData.userName.toLowerCase() === walletAddress?.toLowerCase()) {
                fireErrorToast(SELF_PAYMENT_WARNING_MSG)
                setLoading(false)
                return
            }
            const isContract = await isContractAddress(sendPaymentRequestData.userName);
            if (isContract) {
                fireErrorToast(CONTRACT_ADDRESS_WARNING_MSG)
                setLoading(false)
                return
            }
            const trackedAmount = ethers.parseUnits(sendPaymentRequestData.amount.toString(), token?.decimals)
            if (selectedOption === 'directPayment') {
                requestPayment(
                    {
                        abi: CPGABI,
                        address: CPGAddress,
                        functionName: 'requestPayment',
                        args: [
                            sendPaymentRequestData.userName, token?.address ?? ZERO_ADDRESS, trackedAmount.toString()
                        ]
                    }
                )
            } else if (selectedOption === 'milestone') {

                requestLockedPayment(
                    {
                        abi: CPGABI,
                        address: CPGAddress,
                        functionName: 'requestLockedPayment',
                        args: [
                            sendPaymentRequestData.userName, token?.address ?? ZERO_ADDRESS, trackedAmount.toString(), milestoneCount, milestoneDuration
                        ]
                    }
                )
            }
        } catch (error) {
            setLoading(false)
        }
    }

    useEffect(() => {
        let nameOfButton = "Enter Detail"
        let buttonColor = "bg-gray-300"
        let textColor = "text-gray-600"
        let disable = true
        if (sendPaymentRequestData.amount && token.decimals) {
            if (!sendPaymentRequestData.userName) {
                nameOfButton = "Enter Detail"
                buttonColor = "bg-gray-300"
                textColor = "text-gray-600"
                disable = true
            } else if (sendPaymentRequestData.userName && sendPaymentRequestData.userName.toLowerCase() === walletAddress?.toLowerCase()) {
                nameOfButton = "Cannot request from your own address"
                buttonColor = "bg-red-700"
                textColor = "text-white"
                disable = true
            } else if (isRecipientContract) {
                nameOfButton = "Cannot request from contract address"
                buttonColor = "bg-red-700"
                textColor = "text-white"
                disable = true
            } else if (selectedOption === "milestone" && !milestoneCount) {
                nameOfButton = "Enter Detail"
                buttonColor = "bg-gray-300"
                textColor = "text-gray-600"
                disable = true
            }
            else {
                nameOfButton = "Send Request"
                buttonColor = "bg-customBlue"
                textColor = "text-white"
                disable = false
            }
        }
        setButtonDetail({ name: nameOfButton, bgColor: buttonColor, textColor, isDisabled: disable })
        // eslint-disable-next-line
    }, [sendPaymentRequestData, token, selectedOption, milestoneCount, isRecipientContract])


    const inputClass = "bg-white border border-[#EEEBE5] text-[#111111] placeholder-[#9B9B9B] text-base rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] block w-full p-2.5";
    const labelClass = "block mb-2 text-base font-medium text-[#6B6B6B]";

    return (
        <div className="my-6 max-w-xl mx-auto mt-6 animate-fade-in-up">
            <div className="glass-card rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-[#EEEBE5]">
                    <h3 className="text-xl font-medium text-[#111111]">Send Payment Request</h3>
                </div>
                <div className="relative px-4 py-5 flex flex-col justify-center">
                    <div className="flex-initial w-full">
                        <div className="mb-3">
                            <label htmlFor="userName" className={labelClass}>Receiver Wallet Address</label>
                            <input type="text" name="userName" value={sendPaymentRequestData.userName} id="userName" onChange={handleChange} className={inputClass} required />
                        </div>
                        <div className="mb-3 grid sm:grid-cols-2 sm:gap-2 gap-1">
                            <div className="sm:mb-0 mb-3">
                                <label htmlFor="amount" className={labelClass}>Enter Amount</label>
                                <input type="number" value={sendPaymentRequestData.amount} name="amount" min={0} onWheel={handleWheel} onKeyDown={handleKeyDown} id="amount" onChange={handleChange} className={inputClass} required />
                            </div>
                            <div className="sm:mt-0 w-full sm:mb-0 mb-2">
                                <div className="flex justify-between">
                                    <label htmlFor="token" className={labelClass}>Token</label>
                                    {token.name && <span className="text-sm text-[#9B9B9B]">Balance: {convertBigToSmallDigitWithSpecificDecimal(token.balance, token.decimals)}</span>}
                                </div>
                                <div className="relative">
                                    <Token handleSelectToken={handleSelectToken} token={token} />
                                </div>
                            </div>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="description" className={labelClass}>Description</label>
                            <textarea value={sendPaymentRequestData.description} name="description" id="description" onChange={handleChange} className={inputClass + " min-h-[80px]"} required />
                        </div>
                        <div className="mb-5 mt-3 sm:flex gap-6 justify-center">
                            <label className="flex items-center cursor-pointer">
                                <input id="directPayment" type="radio" value="directPayment" name="paymentType" className="w-4 h-4 text-[#F97316] border-[#EEEBE5] bg-white focus:ring-[#F97316] focus:ring-offset-0" checked={selectedOption === 'directPayment'} onChange={handleOptionChange} />
                                <span className="ms-2 font-medium text-[#6B6B6B]">{DIRECT_PAYMENT}</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input id="milestone" type="radio" value="milestone" name="paymentType" className="w-4 h-4 text-[#F97316] border-[#EEEBE5] bg-white focus:ring-[#F97316] focus:ring-offset-0" checked={selectedOption === 'milestone'} onChange={handleOptionChange} />
                                <span className="ms-2 font-medium text-[#6B6B6B]">Milestone</span>
                            </label>
                        </div>
                        {selectedOption === 'milestone' && (
                            <div className="grid sm:grid-cols-2 grid-cols-1 gap-2 mb-5">
                                <div>
                                    <label className={labelClass}>Select Milestone Duration</label>
                                    <div className="relative mt-1">
                                        <select className={inputClass + " pr-10 appearance-none cursor-pointer"} value={milestoneDuration} onChange={handleSelectChange}>
                                            {mileStoneDuration.map((item) => <option key={item.id} value={item.timestamp}>{item.name}</option>)}
                                        </select>
                                        <i className={`h-5 w-5 absolute top-3 right-3 text-[#9B9B9B] pointer-events-none ${chevronDownIcon}`}></i>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="milestoneCount" className={labelClass}>No of Milestone</label>
                                    <input type="number" value={milestoneCount} id="milestoneCount" min={0} onWheel={handleWheel} onKeyDown={handleKeyDown} className={inputClass + " mt-1"} required onChange={handleChangeMilestoneCount} />
                                </div>
                            </div>
                        )}
                        <div className="flex justify-center mt-5">
                            {loading ? (
                                <div className="flex justify-center items-center bg-[#FFF7ED] w-full font-medium rounded-xl text-base px-5 py-2.5">
                                    <Loader stroke="#F97316" size="20px" />
                                </div>
                            ) : (
                                <button
                                    className={`w-full focus:outline-none font-medium rounded-xl text-base px-5 py-2.5 text-center disabled:opacity-60 disabled:cursor-not-allowed ${buttonDetail.isDisabled ? `${buttonDetail.bgColor} ${buttonDetail.textColor}` : 'bg-[#F97316] hover:bg-[#EA580C] text-white'}`}
                                    onClick={handleSubmit}
                                    disabled={!sendPaymentRequestData.userName || !sendPaymentRequestData.amount || !token?.address || buttonDetail.isDisabled}
                                >
                                    {buttonDetail.name}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SendRequest
