import { ethers } from 'ethers';
import { createContext } from 'react';

const bscDefaultTokenListTestnet = require('./testnetDefaultTokenList.json');
const sepoliaDefaultTokenListTestnet = require('./sepoliaTokenList.json');
const bscWhiteListTestnet = require('./whiteList-testnet.json');
const sepoliaWhitelistTestnet = require('./sepoliaTokenList.json');
const baseSepoliaTokenListTestnet = require('./baseSepoliaTokenList.json');
const baseSepoliaWhiteListTestnet = require('./baseSepoliaTokenList.json');
const lineaSepoliaTokenListTestnet = require('./lineaSepoliaTokenList.json');
const lineaSepoliaWhiteListTestnet = require('./lineaSepoliaTokenList.json');
const arctestnetTokenListTestnet = require('./arcTestnetTokenList.json');

export const targetChainId = parseInt(process.env.REACT_APP_CHAIN_ID, 10);

let defaultTokenList;
let whiteList;

if (targetChainId === 97) {
    defaultTokenList = bscDefaultTokenListTestnet;
    whiteList = bscWhiteListTestnet;
}
if (targetChainId === 11155111) {
    defaultTokenList = sepoliaDefaultTokenListTestnet;
    whiteList = sepoliaWhitelistTestnet;
}
if (targetChainId === 84532) {
    defaultTokenList = baseSepoliaTokenListTestnet;
    whiteList = baseSepoliaWhiteListTestnet;
}
if (targetChainId === 4217) {
    defaultTokenList = arctestnetTokenListTestnet;
    whiteList = arctestnetTokenListTestnet;
}

if (targetChainId === 59141) {
    defaultTokenList = lineaSepoliaTokenListTestnet;
    whiteList = lineaSepoliaWhiteListTestnet;
}

export const initialTokenList = defaultTokenList;
export const tokenWhiteList = whiteList;

export const supportedChainId = [process.env.REACT_APP_CHAIN_ID];
export const hexChainId = process.env.REACT_APP_CHAIN_IDREACT_APP_CHAIN_ID_HEX;
export const chainName = process.env.REACT_APP_CHAIN_NAME;
export const nativeToken = process.env.REACT_APP_NATIVE_TOKEN_SYMBOL;
export const tokenDecimal = process.env.REACT_APP_NATIVE_TOKEN_DECIMAL;
export const CPGAddress = process.env.REACT_APP_CPG_ADDRESS || process.env.REACT_APP_CONTRACT_ADDRESS;
export const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;
export const IPFS_GATEWAY = process.env.REACT_APP_IPFS_GATEWAY;
export const rpcUrl = process.env.REACT_APP_RPC_URL;
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const UINT256_MAX = ethers.MaxUint256;
export const pageSizeLength = [10, 25, 50, 100];
export const defaultPageSize = 10;
export const disputeDuration = 604800;
export const DIRECT_PAYMENT = 'Direct Payment';
export const TRACKED_PAYMENT = 'Tracked Payment';
export const SEND = 'Send';
export const RECEIVE = 'Receive';
export const PENDING_DISPUTE = 'pendingDispute';
export const RESOLVE_DISPUTE = 'resolveDispute';

export const ConnectWalletContext = createContext();
export const WalletAddressContext = createContext();
export const TokenContext = createContext();
