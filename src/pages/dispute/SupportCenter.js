import React, { useState } from 'react';
import { leftArrowIcon, liveChatIcon, sendMessageIcon } from '../../constant/icon';
import SendMessage from './SendMessage';
import LiveChat from './LiveChat';
import { useNavigate } from 'react-router-dom';

const SupportCenter = () => {
    const [activeSection, setActiveSection] = useState('sendMessage');

    const navigate = useNavigate()

    return (
        <div className="crypto-page relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#F7F6F3]">
            <div className="crypto-gradient-bg opacity-30" />
            <div className='relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
                <div className='flex items-center justify-between mb-8'>
                    <button
                        className='flex items-center gap-2 px-4 py-2 rounded-xl border border-[#EEEBE5] text-[#6B6B6B] hover:bg-[#FFF7ED] hover:text-[#F97316] transition-all'
                        onClick={() => navigate('/dispute')}
                    >
                        <i className={`${leftArrowIcon} text-lg`}></i>
                        <span className='text-sm font-medium hidden sm:inline'>Back</span>
                    </button>
                    <h1 className='text-2xl sm:text-3xl font-semibold text-[#111111]'>Support Center</h1>
                    <div className='w-20'></div>
                </div>

                <div className='flex gap-3 mb-8'>
                    <button
                        onClick={() => setActiveSection('sendMessage')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border
                            ${activeSection === 'sendMessage'
                                ? 'bg-[#F97316] text-white border-[#F97316] shadow-lg shadow-orange-200'
                                : 'bg-white text-[#6B6B6B] border-[#EEEBE5] hover:bg-[#FFF7ED] hover:text-[#F97316]'}`}
                    >
                        <i className={sendMessageIcon}></i> Send Message
                    </button>
                    <button
                        onClick={() => setActiveSection('liveChat')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border
                            ${activeSection === 'liveChat'
                                ? 'bg-[#F97316] text-white border-[#F97316] shadow-lg shadow-orange-200'
                                : 'bg-white text-[#6B6B6B] border-[#EEEBE5] hover:bg-[#FFF7ED] hover:text-[#F97316]'}`}
                    >
                        <i className={liveChatIcon}></i> Live Chat
                    </button>
                </div>

                {activeSection === 'sendMessage' && <SendMessage />}
                {activeSection === 'liveChat' && <LiveChat />}
            </div>
        </div>
    );
};

export default SupportCenter;
