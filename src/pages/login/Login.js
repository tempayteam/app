import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const handleLaunch = () => {
        localStorage.setItem("userData", JSON.stringify({ landing: true }));
        navigate('/home');
    };

    const features = [
        {
            icon: 'fa-solid fa-bolt',
            title: 'Direct Payments',
            description: 'Send and receive crypto payments directly on-chain with zero intermediaries.',
        },
        {
            icon: 'fa-solid fa-wallet',
            title: 'Claim & Track',
            description: 'Claim pending payments and track every transaction from one unified dashboard.',
        },
        {
            icon: 'fa-solid fa-shield-halved',
            title: 'Dispute Resolution',
            description: 'Built-in dispute mechanism with transparent arbitration secured on-chain.',
        },
    ];

    const steps = [
        { num: '01', title: 'Connect Wallet', desc: 'Link your wallet in one click using WalletConnect, MetaMask, or any supported provider.' },
        { num: '02', title: 'Send or Request', desc: 'Create direct or milestone-tracked payments with any ERC-20 token.' },
        { num: '03', title: 'Settle On-Chain', desc: 'Funds are held by the smart contract and released upon confirmation or milestone completion.' },
    ];

    const stats = [
        { label: 'Protocol', value: 'Decentralized', icon: 'fa-solid fa-diagram-project' },
        { label: 'Settlement', value: 'Instant', icon: 'fa-solid fa-bolt' },
        { label: 'Security', value: 'On-Chain', icon: 'fa-solid fa-lock' },
        { label: 'Disputes', value: 'Trustless', icon: 'fa-solid fa-scale-balanced' },
    ];

    return (
        <div className="min-h-screen bg-white text-[#111111] overflow-hidden">

            {/* ===== ANIMATED BACKGROUND ===== */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Dot grid pattern */}
                <div className="landing-grid absolute inset-0 opacity-100"></div>
                {/* Subtle orange orbs */}
                <div className="landing-orb landing-orb-1"></div>
                <div className="landing-orb landing-orb-2"></div>
                <div className="landing-orb landing-orb-3"></div>
            </div>

            <div className="relative z-10">

                {/* ===== HERO SECTION ===== */}
                <div className="relative">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
                        <div className="text-center max-w-3xl mx-auto">
                            <div
                                className="landing-hero-item"
                                style={{ animationDelay: '0.1s' }}
                            >
                                {/* Logo: orange rounded square + TempPay text */}
                                <div className="landing-float mx-auto flex items-center justify-center gap-3 mb-8">
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#F97316] flex items-center justify-center shadow-lg shadow-orange-200">
                                        <span className="text-white text-2xl sm:text-3xl font-bold">$</span>
                                    </div>
                                    <span className="text-3xl sm:text-4xl font-bold text-[#111111]">TempPay</span>
                                </div>
                            </div>

                            <div
                                className="landing-hero-item inline-flex items-center gap-2 bg-[#FFF7ED] border border-[#FED7AA] rounded-full px-5 py-2 mb-6"
                                style={{ animationDelay: '0.2s' }}
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F97316]"></span>
                                </span>
                                <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C05200]">TempPay Protocol &mdash; Live</span>
                            </div>

                            <h1
                                className="landing-hero-item text-4xl sm:text-5xl lg:text-7xl font-bold text-[#111111] mb-6 leading-[1.08] tracking-tight"
                                style={{ animationDelay: '0.35s' }}
                            >
                                On-chain payments,{' '}
                                <span className="landing-gradient-text">simplified</span>
                            </h1>

                            <p
                                className="landing-hero-item text-base sm:text-xl text-[#6B6B6B] mb-10 max-w-xl mx-auto leading-relaxed"
                                style={{ animationDelay: '0.5s' }}
                            >
                                Send, receive, and settle crypto payments with a secure, transparent flow &mdash; powered by TempPay smart contracts.
                            </p>

                            <div
                                className="landing-hero-item flex flex-col sm:flex-row items-center justify-center gap-4"
                                style={{ animationDelay: '0.65s' }}
                            >
                                <button
                                    type="button"
                                    onClick={handleLaunch}
                                    className="landing-cta-btn group relative inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-10 py-4 text-base overflow-hidden transition-colors"
                                >
                                    <span className="relative z-10 flex items-center gap-2.5">
                                        Launch App
                                        <i className="fa-solid fa-arrow-right text-sm transition-transform duration-300 group-hover:translate-x-1.5" />
                                    </span>
                                </button>
                                <a
                                    href="#how-it-works"
                                    className="inline-flex items-center gap-2 text-[#111111] hover:text-[#F97316] text-sm font-medium transition-colors duration-200"
                                >
                                    How it works
                                    <i className="fa-solid fa-chevron-down text-xs landing-bounce" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== STATS RIBBON ===== */}
                <div className="bg-[#F0EDE8]">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#E8E4DC]">
                            {stats.map((stat, i) => (
                                <div
                                    key={i}
                                    className="landing-hero-item py-6 sm:py-8 px-4 sm:px-6 text-center group"
                                    style={{ animationDelay: `${0.8 + i * 0.1}s` }}
                                >
                                    <i className={`${stat.icon} text-[#F97316] text-sm mb-2 block`}></i>
                                    <p className="text-lg sm:text-xl font-bold text-[#111111] mb-0.5">{stat.value}</p>
                                    <p className="text-[11px] font-medium uppercase tracking-widest text-[#6B6B6B]">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ===== FEATURES ===== */}
                <div className="bg-[#0A0A0A]">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
                        <div className="text-center mb-14 sm:mb-16">
                            <p className="landing-hero-item text-[11px] font-semibold tracking-[0.25em] uppercase text-[#F97316] mb-3" style={{ animationDelay: '0.15s' }}>Core Features</p>
                            <h2 className="landing-hero-item text-3xl sm:text-4xl font-bold text-white" style={{ animationDelay: '0.3s' }}>
                                Everything you need for<br className="hidden sm:block" /> crypto payments
                            </h2>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
                            {features.map((item, index) => (
                                <div
                                    key={index}
                                    className="landing-feature-card group relative rounded-2xl border border-[#EEEBE5] bg-white p-7 sm:p-8 text-center sm:text-left overflow-hidden"
                                    style={{ animationDelay: `${0.15 * index + 0.2}s` }}
                                >
                                    <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#FFF7ED] mb-5">
                                        <i className={`${item.icon} text-xl text-[#F97316] group-hover:scale-110 transition-transform duration-300`} />
                                    </div>
                                    <h3 className="relative text-lg font-semibold text-[#111111] mb-2.5">{item.title}</h3>
                                    <p className="relative text-[#6B6B6B] text-sm leading-relaxed">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ===== HOW IT WORKS ===== */}
                <div id="how-it-works" className="bg-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
                        <div className="text-center mb-14 sm:mb-16">
                            <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#F97316] mb-3">How It Works</p>
                            <h2 className="text-3xl sm:text-4xl font-bold text-[#111111]">Three steps to get started</h2>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-8 sm:gap-6 relative">
                            {/* Connecting line (desktop only) */}
                            <div className="hidden sm:block absolute top-10 left-[16.5%] right-[16.5%] h-[2px] bg-gradient-to-r from-[#F97316] via-[#FED7AA] to-[#F97316]"></div>

                            {steps.map((step, i) => (
                                <div key={i} className="landing-hero-item relative text-center" style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
                                    <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#F97316] mb-6">
                                        <span className="text-2xl font-bold text-white">{step.num}</span>
                                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#F97316] landing-pulse-dot"></div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-[#111111] mb-2">{step.title}</h3>
                                    <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ===== BOTTOM CTA ===== */}
                <div className="bg-[#0A0A0A]">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
                        <div className="relative rounded-3xl border border-gray-800 bg-[#0A0A0A] p-10 sm:p-16 text-center overflow-hidden">
                            <p className="relative text-[11px] font-semibold tracking-[0.25em] uppercase text-[#888] mb-4">Ready to begin?</p>
                            <h2 className="relative text-3xl sm:text-4xl font-bold text-white mb-4">Start using TempPay today</h2>
                            <p className="relative text-[#9B9B9B] text-base mb-8 max-w-md mx-auto">Connect your wallet and make your first on-chain payment in under a minute.</p>
                            <button
                                type="button"
                                onClick={handleLaunch}
                                className="relative landing-cta-btn group inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-10 py-4 text-base overflow-hidden transition-colors"
                            >
                                <span className="relative z-10 flex items-center gap-2.5">
                                    Get Started
                                    <i className="fa-solid fa-arrow-right text-sm transition-transform duration-300 group-hover:translate-x-1.5" />
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ===== FOOTER ===== */}
                <div className="bg-[#0A0A0A]">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-800">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#F97316] flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">$</span>
                                </div>
                                <span className="text-white font-semibold">TempPay</span>
                            </div>
                            <p className="text-[#9B9B9B] text-xs">&copy; {new Date().getFullYear()} TempPay. All rights reserved.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;
