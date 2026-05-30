import React from 'react';
import { useSwitchChain } from 'wagmi';
import { targetChainId } from '../../constant/constant';

const SwitchNetworkButton = () => {
    const { switchChain, isPending } = useSwitchChain();

    return (
        <div className='flex justify-center mt-10'>
            <button
                type="button"
                onClick={() => switchChain({ chainId: targetChainId })}
                disabled={isPending}
                className="rounded-2xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-60"
            >
                {isPending ? 'Switching Network...' : 'Switch Network'}
            </button>
        </div>
    );
};

export default SwitchNetworkButton;
