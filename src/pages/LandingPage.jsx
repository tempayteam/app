import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    const handleLaunchApp = () => {
        navigate('/home');
    };

    return (
        <div className="relative min-h-[calc(100vh-80px)] bg-[#F7F6F3]">
            <div className="crypto-gradient-bg opacity-20" />
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in">
                    <div className="text-center max-w-2xl mx-auto space-y-4">
                        <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#F97316]">
                            TempPay Protocol
                        </p>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-[#111111] tracking-tight leading-tight">
                            Direct Crypto{' '}
                            <span className="text-[#F97316]">
                                Payments
                            </span>
                        </h1>
                        <p className="text-[#6B6B6B] text-lg">
                            Manage your on-chain revenue, settle invoices, and
                            resolve disputes seamlessly.
                        </p>
                    </div>

                    <button
                        onClick={handleLaunchApp}
                        className="group relative px-8 py-4 bg-[#F97316] text-white font-bold rounded-xl text-lg hover:bg-[#EA580C] transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-200"
                    >
                        <span className="flex items-center gap-3">
                            Launch App
                            <svg
                                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                />
                            </svg>
                        </span>
                    </button>

                    {/* Feature highlights */}
                    <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
                        {[
                            {
                                icon: '🔒',
                                title: 'Secure & Trustless',
                                desc: 'All transactions are secured by blockchain technology',
                            },
                            {
                                icon: '⚡',
                                title: 'Instant Settlement',
                                desc: 'Receive payments directly to your wallet in seconds',
                            },
                            {
                                icon: '🛡️',
                                title: 'Dispute Resolution',
                                desc: 'Built-in mechanism for handling payment disputes',
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="glass-card border border-[#EEEBE5] bg-white p-6 rounded-2xl text-center"
                            >
                                <div className="text-3xl mb-3">
                                    {feature.icon}
                                </div>
                                <h3 className="text-[#111111] font-semibold mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-[#6B6B6B] text-sm">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
