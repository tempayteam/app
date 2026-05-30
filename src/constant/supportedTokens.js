/** Token options for Pay / Get Paid selectors (balances via wagmi useBalance in `Token` component). */
const LOGO_USDC =
  'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png';

export const SUPPORTED_TOKENS = [
  {
    name: 'pathUSD',
    symbol: 'pathUSD',
    address: '0x20c0000000000000000000000000000000000000',
    logo: '/pathUSD.png',
    logoFallbackBg: '#1a1a1a',
    logoFallbackChar: 'p',
    decimals: 6,
  },
  {
    name: 'Bridged USDC',
    symbol: 'USDC.e',
    address: '0x20c000000000000000000000b9537d11c60e8b50',
    logo: LOGO_USDC,
    decimals: 18,
  },
];
