import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { CPGABI, ERC20ABI } from '../../ABI/ABI';
import Loader from '../../components/loader/Loader';
import Token from '../../components/tokenList/Token';
import { mileStoneDuration } from '../../config/data';
import { CPGAddress, UINT256_MAX, ZERO_ADDRESS } from '../../constant/constant';
import { chevronDownIcon } from '../../constant/icon';
import { CONTRACT_ADDRESS_WARNING_MSG, INITIATE_TRACKED_PAYMENT_SUCCESS, SELF_PAYMENT_WARNING_MSG, TRANSACTION_ERROR_MSG, USER_REJECT_TRANSACTION_MSG } from '../../constant/toasterMessage';
import { convertInTokenBigAmount, fireErrorToast, fireSuccessToast, getAllowance, handleKeyDown, handleWheel, isContractAddress } from '../../utils/commonFunction';
import { ContractWrite } from '../../utils/contractInstance';

const TrackedPayment = () => {
    const [milestoneCount, setMilestoneCount] = useState('');
    const [milestoneDuration, setMilestoneDuration] = useState(mileStoneDuration[0].timestamp);
    const [trakedPaymentData, setTrakedPaymentData] = useState({ userName: '', amount: '', releaseDate: '' });
    const [token, setToken] = useState({})
    const [loading, setLoading] = useState(false)
    const [isRecipientContract, setIsRecipientContract] = useState(false)
    const [buttonDetail, setButtonDetail] = useState({ name: "Enter Detail", bgColor: "bg-gray-600", isDisabled: false, textColor: 'text-gray-600' });



    // const today = new Date().toISOString().split('T')[0];

    const { address: walletAddress, chainId } = useAccount();

    const { data: tokenBalanceData, isPending: tokenBalancePending } = useBalance({
        address: walletAddress,
        chainId,
        token: token?.address,
        query: { enabled: Boolean(walletAddress && token?.address) },
    });

    // **********************************************************Approve Payment********************************************************************* //

    const { writeContract: approve, writeSuccessResponse: aprroveResponse, writeErrorResponse: approveErrorResponse } = ContractWrite({ address: token?.address, abi: ERC20ABI, functionName: 'approve', initialArgs: [CPGAddress, UINT256_MAX] });

    useEffect(() => {
        if (aprroveResponse) {
            const trackedAmount = ethers.parseUnits(trakedPaymentData.amount, token?.decimals)
            lockedPayment(
                {
                    abi: CPGABI,
                    address: CPGAddress,
                    functionName: 'initiateLockedPayment',
                    args: [
                        trakedPaymentData.userName, token?.address, trackedAmount.toString(), milestoneCount, milestoneDuration.toString()
                    ],
                }
            )

        }
        // eslint-disable-next-line
    }, [aprroveResponse])

    useEffect(() => {
        if (approveErrorResponse) {
            onWriteError(approveErrorResponse);
        }
        // eslint-disable-next-line
    }, [approveErrorResponse]);

    // **********************************************************Approve Payment********************************************************************* //

    //******************************************************************** Smart Contract Call ************************************************************************//
    const { writeContract: lockedPayment, writeSuccessResponse: lockedPaymentResponse, writeErrorResponse: lockedPaymentErrorResponse, updateArgs: lockedPaymentArgs } = ContractWrite({ address: CPGAddress, abi: CPGABI, functionName: 'initiateLockedPayment', initialArgs: [trakedPaymentData.userName, token?.address ?? ZERO_ADDRESS, trakedPaymentData.amount ?? 1, milestoneCount, milestoneDuration.toString()], enabled: true });

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

    useEffect(() => {
        if (lockedPaymentResponse) {
            setTrakedPaymentData({ userName: '', amount: '', releaseDate: '' })
            setMilestoneCount('')
            setToken({})
            setMilestoneDuration(mileStoneDuration[0].timestamp)
            setLoading(false)
            fireSuccessToast(INITIATE_TRACKED_PAYMENT_SUCCESS)

        }
        // eslint-disable-next-line
    }, [lockedPaymentResponse])

    useEffect(() => {
        if (token.decimals && milestoneCount) {

            const trackedAmount = ethers.parseUnits(trakedPaymentData.amount, token?.decimals)


            lockedPaymentArgs([trakedPaymentData.userName, token?.address ?? ZERO_ADDRESS, trackedAmount.toString(), milestoneCount, milestoneDuration.toString()])
        }
        // eslint-disable-next-line
    }, [trakedPaymentData, token, milestoneDuration, milestoneCount])


    useEffect(() => {
        if (lockedPaymentErrorResponse) {
            onWriteError(lockedPaymentErrorResponse);
        }
        // eslint-disable-next-line
    }, [lockedPaymentErrorResponse]);
    //******************************************************************** Smart Contract Call ************************************************************************//



    useEffect(() => {
        const checkAddress = async () => {
            if (ethers.isAddress(trakedPaymentData.userName)) {
                const result = await isContractAddress(trakedPaymentData.userName);
                setIsRecipientContract(result);
            } else {
                setIsRecipientContract(false);
            }
        };
        checkAddress();
    }, [trakedPaymentData.userName]);

    const handlAmountChange = (e) => {
        setMilestoneCount(e.target.value);
    };

    const handleChange = (e) => {
        setTrakedPaymentData({ ...trakedPaymentData, [e.target.name]: e.target.value })
    }

    const handleSelectChange = (event) => {
        setMilestoneDuration(Number(event.target.value));
    };

    const handleSelectToken = (item) => {
        setToken(item);
    };

    const handleSubmit = async (e) => {
        try {
            setLoading(true)
            e.preventDefault()
            if (!ethers.isAddress(trakedPaymentData.userName)) {
                fireErrorToast('Enter a valid receiver wallet address')
                setLoading(false)
                return
            }
            if (trakedPaymentData.userName.toLowerCase() === walletAddress?.toLowerCase()) {
                fireErrorToast(SELF_PAYMENT_WARNING_MSG)
                setLoading(false)
                return
            }
            const isContract = await isContractAddress(trakedPaymentData.userName);
            if (isContract) {
                fireErrorToast(CONTRACT_ADDRESS_WARNING_MSG)
                setLoading(false)
                return
            }
            const allowance = await getAllowance(token.address, walletAddress)
            const convertedAmount = convertInTokenBigAmount(trakedPaymentData.amount, token.decimals)

            if (Number(allowance) < Number(convertedAmount)) {
                approve({
                    abi: ERC20ABI,
                    address: token?.address,
                    functionName: 'approve',
                    args: [
                        CPGAddress, UINT256_MAX
                    ],
                });
            } else {
                const trackedAmount = ethers.parseUnits(trakedPaymentData.amount, token?.decimals)

                lockedPayment(
                    {
                        abi: CPGABI,
                        address: CPGAddress,
                        functionName: 'initiateLockedPayment',
                        args: [
                            trakedPaymentData.userName, token?.address, trackedAmount.toString(), milestoneCount, milestoneDuration.toString()
                        ],
                    }
                )
            }
        } catch (error) {
            setLoading(false)
        } finally {
        }
    }


    useEffect(() => {
        let nameOfButton = "Enter Detail"
        let buttonColor = "bg-gray-300"
        let textColor = "text-gray-600"
        let disable = true
        if (trakedPaymentData.amount && token.decimals) {
            const amt = parseFloat(trakedPaymentData.amount) || 0;
            let insufficient = false;
            if (!tokenBalancePending && tokenBalanceData?.formatted != null) {
                const bal = parseFloat(tokenBalanceData.formatted) || 0;
                insufficient = amt > bal;
            }
            if (insufficient) {
                nameOfButton = "Insufficient Balance"
                buttonColor = "bg-red-700"
                textColor = 'text-white'
                disable = true

            } else if (trakedPaymentData.userName && trakedPaymentData.userName.toLowerCase() === walletAddress?.toLowerCase()) {
                nameOfButton = "Cannot pay to your own address"
                buttonColor = "bg-red-700"
                textColor = 'text-white'
                disable = true

            } else if (isRecipientContract) {
                nameOfButton = "Cannot pay to contract address"
                buttonColor = "bg-red-700"
                textColor = 'text-white'
                disable = true

            } else if (!trakedPaymentData.userName || !milestoneCount) {
                nameOfButton = "Enter Detail"
                buttonColor = "bg-gray-300"
                textColor = 'text-gray-600'
                disable = true
            }
            else {
                nameOfButton = "Initiate Track Payment"
                buttonColor = "bg-[#F97316] hover:bg-[#EA580C]"
                textColor = 'text-white'
                disable = false
            }
        }
        setButtonDetail({ name: nameOfButton, bgColor: buttonColor, textColor, isDisabled: disable })
        // eslint-disable-next-line
    }, [trakedPaymentData, token, milestoneCount, isRecipientContract, tokenBalanceData?.formatted, tokenBalancePending])


    const inputClass = "bg-white border border-[#EEEBE5] text-[#111111] placeholder-[#9B9B9B] text-base rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] block w-full p-2.5";
    const labelClass = "block mb-2 text-base font-medium text-[#6B6B6B]";

    return (
        <div className="my-6 max-w-xl mx-auto mt-7 animate-fade-in-up">
            <div className="glass-card rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-[#EEEBE5]">
                    <h3 className="text-xl font-medium text-[#111111]">Tracked Payment</h3>
                </div>
                <div className="relative px-4 py-5 flex flex-col justify-center">
                    <div className="flex-initial w-full max-h-[58vh] overflow-y-auto overflow-x-hidden">
                        <div className="mb-3">
                            <label htmlFor="user_name" className={labelClass}>Receiver Wallet Address</label>
                            <input type="text" name="userName" value={trakedPaymentData.userName} id="user_name" onChange={handleChange} className={inputClass} required />
                        </div>
                        <div className="mb-4 grid sm:grid-cols-2 sm:gap-2 gap-1">
                            <div>
                                <label htmlFor="amount" className={labelClass}>Enter Amount</label>
                                <input type="number" name="amount" min={0} onWheel={handleWheel} onKeyDown={handleKeyDown} value={trakedPaymentData.amount} id="amount" onChange={handleChange} className={inputClass} required />
                            </div>
                            <div className="sm:mt-0 mt-2 w-full">
                                <div className="flex justify-between">
                                    <label className={labelClass}>Token</label>
                                    {token.name && (
                                        <span className="text-sm text-[#6B6B6B]">
                                            Balance:{' '}
                                            {tokenBalancePending
                                                ? '…'
                                                : tokenBalanceData?.formatted ?? '0'}
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <Token handleSelectToken={handleSelectToken} token={token} />
                                </div>
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 grid-cols-1 gap-2 mb-5">
                            <div>
                                <label className={labelClass}>Select Milestone Duration</label>
                                <div className="relative mt-1">
                                    <select className={inputClass + " pr-10 appearance-none cursor-pointer"} value={milestoneDuration} onChange={handleSelectChange}>
                                        {mileStoneDuration.map((item) => <option key={item.id} value={item.timestamp}>{item.name}</option>)}
                                    </select>
                                    <i className={`h-5 w-5 absolute top-3 right-3 text-[#6B6B6B] pointer-events-none ${chevronDownIcon}`}></i>
                                </div>
                            </div>
                            <div className="sm:mt-0 mt-2">
                                <label htmlFor="milestoneCount" className={labelClass}>No of Milestone</label>
                                <input type="number" value={milestoneCount} id="milestoneCount" min={0} onWheel={handleWheel} onKeyDown={handleKeyDown} className={inputClass + " mt-1"} required onChange={handlAmountChange} />
                            </div>
                        </div>
                        <div className="flex justify-center">
                            {loading ? (
                                <div className="flex justify-center items-center bg-gray-100 w-full font-medium rounded-xl text-base px-5 py-2.5">
                                    <Loader stroke="#F97316" size="20px" />
                                </div>
                            ) : (
                                <button type="button" className={`${buttonDetail.bgColor} ${buttonDetail.textColor} w-full focus:outline-none font-medium rounded-xl text-base px-5 py-2.5 text-center disabled:opacity-60 disabled:cursor-not-allowed`} onClick={handleSubmit} disabled={!trakedPaymentData.userName || !trakedPaymentData.amount || !token.address || buttonDetail.isDisabled}>{buttonDetail.name}</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TrackedPayment
