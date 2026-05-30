import React, { useState } from 'react'
import { supportCategories } from '../../config/data';
import { fireSuccessToast, fireErrorToast } from '../../utils/commonFunction';
import Loader from '../../components/loader/Loader';


const SendMessage = () => {

    const [sendmessage, setSendMessage] = useState({ email: '', category: '', description: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedName, setSelectedName] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setSendMessage({ ...sendmessage, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!sendmessage.email || !sendmessage.description) {
            fireErrorToast('Please fill in all required fields.');
            return;
        }
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
            fireSuccessToast('Your support request has been submitted successfully!');
        }, 1500);
    };

    const handleReset = () => {
        setSendMessage({ email: '', category: '', description: '' });
        setSelectedFile(null);
        setSelectedName("");
        setSubmitted(false);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setSelectedName(file.name);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setSelectedName("");
    };

    const inputClass = "bg-white border border-[#EEEBE5] text-[#111111] placeholder-[#9B9B9B] text-base rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] block w-full p-2.5";
    const labelClass = "block mb-2 text-sm font-medium text-[#6B6B6B]";

    if (submitted) {
        return (
            <div className='max-w-xl mx-auto mt-8 animate-fade-in-up'>
                <div className='glass-card rounded-2xl p-8 text-center'>
                    <div className='w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-5'>
                        <i className="fa-solid fa-check text-2xl text-green-400"></i>
                    </div>
                    <h3 className='text-xl font-semibold text-[#111111] mb-2'>Request Submitted!</h3>
                    <p className='text-[#6B6B6B] text-sm mb-2'>Your support ticket has been created successfully.</p>
                    <p className='text-[#9B9B9B] text-xs mb-6'>We'll review your request and get back to you at <span className='text-[#F97316]'>{sendmessage.email}</span> within 24-48 hours.</p>

                    <div className='glass-card rounded-xl p-4 mb-6 text-left'>
                        <div className='flex items-center gap-3 mb-3'>
                            <div className='w-8 h-8 rounded-lg bg-[#FFF7ED] flex items-center justify-center'>
                                <i className="fa-solid fa-ticket text-[#F97316] text-sm"></i>
                            </div>
                            <div>
                            <p className='text-xs text-[#9B9B9B]'>Ticket ID</p>
                            <p className='text-sm text-[#111111] font-mono'>#{Date.now().toString(36).toUpperCase()}</p>
                            </div>
                        </div>
                        <div className='h-px bg-[#EEEBE5] my-3'></div>
                        <div className='space-y-2'>
                            <div className='flex justify-between'>
                                <span className='text-xs text-[#9B9B9B]'>Status</span>
                                <span className='text-xs font-medium text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full'>Pending Review</span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='text-xs text-[#9B9B9B]'>Priority</span>
                                <span className='text-xs text-[#6B6B6B]'>Normal</span>
                            </div>
                            {selectedName && (
                                <div className='flex justify-between'>
                                    <span className='text-xs text-[#9B9B9B]'>Attachment</span>
                                    <span className='text-xs text-[#F97316]'>{selectedName}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleReset}
                        className='bg-[#F97316] hover:bg-[#EA580C] text-white font-medium rounded-xl text-sm px-6 py-2.5 transition-all'
                    >
                        Submit Another Request
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className='max-w-xl mx-auto mt-8 animate-fade-in-up'>
            <div className='glass-card rounded-2xl overflow-hidden'>
                <div className='p-4 border-b border-[#EEEBE5]'>
                    <h3 className='text-lg font-medium text-[#111111]'>Describe Your Issue</h3>
                    <p className='text-xs text-[#9B9B9B] mt-1'>Fill out the form below and our team will review your request.</p>
                </div>
                <form onSubmit={handleSubmit} className='p-5 space-y-4'>
                    <div>
                        <label htmlFor="email" className={labelClass}>Email <span className='text-red-400'>*</span></label>
                        <input
                            type="email"
                            name='email'
                            id='email'
                            placeholder='your@email.com'
                            value={sendmessage.email}
                            onChange={handleChange}
                            className={inputClass}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="category" className={labelClass}>Category</label>
                        <select
                            name="category"
                            id="category"
                            value={sendmessage.category}
                            onChange={handleChange}
                            className={inputClass + " appearance-none cursor-pointer"}
                        >
                            <option value="" className="bg-white">Select Support Category</option>
                            {supportCategories.map((topic) => (
                                <optgroup key={topic.id} label={topic.category} className="bg-white">
                                    {topic.subcategories.map((sub, index) => (
                                        <option key={index} value={sub.value} className="bg-white">
                                            {sub.label}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="description" className={labelClass}>Description <span className='text-red-400'>*</span></label>
                        <textarea
                            name='description'
                            id='description'
                            placeholder='Please describe your issue in detail...'
                            value={sendmessage.description}
                            onChange={handleChange}
                            rows={4}
                            className={inputClass + " min-h-[100px] resize-none"}
                            required
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Attachment <span className='text-[#9B9B9B]'>(optional)</span></label>
                        {selectedFile ? (
                            <div className='flex items-center justify-between p-3 rounded-xl border border-[#EEEBE5] bg-[#F7F6F3]'>
                                <div className='flex items-center gap-3 min-w-0'>
                                    <div className='w-9 h-9 rounded-lg bg-[#FFF7ED] flex items-center justify-center flex-shrink-0'>
                                        <i className="fa-solid fa-file text-[#F97316] text-sm"></i>
                                    </div>
                                    <span className='text-sm text-[#6B6B6B] truncate'>{selectedName}</span>
                                </div>
                                <button type="button" onClick={handleRemoveFile} className='text-[#9B9B9B] hover:text-red-400 transition-colors p-1'>
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        ) : (
                            <div className="parent border border-[#EEEBE5] border-dashed rounded-xl bg-[#F7F6F3] hover:bg-[#FFF7ED] hover:border-[#F97316] transition-all">
                                <div className="file-upload flex flex-col items-center w-full py-5">
                                    <div className='w-10 h-10 rounded-full bg-[#FFF7ED] flex items-center justify-center mb-2'>
                                        <i className="fa-solid fa-cloud-arrow-up text-[#F97316]"></i>
                                    </div>
                                    <p className='text-sm text-[#6B6B6B]'>Click to upload a file</p>
                                    <p className='text-xs text-[#9B9B9B] mt-1'>PNG, JPG, PDF (max 10MB)</p>
                                    <input type="file" onChange={handleFileChange} accept=".png,.jpg,.jpeg,.pdf,.doc,.docx" />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className='pt-2'>
                        {loading ? (
                            <div className="flex justify-center items-center bg-[#FFF7ED] w-full font-medium rounded-xl text-base px-5 py-2.5">
                                <Loader stroke="#F97316" size="20px" />
                            </div>
                        ) : (
                            <button
                                type="submit"
                                className="bg-[#F97316] hover:bg-[#EA580C] w-full text-white font-medium rounded-xl text-base px-5 py-2.5 text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!sendmessage.email || !sendmessage.description}
                            >
                                Submit Request
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default SendMessage
