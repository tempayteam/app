import React, { useState } from 'react'
import { clockIcon } from '../../constant/icon'

const LiveChat = () => {
    const [chatStarted, setChatStarted] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, from: 'support', text: 'Hello! Welcome to TempPay Support. How can I help you today?', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);

    const handleSendMessage = () => {
        if (!message.trim()) return;
        const newMsg = {
            id: messages.length + 1,
            from: 'user',
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([...messages, newMsg]);
        setMessage('');

        // Simulated auto-reply
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: prev.length + 1,
                from: 'support',
                text: 'Thank you for reaching out. A support agent will be with you shortly. In the meantime, please describe your issue in detail.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 1500);
    };

    if (!chatStarted) {
        return (
            <div className='max-w-xl mx-auto mt-8 animate-fade-in-up'>
                <div className='glass-card rounded-2xl overflow-hidden'>
                    <div className='p-6 text-center'>
                        <div className='w-16 h-16 rounded-full bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center mx-auto mb-5'>
                            <i className="fa-solid fa-headset text-2xl text-[#F97316]"></i>
                        </div>
                        <h3 className='text-xl font-semibold text-[#111111] mb-2'>Live Support Chat</h3>
                        <p className='text-[#6B6B6B] text-sm mb-6 max-w-sm mx-auto'>
                            Chat directly with our support team for quick assistance with payments, disputes, or account issues.
                        </p>

                        <button
                            className='bg-[#F97316] hover:bg-[#EA580C] text-white font-medium rounded-xl px-8 py-3 text-base transition-all shadow-lg shadow-orange-200'
                            onClick={() => setChatStarted(true)}
                        >
                            <i className="fa-solid fa-comments mr-2"></i>
                            Start Chat
                        </button>

                        <div className='mt-8 glass-card rounded-xl p-4'>
                            <div className='flex items-center gap-3'>
                                <div className='w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center'>
                                    <i className={`${clockIcon} text-green-400 text-sm`}></i>
                                </div>
                                <div className='text-left'>
                                    <p className='text-xs text-[#9B9B9B]'>Chat Working Hours</p>
                                    <p className='text-sm text-[#6B6B6B]'>Monday – Friday, 10:00 AM – 7:00 PM EST</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='max-w-xl mx-auto mt-8 animate-fade-in-up'>
            <div className='glass-card rounded-2xl overflow-hidden flex flex-col' style={{ height: '500px' }}>
                {/* Chat Header */}
                <div className='p-4 border-b border-[#EEEBE5] flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='w-9 h-9 rounded-full bg-[#FFF7ED] flex items-center justify-center'>
                            <i className="fa-solid fa-headset text-[#F97316]"></i>
                        </div>
                        <div>
                            <p className='text-sm font-semibold text-[#111111]'>TempPay Support</p>
                            <div className='flex items-center gap-1.5'>
                                <span className='w-2 h-2 rounded-full bg-green-400 animate-pulse'></span>
                                <span className='text-xs text-green-400'>Online</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setChatStarted(false)} className='text-[#9B9B9B] hover:text-[#6B6B6B] transition-colors text-sm'>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* Messages */}
                <div className='flex-1 overflow-y-auto p-4 space-y-4'>
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                                msg.from === 'user'
                                    ? 'bg-[#F97316] text-white rounded-br-md'
                                    : 'bg-white text-[#111111] rounded-bl-md border border-[#EEEBE5]'
                            }`}>
                                <p className='text-sm'>{msg.text}</p>
                                <p className={`text-[10px] mt-1 ${msg.from === 'user' ? 'text-orange-100' : 'text-[#9B9B9B]'}`}>{msg.time}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className='p-3 border-t border-[#EEEBE5]'>
                    <div className='flex gap-2'>
                        <input
                            type='text'
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder='Type your message...'
                            className='flex-1 bg-white border border-[#EEEBE5] text-[#111111] placeholder-[#9B9B9B] text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 px-4 py-2.5'
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!message.trim()}
                            className='bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 transition-all'
                        >
                            <i className="fa-solid fa-paper-plane text-sm"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LiveChat
