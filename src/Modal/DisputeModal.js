import React, { useEffect, useState } from 'react';
import { CPGABI } from '../ABI/ABI';
import Loader from '../components/loader/Loader';
import { CPGAddress } from '../constant/constant';
import { closeIcon } from '../constant/icon';
import { DISPUTE_RAISE_SUCCESSFULLY, TRANSACTION_ERROR_MSG, USER_REJECT_TRANSACTION_MSG } from '../constant/toasterMessage';
import { fireErrorToast, fireSuccessToast } from '../utils/commonFunction';
import { ContractWrite } from '../utils/contractInstance';

const DisputeModal = ({ setDisputeModal, currentItem, setCurrentItem, getData, getSendLockedPaymentData, getReceiveLockedPaymentData }) => {

    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedName, setSelectedName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false)

    //******************************************************************** Smart Contract Call ************************************************************************//
    const { writeContract: raiseDispute, writeSuccessResponse: raiseDisputeResponse, writeErrorResponse: raiseDisputeErrorResponse } = ContractWrite({ address: CPGAddress, abi: CPGABI, functionName: 'raiseDispute', initialArgs: [currentItem?.id?.toString()], enabled: true });

    const handleChange = (e) => {
        setDescription(e.target.value)
    }

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
        if (raiseDisputeResponse) {
            setDisputeModal(false)
            setLoading(false)
            setCurrentItem({})
            fireSuccessToast(DISPUTE_RAISE_SUCCESSFULLY)
            getData()
            getSendLockedPaymentData()
            getReceiveLockedPaymentData()
        }
        // eslint-disable-next-line
    }, [raiseDisputeResponse]);

    useEffect(() => {
        if (raiseDisputeErrorResponse) {
            onWriteError(raiseDisputeErrorResponse);
        }
        // eslint-disable-next-line
    }, [raiseDisputeErrorResponse]);
    //******************************************************************** Smart Contract Call ************************************************************************//

    const handleAcceptButton = () => {
        try {
            setLoading(true)
            raiseDispute({
                abi: CPGABI,
                address: CPGAddress,
                functionName: 'raiseDispute',
                args: [
                    currentItem?.id?.toString()
                ],
            })
        } catch (error) {

        } finally {


        }
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setSelectedName(file.name);
        }
        // Additional validation logic
    };

    return (
        <div tabIndex='-1' className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none backdrop-brightness-50">
            <div className="mx-5">
                <div className="relative my-6 lg:min-w-[550px] md:min-w-[50vw] sm:min-w-[70vw] min-w-[90vw] w-full">
                    <div className="glass-card rounded-2xl shadow-2xl relative flex flex-col outline-none focus:outline-none w-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-700/80 rounded-t-2xl">
                            <div className='flex items-center gap-3'>
                                <div className='w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center'>
                                    <i className="fa-solid fa-gavel text-red-400"></i>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-100">Raise Dispute</h3>
                            </div>
                            <button
                                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
                                onClick={() => setDisputeModal(false)}
                            >
                                <i className={`${closeIcon} text-sm text-slate-400`}></i>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5">
                            <div className="md:max-h-[58vh] sm:max-h-[60vh] max-h-[60vh] overflow-y-auto overflow-x-hidden space-y-5 pe-1">
                                {/* Payment ID */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-slate-300">Payment ID</label>
                                    <input
                                        type="text"
                                        value={currentItem.id}
                                        disabled
                                        className="bg-slate-900/80 border border-slate-700 text-slate-400 text-sm rounded-xl block w-full p-3 cursor-not-allowed"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-slate-300">Description <span className='text-red-400'>*</span></label>
                                    <textarea
                                        value={description}
                                        rows={4}
                                        placeholder="Describe the issue with this payment..."
                                        className="bg-white border border-[#EEEBE5] text-[#111111] placeholder-[#9B9B9B] text-sm rounded-xl block w-full p-3 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] resize-none transition-all"
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* File Upload */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-slate-300">Attachment (optional)</label>
                                    <div className="relative border-2 border-dashed border-[#EEEBE5] hover:border-[#F97316] rounded-xl p-5 text-center transition-colors cursor-pointer group">
                                        <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <div className='flex flex-col items-center gap-2'>
                                            <div className='w-10 h-10 rounded-full bg-[#FFF7ED] group-hover:bg-[#FFF7ED] flex items-center justify-center transition-colors'>
                                                <i className="fa-solid fa-cloud-arrow-up text-[#F97316] transition-colors"></i>
                                            </div>
                                            <p className='text-sm text-slate-400'>Click to upload a file</p>
                                        </div>
                                    </div>
                                    {selectedFile && (
                                        <div className='mt-2 flex items-center gap-2 bg-[#FFF7ED] border border-[#FED7AA] rounded-lg px-3 py-2'>
                                            <i className="fa-solid fa-paperclip text-[#F97316] text-xs"></i>
                                            <span className='text-sm text-[#C05200] truncate flex-1'>{selectedName}</span>
                                            <button onClick={() => { setSelectedFile(null); setSelectedName(''); }} className='text-slate-400 hover:text-red-400 transition-colors'>
                                                <i className="fa-solid fa-xmark text-xs"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div>
                                    {loading ? (
                                        <div className="flex justify-center items-center bg-slate-800 w-full rounded-xl py-3">
                                            <Loader size={"20px"} stroke={"white"} />
                                        </div>
                                    ) : (
                                        <button
                                            className="w-full bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl text-base px-5 py-3 text-center transition-all shadow-lg shadow-orange-200"
                                            disabled={!description}
                                            onClick={handleAcceptButton}
                                        >
                                            <i className="fa-solid fa-gavel mr-2"></i>
                                            Submit Dispute
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DisputeModal
