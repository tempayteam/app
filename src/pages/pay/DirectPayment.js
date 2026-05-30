import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { CPGABI, ERC20ABI } from '../../ABI/ABI';
import Loader from '../../components/loader/Loader';
import Token from '../../components/tokenList/Token';
import { CPGAddress, UINT256_MAX, ZERO_ADDRESS } from '../../constant/constant';
import { CONTRACT_ADDRESS_WARNING_MSG, SELF_PAYMENT_WARNING_MSG, TRANSACTION_ERROR_MSG, TRANSACTION_SUCCESS_MSG, USER_REJECT_TRANSACTION_MSG } from '../../constant/toasterMessage';
import { convertInTokenBigAmount, fireErrorToast, fireSuccessToast, getAllowance, handleKeyDown, handleWheel, isContractAddress } from '../../utils/commonFunction';
import { ContractWrite } from '../../utils/contractInstance';
// import { getSingleHopQuote } from './swapRead'

const DirectPayment = () => {
    const [directPaymentData, setDirectPaymentData] = useState({ userName: '', fromAmount: '', to: '' });
    const [fromToken, setFromToken] = useState({});
    const [buttonDetail, setButtonDetail] = useState({ name: "", bgColor: "bg-gray-600", textColor: 'text-gray-600', isDisabled: false });
    const [loading, setLoading] = useState(false)
    const [isRecipientContract, setIsRecipientContract] = useState(false)

    const { address: walletAddress, chainId } = useAccount();

    const { data: tokenBalanceData, isPending: tokenBalancePending } = useBalance({
        address: walletAddress,
        chainId,
        token: fromToken?.address,
        query: { enabled: Boolean(walletAddress && fromToken?.address) },
    });

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
    }

    // **********************************************************Approve Payment********************************************************************* //

    const { writeContract: approve, writeSuccessResponse: approveResponse, writeErrorResponse: approveErrorResponse } = ContractWrite({ address: fromToken?.address, abi: ERC20ABI, functionName: 'approve', initialArgs: [CPGAddress, UINT256_MAX] });



    useEffect(() => {
        if (approveResponse) {
            const fromAmount = ethers.parseUnits(directPaymentData?.fromAmount.toString(), fromToken?.decimals)

            directPayment({
                abi: CPGABI,
                address: CPGAddress,
                functionName: 'initiateDirectPayment',
                args: [
                    directPaymentData.userName, fromToken?.address, fromAmount.toString()
                ],
            })
        }
        // eslint-disable-next-line
    }, [approveResponse])

    useEffect(() => {
        if (directPaymentData.fromAmount && fromToken.decimals) {

            // const fromAmount = convertInTokenBigAmount(directPaymentData.fromAmount, fromToken?.decimals)
            const fromAmount = ethers.parseUnits(directPaymentData?.fromAmount.toString(), fromToken?.decimals)

            directPaymentArgs([directPaymentData.userName, fromToken?.address ? fromToken?.address : ZERO_ADDRESS, fromAmount.toString()])
        }
        // eslint-disable-next-line
    }, [directPaymentData, fromToken])

    useEffect(() => {
        if (approveErrorResponse) {
            onWriteError(approveErrorResponse);
        }
        // eslint-disable-next-line
    }, [approveErrorResponse]);

    // **********************************************************Approve Payment********************************************************************* //

    // **********************************************************Direct Payment********************************************************************* //

    const { writeContract: directPayment, writeSuccessResponse: directPaymentResponse, writeErrorResponse: directPaymentErrorResponse, updateArgs: directPaymentArgs } = ContractWrite({ address: CPGAddress, abi: CPGABI, functionName: 'initiateDirectPayment', initialArgs: [directPaymentData.userName, fromToken?.address ?? ZERO_ADDRESS, directPaymentData.fromAmount ?? 1], enabled: true });

    useEffect(() => {
        if (directPaymentResponse) {
            setLoading(false)
            setDirectPaymentData({ userName: '', fromAmount: '', to: '' })
            setFromToken({})
            fireSuccessToast(TRANSACTION_SUCCESS_MSG)
        }
        // eslint-disable-next-line
    }, [directPaymentResponse])

    useEffect(() => {
        if (directPaymentData.fromAmount && fromToken.decimals) {

            const fromAmount = ethers.parseUnits(directPaymentData?.fromAmount.toString(), fromToken?.decimals)
            directPaymentArgs([directPaymentData.userName, fromToken?.address ? fromToken?.address : ZERO_ADDRESS, fromAmount.toString()])
        }
        // eslint-disable-next-line
    }, [directPaymentData, fromToken])


    useEffect(() => {
        if (directPaymentErrorResponse) {
            onWriteError(directPaymentErrorResponse);
        }
        // eslint-disable-next-line
    }, [directPaymentErrorResponse]);

    // **********************************************************Direct Payment********************************************************************* //

    useEffect(() => {
        const checkAddress = async () => {
            if (ethers.isAddress(directPaymentData.userName)) {
                const result = await isContractAddress(directPaymentData.userName);
                setIsRecipientContract(result);
            } else {
                setIsRecipientContract(false);
            }
        };
        checkAddress();
    }, [directPaymentData.userName]);

    const handleSelectFromToken = (item) => {
        setFromToken(item);
    };

    const handleChange = (e) => {
        setDirectPaymentData({ ...directPaymentData, [e.target.name]: e.target.value })
    }


    const handleSubmit = async (e) => {
        try {
            setLoading(true)
            e.preventDefault()
            if (directPaymentData.userName.toLowerCase() === walletAddress?.toLowerCase()) {
                fireErrorToast(SELF_PAYMENT_WARNING_MSG)
                setLoading(false)
                return
            }
            const isContract = await isContractAddress(directPaymentData.userName);
            if (isContract) {
                fireErrorToast(CONTRACT_ADDRESS_WARNING_MSG)
                setLoading(false)
                return
            }
            const allowance = await getAllowance(fromToken.address, walletAddress)

            const convertedAmount = convertInTokenBigAmount(directPaymentData.fromAmount, fromToken.decimals)
            if (Number(allowance) < Number(convertedAmount)) {
                try {
                    approve({
                        abi: ERC20ABI,
                        address: fromToken?.address,
                        functionName: 'approve',
                        args: [
                            CPGAddress, UINT256_MAX
                        ],
                    });
                } catch (error) {
                    console.log(error);

                }

            } else {
                const fromAmount = ethers.parseUnits(directPaymentData?.fromAmount.toString(), fromToken?.decimals)
                try {
                    directPayment({
                        abi: CPGABI,
                        address: CPGAddress,
                        functionName: 'initiateDirectPayment',
                        args: [
                            directPaymentData.userName, fromToken?.address, fromAmount.toString()
                        ],
                    })
                } catch (error) {
                    console.log(error);

                }
            }

        } catch (error) {
            console.log(error);
            setLoading(false)

        }

    }


    useEffect(() => {
        let nameOfButton = "Enter Detail"
        let buttonColor = "bg-gray-300"
        let textColor = "text-gray-600"
        let disable = true

        if (directPaymentData.fromAmount && fromToken.decimals) {
            const amt = parseFloat(directPaymentData.fromAmount) || 0;
            let insufficient = false;
            if (!tokenBalancePending && tokenBalanceData?.formatted != null) {
                const bal = parseFloat(tokenBalanceData.formatted) || 0;
                insufficient = amt > bal;
            }
            if (insufficient) {
                nameOfButton = "Insufficient Balance"
                buttonColor = "bg-red-700"
                textColor = "text-white"
                disable = true

            } else if (directPaymentData.userName && directPaymentData.userName.toLowerCase() === walletAddress?.toLowerCase()) {
                nameOfButton = "Cannot pay to your own address"
                buttonColor = "bg-red-700"
                textColor = "text-white"
                disable = true

            } else if (isRecipientContract) {
                nameOfButton = "Cannot pay to contract address"
                buttonColor = "bg-red-700"
                textColor = "text-white"
                disable = true

            } else if (!directPaymentData.userName) {
                nameOfButton = "Enter Detail"
                buttonColor = "bg-gray-300"
                textColor = "text-gray-600"
                disable = true
            }
            else {
                nameOfButton = "Proceed to the Payment"
                buttonColor = "bg-[#F97316] hover:bg-[#EA580C]"
                textColor = "text-white"
                disable = false
            }
        }
        setButtonDetail({ name: nameOfButton, bgColor: buttonColor, textColor, isDisabled: disable })
        // eslint-disable-next-line
    }, [directPaymentData, fromToken, isRecipientContract, tokenBalanceData?.formatted, tokenBalancePending])



    const inputClass = "bg-white border border-[#EEEBE5] text-[#111111] placeholder-[#9B9B9B] text-base rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] block w-full p-2.5";
    const labelClass = "block mb-2 text-base font-medium text-[#6B6B6B]";

    return (
        <div className="max-w-xl mx-auto mt-7 animate-fade-in-up">
            <form className="glass-card rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-[#EEEBE5]">
                    <h3 className="text-xl font-medium text-[#111111]">Direct Payment</h3>
                </div>
                <div className="px-4 py-5">
                    <div className="mb-5">
                        <label htmlFor="userName" className={labelClass}>Receiver Wallet Address</label>
                        <input type="text" id="userName" name="userName" value={directPaymentData.userName} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div className="mb-5 grid sm:grid-cols-2 grid-cols-1 gap-5">
                        <div>
                            <label htmlFor="fromAmount" className={labelClass}>Amount</label>
                            <input type="number" id="fromAmount" min={0} onWheel={handleWheel} onKeyDown={handleKeyDown} name="fromAmount" value={directPaymentData.fromAmount} onChange={handleChange} className={inputClass} required />
                        </div>
                        <div className="sm:mt-0">
                            <div className="flex justify-between">
                                <label className={labelClass}>Token</label>
                                {fromToken.name && (
                                    <span className="text-sm text-[#6B6B6B]">
                                        Balance:{' '}
                                        {tokenBalancePending
                                            ? '…'
                                            : tokenBalanceData?.formatted ?? '0'}
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <Token handleSelectToken={handleSelectFromToken} token={fromToken} />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        {loading ? (
                            <div className="flex justify-center items-center bg-gray-100 w-full font-medium rounded-xl text-base px-5 py-2.5">
                                <Loader stroke="#F97316" size="20px" />
                            </div>
                        ) : (
                            <button
                                type="submit"
                                className={`${buttonDetail.bgColor} ${buttonDetail.textColor} w-full focus:outline-none font-medium rounded-xl text-base px-5 py-2.5 text-center disabled:opacity-60 disabled:cursor-not-allowed`}
                                onClick={handleSubmit}
                                disabled={!directPaymentData.userName || !fromToken.address || !directPaymentData.fromAmount || buttonDetail.isDisabled}
                            >
                                {buttonDetail.name}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    )
}

export default DirectPayment
