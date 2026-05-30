import { createPublicClient, defineChain } from 'viem';
import { createConfig, http } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';

const chainId = Number(process.env.REACT_APP_CHAIN_ID);
const rpcUrlRaw = process.env.REACT_APP_RPC_URL;
const rpcUrl = typeof rpcUrlRaw === 'string' ? rpcUrlRaw.replace(/^"|"$/g, '') : undefined;
const chainNameRaw = process.env.REACT_APP_CHAIN_NAME;
const chainName = typeof chainNameRaw === 'string' ? chainNameRaw.replace(/^"|"$/g, '') : 'Custom';
const explorerUrlRaw = process.env.REACT_APP_BLOCK_EXPLORER_URL;
const explorerUrl = typeof explorerUrlRaw === 'string' ? explorerUrlRaw.replace(/^"|"$/g, '') : undefined;
const nativeSymbolRaw = process.env.REACT_APP_NATIVE_TOKEN_SYMBOL;
const nativeSymbol = typeof nativeSymbolRaw === 'string' ? nativeSymbolRaw.replace(/^"|"$/g, '') : 'ETH';
const nativeDecimals = Number(process.env.REACT_APP_NATIVE_TOKEN_DECIMAL || 18);
const walletConnectProjectIdRaw = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID;
const walletConnectProjectId = typeof walletConnectProjectIdRaw === 'string'
  ? walletConnectProjectIdRaw.replace(/^"|"$/g, '').trim()
  : '';
const hasWalletConnectProjectId = Boolean(
  walletConnectProjectId && walletConnectProjectId !== 'YOUR_PROJECT_ID'
);

const walletConnectMetadata = {
  name: 'TempPay',
  description: 'Send, receive, and settle crypto payments on-chain with TempPay.',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://tempay.xyz',
  icons:
    typeof window !== 'undefined'
      ? [`${window.location.origin}/logo192.png`]
      : ['https://tempay.xyz/logo192.png'],
};

export const chain = defineChain({
  id: chainId,
  name: chainName,
  nativeCurrency: {
    name: nativeSymbol,
    symbol: nativeSymbol,
    decimals: nativeDecimals,
  },
  rpcUrls: {
    default: { http: rpcUrl ? [rpcUrl] : [] },
    public: { http: rpcUrl ? [rpcUrl] : [] },
  },
  blockExplorers: explorerUrl
    ? {
        default: {
          name: 'Explorer',
          url: explorerUrl,
        },
      }
    : undefined,
  testnet: true,
});

export const publicClient = createPublicClient({
  chain,
  transport: http(rpcUrl, {
    batch: false,
  }),
});

export const config = createConfig({
  chains: [chain],
  connectors: [
    injected(),
    ...(hasWalletConnectProjectId
      ? [walletConnect({ projectId: walletConnectProjectId, metadata: walletConnectMetadata })]
      : []),
  ],
  transports: {
    [chain.id]: http(rpcUrl),
  },
});
