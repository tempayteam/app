import React from 'react';
import { useAccount, useConnect } from 'wagmi';

const ConnectWalletButton = () => {
    const { isConnected } = useAccount();
    const { connect, connectors, isPending, pendingConnector } = useConnect();

    const getConnectorLabel = (connector) => {
        if (connector.name?.toLowerCase().includes('walletconnect')) return 'WalletConnect';
        if (connector.name?.toLowerCase().includes('metamask')) return 'MetaMask';
        if (connector.name?.toLowerCase().includes('injected')) return 'Browser Wallet';
        return connector.name;
    };

    if (isConnected) return null;

    return (
        <div className='flex justify-center mt-10'>
            <div className="flex flex-wrap justify-center gap-3">
                {connectors.map((connector) => (
                    <button
                        key={connector.uid || connector.id}
                        type="button"
                        onClick={() => connect({ connector })}
                        disabled={isPending}
                        className="rounded-2xl bg-[#F97316] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#EA580C] disabled:opacity-60"
                    >
                        {isPending && pendingConnector?.id === connector.id ? `Opening ${getConnectorLabel(connector)}...` : `Connect ${getConnectorLabel(connector)}`}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ConnectWalletButton;
