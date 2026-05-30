import React, { useEffect, useState } from 'react';
import { CPGABI } from '../ABI/ABI';
import Loader from '../components/loader/Loader';
import { CPGAddress } from '../constant/constant';
import { closeIcon } from '../constant/icon';
import { CLAIM_SUCCESS_MSG } from '../constant/toasterMessage';
import { fireSuccessToast } from '../utils/commonFunction';
import { ContractWrite } from '../utils/contractInstance';

const ClaimPayment = ({ setClaimModal, paymentId, setPaymentId, onWriteError, onWriteSuccess, getData, paymentType, getReceiveLockedPaymentData }) => {

    const [loading, setLoading] = useState()
    // **********************************************************Direct Payment********************************************************************* //

    const { writeContract: claimDirectPayment, writeSuccessResponse: claimDirectPaymentResponse, writeErrorResponse: claimDirectPaymentErrorResponse } = ContractWrite({ address: CPGAddress, abi: CPGABI, functionName: 'claimDirectPayment', initialArgs: [paymentId?.toString()] });

    useEffect(() => {
        if (claimDirectPaymentResponse) {
            setPaymentId(null)
            setClaimModal(false)
            setLoading(false)
            fireSuccessToast(CLAIM_SUCCESS_MSG)
            getData()
        }
        // eslint-disable-next-line
    }, [claimDirectPaymentResponse])


    useEffect(() => {
        if (claimDirectPaymentErrorResponse) {
            onWriteError(claimDirectPaymentErrorResponse);
            setLoading(false)
        }
        // eslint-disable-next-line
    }, [claimDirectPaymentErrorResponse]);
    // **********************************************************Direct Payment********************************************************************* //

    // **********************************************************Locked Payment********************************************************************* //

    const { writeContract: claimLockedPayment, writeSuccessResponse: claimLockedPaymentResponse, writeErrorResponse: claimLockedPaymentErrorResponse } = ContractWrite({ address: CPGAddress, abi: CPGABI, functionName: 'claimLockedPayment', initialArgs: [paymentId?.toString()] });

    useEffect(() => {
        if (claimLockedPaymentResponse) {
            setPaymentId(null)
            setClaimModal(false)
            setLoading(false)
            fireSuccessToast(CLAIM_SUCCESS_MSG)
            getData()
            getReceiveLockedPaymentData()
        }
        // eslint-disable-next-line
    }, [claimLockedPaymentResponse])


    useEffect(() => {
        if (claimLockedPaymentErrorResponse) {
            onWriteError(claimLockedPaymentErrorResponse);
            setLoading(false)
        }
        // eslint-disable-next-line
    }, [claimLockedPaymentErrorResponse]);
    // **********************************************************Locked Payment********************************************************************* //



    const handleClaim = () => {
        try {
            setLoading(true)
            if (paymentType === "DirectPayment") {
                claimDirectPayment({
                    abi: CPGABI,
                    address: CPGAddress,
                    functionName: 'claimDirectPayment',
                    args: [
                        paymentId?.toString()
                    ]
                })
            } else if (paymentType === "LockedPayment") {
                claimLockedPayment(
                    {
                        abi: CPGABI,
                        address: CPGAddress,
                        functionName: 'claimLockedPayment',
                        args: [
                            paymentId?.toString()
                        ]
                    }
                )
            }
        } catch (error) {
            setLoading(false)
        }
    }

    const handleCloseModal = () => {
        setClaimModal(false)
    }

    // **********************************************************Direct Payment********************************************************************* //
    return (
        <div tabIndex='-1' className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none backdrop-brightness-50">
            <div className="mx-5">
                <div className="relative my-6 lg:min-w-[350px] md:min-w-[50vw] sm:min-w-[70vw] min-w-[90vw] w-full">
                    <div className="rounded-xl shadow-lg relative flex flex-col outline-none focus:outline-none w-full bg-white text-black">
                        <div className="flex items-center justify-between p-4 border-b border-gray-300 rounded-t-xl px-4">
                            <h3 className="text-xl text-black">Claim Payment</h3>
                            <button
                                className="bg-transparent border-0 text-white"
                                onClick={() => setClaimModal(false)}
                                disabled={loading}
                            >
                                <span className="text-white opacity-7 h-6 w-6 lg:text-2xl text-xl py-0 rounded-full">
                                    <i className={`${closeIcon} text-xl text-black`}></i>
                                </span>
                            </button>
                        </div>
                        <div className="relative p-3 py-5 flex lg:flex-col md:flex-col sm:flex-col flex-col justify-center">
                            <div className="flex-initial w-full p-2">
                                <p className='text-center'>Are you sure want to Claim ?</p>
                                <div className='flex gap-2 mt-5'>
                                    {loading ?
                                        <div className='bg-green-500 rounded-xl px-4 py-2 w-full flex justify-center items-center'><Loader size={'20px'} stroke={"white"} /></div>
                                        : <button className='border border-green-500 hover:bg-green-500 text-green-500 hover:text-white rounded-xl px-4 py-2 w-full' onClick={handleClaim} disabled={loading}>Yes</button>}
                                    <button className='border border-red-500 hover:bg-red-500 text-red-500 hover:text-white rounded-xl px-4 py-2 w-full' disabled={loading} onClick={handleCloseModal}>No</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ClaimPayment