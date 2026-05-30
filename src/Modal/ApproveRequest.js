import React, { useContext, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { CPGABI, ERC20ABI } from '../ABI/ABI';
import Loader from '../components/loader/Loader';
import { CPGAddress, DIRECT_PAYMENT, TokenContext, UINT256_MAX } from '../constant/constant';
import { checkIcon, chevronDownIcon, closeIcon } from '../constant/icon';
import { TRANSACTION_ERROR_MSG, TRANSACTION_SUCCESS_MSG, USER_REJECT_TRANSACTION_MSG } from '../constant/toasterMessage';
import { convertBigToSmallDigitWithSpecificDecimal, convertInTokenBigAmount, fetchTokenBalances, findExactMultiple, fireErrorToast, fireSuccessToast } from '../utils/commonFunction';
import { ContractWrite, readContractData } from '../utils/contractInstance';

const ApproveRequestModal = ({ setApproveReqModal, currentItem, setCurrentItem, getPendingRequestData, selectedPaymentType }) => {

    const [loading, setLoading] = useState(false)
    const { tokenList, setTokenList } = useContext(TokenContext);

    const { address: walletAddress } = useAccount()

    const getTokenBalance = () => {
        const lowercaseTokenAddress = currentItem?.tokenAddress.toLowerCase();

        const tokenEntry = tokenList.find(
            (token) => token.address.toLowerCase() === lowercaseTokenAddress
        );

        if (!tokenEntry) {
            return null;
        }
        const balance = tokenEntry.balance || 0;

        return convertBigToSmallDigitWithSpecificDecimal(balance, currentItem.tokenDecimal);
    };


    const onWriteError = (error) => {
        if (error) {
            if (!error.details.includes('MetaMask Tx Signature: User denied transaction signature')) {
                fireErrorToast(TRANSACTION_ERROR_MSG)
            }
            if (error.details.includes('MetaMask Tx Signature: User denied transaction signature')) {
                fireErrorToast(USER_REJECT_TRANSACTION_MSG)
            }
        }

        setLoading(false)
    }

    // **********************************************************Approve Payment********************************************************************* //

    const { writeContract: approve, writeSuccessResponse: aprroveResponse, writeErrorResponse: approveErrorResponse } = ContractWrite({ address: currentItem.tokenAddress, abi: ERC20ABI, functionName: 'approve', initialArgs: [CPGAddress, UINT256_MAX] });

    useEffect(() => {
        if (aprroveResponse) {
            if (selectedPaymentType === DIRECT_PAYMENT) {
                acceptPaymentRequest({
                    abi: CPGABI,
                    address: CPGAddress,
                    functionName: 'acceptPaymentRequest',
                    args: [
                        currentItem.id.toString()
                    ]
                })
            } else {
                acceptLockedPaymentRequest({
                    abi: CPGABI,
                    address: CPGAddress,
                    functionName: 'acceptLockedPaymentRequest',
                    args: [
                        currentItem.id.toString()
                    ]
                })
            }
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

    // **********************************************************Accept Request Payment********************************************************************* //
    const { writeContract: acceptPaymentRequest, writeSuccessResponse: acceptPaymentRequestResponse, writeErrorResponse: acceptPaymentRequestErrorResponse } = ContractWrite({ address: CPGAddress, abi: CPGABI, functionName: 'acceptPaymentRequest', initialArgs: [currentItem.id.toString()], enabled: true });

    const getBalance = async () => {
        const allBalance = await fetchTokenBalances(walletAddress);
        setTokenList(allBalance)

    }

    useEffect(() => {
        if (acceptPaymentRequestResponse) {
            setLoading(false)
            setCurrentItem({})
            setApproveReqModal(false)
            fireSuccessToast(TRANSACTION_SUCCESS_MSG)
            getPendingRequestData()
            getBalance()
        }
        // eslint-disable-next-line
    }, [acceptPaymentRequestResponse])


    useEffect(() => {
        if (acceptPaymentRequestErrorResponse) {
            onWriteError(acceptPaymentRequestErrorResponse);
        }
        // eslint-disable-next-line
    }, [acceptPaymentRequestErrorResponse]);
    // *******************************************************Accept Request Payment********************************************************************* //
    // ************************************************* Accept Tracked Request Payment *************************************************************** //
    const { writeContract: acceptLockedPaymentRequest, writeSuccessResponse: acceptLockedPaymentRequestResponse, writeErrorResponse: acceptLockedPaymentRequestErrorResponse } = ContractWrite({ address: CPGAddress, abi: CPGABI, functionName: 'acceptLockedPaymentRequest', initialArgs: [currentItem.id.toString()], enabled: true });


    useEffect(() => {
        if (acceptLockedPaymentRequestResponse) {
            setLoading(false)
            setCurrentItem({})
            setApproveReqModal(false)
            fireSuccessToast(TRANSACTION_SUCCESS_MSG)
            getPendingRequestData()
            getBalance()
        }
        // eslint-disable-next-line
    }, [acceptLockedPaymentRequestResponse])


    useEffect(() => {
        if (acceptLockedPaymentRequestErrorResponse) {
            onWriteError(acceptLockedPaymentRequestErrorResponse);
        }
        // eslint-disable-next-line
    }, [acceptLockedPaymentRequestErrorResponse]);
    // **********************************************************Accept Tracked Request Payment********************************************************************* //

    const getAllowance = async (tokenAddress) => {
        return await readContractData(tokenAddress, ERC20ABI, 'allowance', [walletAddress, CPGAddress]);
    }

    const handleAcceptButton = async () => {
        try {
            setLoading(true)
            const allowance = await getAllowance(currentItem.tokenAddress)

            const convertedAmount = convertInTokenBigAmount(currentItem.parsedNumber, currentItem.tokenDecimal)
            if (Number(allowance) < Number(convertedAmount)) {
                approve({
                    abi: ERC20ABI,
                    address: currentItem?.tokenAddress,
                    functionName: 'approve',
                    args: [
                        CPGAddress, UINT256_MAX
                    ],
                });
            } else {
                if (selectedPaymentType === DIRECT_PAYMENT) {
                    acceptPaymentRequest({
                        abi: CPGABI,
                        address: CPGAddress,
                        functionName: 'claimDirectPayment',
                        args: [
                            currentItem.id.toString()
                        ]
                    })
                } else {
                    acceptLockedPaymentRequest({
                        abi: CPGABI,
                        address: CPGAddress,
                        functionName: 'acceptLockedPaymentRequest',
                        args: [
                            currentItem.id.toString()
                        ]
                    })
                }
            }
        } catch (error) {

        }
    }

    const handleRejectButton = () => {
        // alert('button clicked')
        setApproveReqModal(false)
        setCurrentItem({})
    }




    return (
        <div tabIndex='-1' className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none backdrop-brightness-50">
            <div className="mx-5">
                <div className=" relative my-6 lg:min-w-[550px] md:min-w-[50vw] sm:min-w-[70vw] min-w-[90vw] w-full">
                    <div className="rounded-xl shadow-lg relative flex flex-col  outline-none focus:outline-none w-full bg-white text-black" >
                        <div className="flex items-center justify-between p-4 border-b border-gray-300 rounded-t-xl px-4" >
                            <h3 className={` text-xl`}>Approve Request</h3>
                            <button
                                className="bg-transparent border-0 text-black"
                                onClick={() => handleRejectButton()}
                                disabled={loading}
                            >
                                <span className="text-black opacity-7 h-6 w-6 lg:text-2xl text-xl  py-0 rounded-full" >
                                    <i className={`${closeIcon} text-xl text-black`}></i>
                                </span>
                            </button>
                        </div>
                        <div className="relative p-3 py-5 flex lg:flex-col md:flex-col sm:flex-col flex-col justify-center">
                            <div className="flex-initial w-full p-2">

                                <div className='md:max-h-[58vh] sm:max-h-[60vh] max-h-[60vh]  overflow-scroll overflow-x-hidden ps-2 '>
                                    <div className='pe-2'>
                                        <div className='mb-2'>
                                            <label htmlFor="user_name" className="block mb-2 text-sm font-medium text-black">User Name or Wallet Address</label>
                                            <input type="text" value={currentItem.requester} disabled id="user_name" className="bg-gray-100 border border-gray-300 text-gray-600 text-sm rounded-lg  block w-full p-2.5" required />
                                        </div>
                                        <div className='mb-2'>
                                            <div className='flex justify-between'>
                                                <label className="block mb-2 text-sm font-medium text-black">Amount</label>
                                                <label className="block mb-2 text-sm font-medium text-gray-500">Balance : {getTokenBalance()}</label>
                                            </div>
                                            {/* <input type="text" value={currentItem.amount} disabled id="amount" className="bg-gray-300 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required /> */}
                                            <div className='grid sm:grid-cols-2 grid-cols-1 sm:gap-2 gap-1 mt-1'>
                                                <input type="text" value={`${currentItem.amount}`} disabled id="amount" className="bg-gray-100 border border-gray-300 text-gray-600 text-sm rounded-lg block w-full p-2.5" />
                                                <input type="text" value={`${currentItem.tokenName}`} disabled id="amount" className="bg-gray-100 border border-gray-300 text-gray-600 text-sm rounded-lg block w-full p-2.5" />
                                            </div>
                                        </div>
                                        <div className='mb-5'>

                                            {selectedPaymentType !== DIRECT_PAYMENT &&
                                                <div className='grid sm:grid-cols-2 grid-cols-1 gap-2'>
                                                    <div>
                                                        <label htmlFor="" className="block text-sm font-medium text-black my-2">Select Milestone Duration</label>
                                                        <div className="relative">


                                                            <input type="text" value={findExactMultiple(currentItem?.milestoneInterval?.toString())?.unit} disabled id="amount" className="bg-gray-100 border border-gray-300 text-gray-600 text-sm rounded-lg block w-full p-2.5" />
                                                            {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.2" stroke="currentColor" className="h-5 w-5 ml-1 absolute top-3.5 right-2.5 text-slate-700">
                                                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                                                        </svg> */}
                                                            <i className={`h-5 w-5 ml-1 absolute top-3.5 right-2.5 text-slate-700 ${chevronDownIcon}`}></i>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label htmlFor="amount" className="block text-sm font-medium  my-2">No of Milestone</label>
                                                        <input type="number"
                                                            value={Number(currentItem?.milestones)}
                                                            min={0}
                                                            disabled
                                                            id="amount"
                                                            className="bg-gray-100 border border-gray-300 text-gray-600 text-sm rounded-lg focus:outline-none block w-full p-2.5" />
                                                    </div>

                                                </div>}
                                        </div>

                                        <div className='grid grid-cols-2 gap-2'>
                                            {loading ?
                                                <div className="text-green-500 bg-gray-300  w-full focus:outline-none font-medium rounded-xl text-base px-5 py-2.5 text-center flex justify-center items-center">
                                                    <Loader size={'20px'} stroke={"white"} />
                                                </div>
                                                : <button disabled={loading} className="text-green-500 border border-green-500 hover:bg-green-500 hover:text-white  w-full focus:outline-none font-medium rounded-xl text-base px-5 py-2.5 text-center" onClick={handleAcceptButton}><i className={checkIcon}></i> Accept</button>}
                                            <button disabled={loading} className="text-red-500 border border-red-500 hover:bg-red-500 hover:text-white w-full focus:outline-none font-medium rounded-xl text-base px-5 py-2.5 text-center " onClick={handleRejectButton}><i className={closeIcon} ></i> Reject</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default ApproveRequestModal