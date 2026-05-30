import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { shortenWalletAddress, copyToClipboard } from '../utils/commonFunction';
import { copyIcon } from '../constant/icon';

const Profile = () => {
    const { isConnected, address } = useAccount();
    const { connect, connectors, isPending } = useConnect();
    const { disconnect } = useDisconnect();

    if (!isConnected) {
        return (
            <div className="flex gap-2">
                {connectors.slice(0, 1).map((connector) => (
                    <button
                        key={connector.uid || connector.id}
                        onClick={() => connect({ connector })}
                        disabled={isPending}
                        className="rounded-xl bg-[#F97316] hover:bg-[#EA580C] px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
                    >
                        {isPending ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-[20px] bg-[#FFF7ED] px-3 py-1.5 sm:px-4 sm:py-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-[#F97316]" aria-hidden />
                <span className="text-sm font-medium text-[#C05200]">{shortenWalletAddress(address)}</span>
                <button
                    type="button"
                    onClick={() => copyToClipboard(address)}
                    className="text-[#F97316] transition-colors hover:text-[#EA580C]"
                    aria-label="Copy wallet address"
                >
                    <i className={`${copyIcon} text-xs`} />
                </button>
            </div>

            <button
                type="button"
                onClick={() => disconnect()}
                className="rounded-[9px] border-[1.5px] border-solid border-[#EEEBE5] bg-white px-3 py-2 text-sm font-medium text-[#111111] transition-colors hover:bg-[#F7F6F3] sm:px-4"
            >
                <i className="fas fa-sign-out-alt mr-1.5 text-xs"></i>
                Disconnect
            </button>
        </div>
    );
};

export default Profile;
