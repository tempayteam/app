import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import ConnectWalletButton from '../../components/connectWallet/ConnectWalletButton';
import SwitchNetworkButton from '../../components/connectWallet/SwitchNetworkButton';
import { targetChainId, DIRECT_PAYMENT, TRACKED_PAYMENT } from '../../constant/constant';
import DirectPayment from './DirectPayment';
import PendingRequest from './PendingRequest';
import PendingTrackedRequest from './PendingTrackedRequest';
import TrackedPayment from './TrackedPayment';

const Pay = () => {
    const [selectedPaymentType, setSelectedPaymentType] = useState(DIRECT_PAYMENT);
    const { isConnected, chainId } = useAccount();

    return (
        <div className="crypto-page relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#F7F6F3]">
            <div className="crypto-gradient-bg" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {!isConnected ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
                        <ConnectWalletButton />
                    </div>
                ) : chainId !== targetChainId ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
                        <SwitchNetworkButton />
                    </div>
                ) : (
                    <>
                        {/* HEADER SECTION */}
                        <div className="mb-10 animate-fade-in-up">
                            <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#F97316] mb-2">Transaction Hub</p>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-[#111111] tracking-tight">
                                Send <span className="text-[#F97316]">Crypto</span>
                            </h1>
                            <p className="mt-3 text-[#6B6B6B] max-w-2xl text-lg">
                                Select your preferred method to settle payments securely on-chain.
                            </p>
                        </div>

                        {/* MODERN PAYMENT SELECTOR */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mb-12 animate-fade-in-up delay-100">
                            {/* Direct Payment Card */}
                            <button
                                onClick={() => setSelectedPaymentType(DIRECT_PAYMENT)}
                                className={`relative flex flex-col items-start p-5 rounded-2xl border transition-all duration-300 group ${selectedPaymentType === DIRECT_PAYMENT
                                        ? 'bg-[#FFF7ED] border-[#F97316] border-2 shadow-lg shadow-orange-100'
                                        : 'bg-white border-[#EEEBE5] hover:border-[#FED7AA]'
                                    }`}
                            >
                                <div className={`mb-3 p-3 rounded-xl transition-colors ${selectedPaymentType === DIRECT_PAYMENT ? 'bg-[#F97316] text-white' : 'bg-gray-100 text-[#6B6B6B] group-hover:text-[#F97316]'}`}>
                                    <i className="fas fa-bolt text-xl"></i>
                                </div>
                                <h3 className={`text-lg font-bold ${selectedPaymentType === DIRECT_PAYMENT ? 'text-[#111111]' : 'text-[#111111]'}`}>Direct Payment</h3>
                                <p className="text-sm text-[#6B6B6B] mt-1 text-left">Send funds instantly to any wallet address.</p>
                                {selectedPaymentType === DIRECT_PAYMENT && (
                                    <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-[#F97316] animate-pulse" />
                                )}
                            </button>

                            {/* Tracked Payment Card */}
                            <button
                                onClick={() => setSelectedPaymentType(TRACKED_PAYMENT)}
                                className={`relative flex flex-col items-start p-5 rounded-2xl border transition-all duration-300 group ${selectedPaymentType === TRACKED_PAYMENT
                                        ? 'bg-[#FFF7ED] border-[#F97316] border-2 shadow-lg shadow-orange-100'
                                        : 'bg-white border-[#EEEBE5] hover:border-[#FED7AA]'
                                    }`}
                            >
                                <div className={`mb-3 p-3 rounded-xl transition-colors ${selectedPaymentType === TRACKED_PAYMENT ? 'bg-[#F97316] text-white' : 'bg-gray-100 text-[#6B6B6B] group-hover:text-[#F97316]'}`}>
                                    <i className="fas fa-search-dollar text-xl"></i>
                                </div>
                                <h3 className={`text-lg font-bold ${selectedPaymentType === TRACKED_PAYMENT ? 'text-[#111111]' : 'text-[#111111]'}`}>Tracked Payment</h3>
                                <p className="text-sm text-[#6B6B6B] mt-1 text-left">Escrow-style payments with status tracking.</p>
                                {selectedPaymentType === TRACKED_PAYMENT && (
                                    <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-[#F97316] animate-pulse" />
                                )}
                            </button>
                        </div>

                        {/* PAYMENT FORMS */}
                        <div className="animate-fade-in-up delay-200">
                            {selectedPaymentType === DIRECT_PAYMENT ? (
                                <div className="space-y-10">
                                    <div className="bg-white border border-[#EEEBE5] rounded-3xl p-6 md:p-8">
                                        <DirectPayment />
                                    </div>
                                    <PendingRequest selectedPaymentType={selectedPaymentType} />
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    <div className="bg-white border border-[#EEEBE5] rounded-3xl p-6 md:p-8">
                                        <TrackedPayment />
                                    </div>
                                    <PendingTrackedRequest selectedPaymentType={selectedPaymentType} />
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Pay;