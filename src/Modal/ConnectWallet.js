import React, { useContext } from 'react'
import { useAccount, useConnect, useSwitchChain } from 'wagmi'
import { targetChainId, WalletAddressContext } from '../constant/constant'
import { closeIcon } from '../constant/icon'
import metamaskWallet from './walletImages/metamask.png'
import walletConnectLogo from './walletImages/walletConnect.png'

const ConnectWallet = ({ setConnectWalletModal }) => {
    const { setWalletAddress } = useContext(WalletAddressContext)
    const { address, chainId } = useAccount()

    const { connect, connectors, isLoading, pendingConnector } = useConnect({
        onSuccess(data) {
            if (chainId !== targetChainId) {
                switchNetwork(targetChainId);
            }
            setWalletAddress(address)
            setConnectWalletModal(false)
        },
    });

    const { switchNetwork } = useSwitchChain({
        onSuccess() {
            setConnectWalletModal(false)
        }
    })

    // Map images to connector IDs or indexes
    const walletImages = {
        'metaMask': metamaskWallet,
        'walletConnect': walletConnectLogo
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all animate-fade-in">
            {/* BACKDROP */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setConnectWalletModal(false)}
            />

            {/* MODAL CONTAINER */}
            <div className="relative w-full max-w-md transform transition-all animate-fade-in-up">
                <div className="overflow-hidden rounded-3xl border border-[#EEEBE5] bg-white shadow-2xl">

                    {/* HEADER */}
                    <div className="flex items-center justify-between border-b border-[#EEEBE5] p-5 bg-[#F7F6F3]">
                        <div>
                            <h3 className="text-xl font-bold text-[#111111]">Connect Wallet</h3>
                            <p className="text-xs text-[#9B9B9B] mt-0.5">Select your preferred provider</p>
                        </div>
                        <button
                            className="p-2 rounded-xl bg-white text-[#9B9B9B] hover:text-[#F97316] hover:bg-[#FFF7ED] transition-all border border-[#EEEBE5]"
                            onClick={() => setConnectWalletModal(false)}
                        >
                            <i className={`${closeIcon} text-lg`}></i>
                        </button>
                    </div>

                    {/* WALLET LIST */}
                    <div className="p-6 space-y-4">
                        {connectors.map((connector) => {
                            const isConnecting = isLoading && connector.id === pendingConnector?.id;

                            return (
                                <button
                                    key={connector.id}
                                    onClick={() => connect({ connector })}
                                    disabled={isConnecting}
                                    className={`group relative flex w-full items-center justify-between rounded-2xl border p-4 transition-all duration-300
                                        ${isConnecting
                                            ? 'border-[#F97316] bg-[#FFF7ED] ring-1 ring-[#F97316]'
                                            : 'border-[#EEEBE5] bg-white hover:border-[#FED7AA] hover:bg-[#FFF7ED]'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img
                                                className="h-10 w-10 object-contain rounded-lg"
                                                src={walletImages[connector.id] || metamaskWallet}
                                                alt={connector.name}
                                            />
                                            {isConnecting && (
                                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F97316]"></span>
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <span className="block text-sm font-bold text-[#111111] group-hover:text-[#F97316] transition-colors">
                                                {connector.name}
                                            </span>
                                            <span className="block text-[10px] text-[#9B9B9B] font-medium uppercase tracking-tight">
                                                {isConnecting ? 'Waiting for approval...' : 'Available'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-[#9B9B9B] group-hover:text-[#F97316] transition-all">
                                        {isConnecting ? (
                                            <div className="h-5 w-5 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <i className="fas fa-chevron-right text-xs"></i>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* FOOTER */}
                    <div className="bg-[#F7F6F3] p-4 border-t border-[#EEEBE5] text-center">
                        <p className="text-[10px] text-[#9B9B9B] font-medium leading-relaxed">
                            By connecting, you agree to the <br />
                            <span className="text-[#F97316] cursor-pointer hover:underline">Terms of Service</span> and <span className="text-[#F97316] cursor-pointer hover:underline">Privacy Policy</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConnectWallet