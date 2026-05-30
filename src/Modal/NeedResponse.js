import React, { useEffect, useState } from 'react';
import { CPGABI } from '../ABI/ABI';
import Loader from '../components/loader/Loader';
import { CPGAddress } from '../constant/constant';
import { checkIcon, closeIcon, copyIcon } from '../constant/icon';
import { DISPUTE_RESOLVED_SUCCESS, TRANSACTION_ERROR_MSG, USER_REJECT_TRANSACTION_MSG } from '../constant/toasterMessage';
import { copyToClipboard, fireErrorToast, fireSuccessToast, shortenWalletAddress } from '../utils/commonFunction';
import { ContractWrite } from '../utils/contractInstance';


const NeedResponse = ({ setNeedResponseModal, currentItem, setCurrentItem, getPendingDispute }) => {

    const [loading, setLoading] = useState(false)
    const [rejectLoading, setRejectLoading] = useState(false)
    // const [isAccept, setIsAccept] = useState(true)

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
        setRejectLoading(false)
    }

    // **********************************************************Direct Payment********************************************************************* //

    const { writeContract: resolveDispute, writeSuccessResponse: resolveDisputeResponse, writeErrorResponse: resolveDisputeErrorResponse } = ContractWrite({ address: CPGAddress, abi: CPGABI, functionName: 'resolveDispute', initialArgs: [currentItem.id, true], enabled: true });



    const updateArgument = (isAccept) => {
        resolveDispute({
            abi: CPGABI,
            address: CPGAddress,
            functionName: 'resolveDispute',
            args: [currentItem.id, isAccept]
        })
    }

    useEffect(() => {
        if (resolveDisputeResponse) {
            setLoading(false)
            setRejectLoading(false)
            setCurrentItem(null)
            setNeedResponseModal(false)
            fireSuccessToast(DISPUTE_RESOLVED_SUCCESS)
            getPendingDispute()
        }
        // eslint-disable-next-line
    }, [resolveDisputeResponse])


    useEffect(() => {
        if (resolveDisputeErrorResponse) {
            onWriteError(resolveDisputeErrorResponse);
        }
        // eslint-disable-next-line
    }, [resolveDisputeErrorResponse]);

    // **********************************************************Direct Payment********************************************************************* //


    const handleAccept = () => {
        try {
            setLoading(true)
            updateArgument(true)
            resolveDispute({
                abi: CPGABI,
                address: CPGAddress,
                functionName: 'resolveDispute',
                args: [currentItem.id, true]
            })

            // resolveDispute()
        } catch (error) {

        }

    }

    const handleReject = () => {
        setRejectLoading(true)
        resolveDispute({
            abi: CPGABI,
            address: CPGAddress,
            functionName: 'resolveDispute',
            args: [currentItem.id, false]
        })
    }

    const handleClose = () => {
        setNeedResponseModal(false)
        setCurrentItem(null)
    }



    return (
        <div tabIndex='-1' className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none backdrop-brightness-50">
            <div className="mx-5">
                <div className="relative my-6 lg:w-[550px] md:w-[500px] sm:w-[400px] w-[95vw]">
                    <div className="rounded-xl shadow-lg relative flex flex-col outline-none focus:outline-none w-full bg-white text-black">
                        <div className="flex items-center justify-between p-4 border-b border-gray-300 rounded-t-xl px-4">
                            <h3 className="text-xl">Dispute #{currentItem.id}</h3>
                            <button
                                className="bg-transparent border-0 text-white"
                                onClick={() => handleClose()}
                                disabled={loading || rejectLoading}
                            >
                                <span className="text-white opacity-7 h-6 w-6 lg:text-2xl text-xl py-0 rounded-full">
                                    <i className={`${closeIcon} text-xl text-black`}></i>
                                </span>
                            </button>
                        </div>
                        <div className="relative p-3 py-5 flex lg:flex-col md:flex-col sm:flex-col flex-col justify-center">
                            <div className="flex-initial w-full p-2">

                                <div className='md:max-h-[58vh] max-h-[60vh] overflow-scroll overflow-x-hidden pb-3 '>
                                    <div className='me-2'>
                                        <div className='flex sm:flex-row flex-col justify-between'>
                                            <div className='w-44 sm:mt-0 mt-3'>
                                                <p>Raised By</p>
                                                <p className='text-2xl'>
                                                    {shortenWalletAddress(currentItem.raisedBy)}
                                                    <i className={`${copyIcon} ms-2 text-xl cursor-pointer`} onClick={copyToClipboard}></i>
                                                </p>
                                            </div>
                                            <div className='sm:mt-0 mt-3'>
                                                <p>Raised Against</p>
                                                <p className='text-2xl'>
                                                    {shortenWalletAddress(currentItem.raisedAgainst)}
                                                    <i className={`${copyIcon} ms-2 text-xl cursor-pointer`} onClick={copyToClipboard}></i>

                                                </p>
                                            </div>
                                        </div>
                                        <div className='flex  sm:flex-row flex-col  justify-between mt-5'>
                                            <div className=''>
                                                <p>Total Amount</p>
                                                <p className='text-2xl'>{currentItem.amount}</p>
                                            </div>
                                            <div className='w-44'>
                                                <p>Claimed Amount</p>
                                                <p className='text-2xl'>{currentItem.claimedAmount}</p>
                                            </div>

                                        </div>
                                        <div className='flex  sm:flex-row flex-col  justify-between mt-5'>
                                            <div className=''>
                                                <p>Dispute Date</p>
                                                <p className='text-2xl'>{currentItem.raisedDate}</p>
                                            </div>
                                            <div className='w-44'>
                                                <p>Due Date</p>
                                                <p className='text-2xl'>{currentItem.dueDate}</p>
                                            </div>
                                        </div>
                                        {/* <div className='mt-5 '>
                                            <p>Reason :</p>
                                            <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iusto, quaerat amet. Laudantium rerum fugit officiis enim velit, ipsum, tenetur deserunt totam obcaecati quo in quasi ratione alias quod illum. Commodi.</p>
                                        </div> */}
                                        <div className='grid sm:grid-cols-2 grid-cols-1 mt-5 gap-2'>
                                            {loading ?
                                                <div className=" bg-green-500  w-full  rounded-xl text-base px-5 py-2.5 text-center flex justify-center items-center">
                                                    <Loader size={"20px"} stroke={"white"} />
                                                </div>
                                                : <button type="submit" className="border border-green-500 text-green-500 hover:text-white hover:bg-green-500   w-full focus:outline-none font-medium rounded-xl text-base px-5 py-2.5 text-center" onClick={handleAccept} disabled={loading || rejectLoading}><i className={checkIcon}></i> Accept</button>}
                                            {rejectLoading ?
                                                <div className=" bg-red-500  w-full  rounded-xl text-base px-5 py-2.5 text-center flex justify-center items-center">
                                                    <Loader size={"20px"} stroke={"white"} />
                                                </div>
                                                :
                                                <button type="submit" className="border border-red-500 text-red-500 hover:text-white hover:bg-red-500   w-full focus:outline-none font-medium rounded-xl text-base px-5 py-2.5 text-center " onClick={handleReject} disabled={loading || rejectLoading} ><i className={closeIcon} ></i> Reject</button>}
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

export default NeedResponse