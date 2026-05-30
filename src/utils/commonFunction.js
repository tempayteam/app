import { ethers } from "ethers";
import { Bounce, toast } from "react-toastify";
import { ERC20ABI } from "../ABI/ABI";
import { readContractData } from "./contractInstance";
import { publicClient } from "./wagmiConfig";
import styled from "styled-components";
import { Box, Skeleton } from "@mui/material";
import { CPGAddress, disputeDuration } from "../constant/constant";
import { SUPPORTED_TOKENS } from "../constant/supportedTokens";
import { mileStoneDuration } from "../config/data";
import { COPY_CLIPBOARD_SUCCESS } from "../constant/toasterMessage";
import BigNumber from "bignumber.js";

export const isContractAddress = async (address) => {
    try {
        if (!address || !ethers.isAddress(address)) return false;
        const bytecode = await publicClient.getBytecode({ address });
        return bytecode && bytecode !== '0x';
    } catch (e) {
        return false;
    }
}

export function findExactMultiple(amount) {
    try {

        for (let unit of mileStoneDuration) {
            if (amount % unit.timestamp === 0) {
                return { unit: unit.name, multiples: amount / unit.timestamp };
            }
        }
        return null; // No exact match found
    } catch (e) {
        console.log(e);

    }
}

export function getMonthInWordWithDateAndYear(dateString) {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const date = new Date(dateString);
    const monthIndex = date.getUTCMonth();
    const year = date.getUTCFullYear();
    const day = String(date.getUTCDate()).padStart(2, '0');

    const monthName = months[monthIndex];

    return `${monthName} ${day}, ${year}`;
}

const getMetaMaskAccounts = async () => {
    try {
        const accounts = await window?.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            return { walletType: 'MetaMask', address: accounts[0] };
        }
    } catch (e) {
        console.log("MetaMask error: ", e);
    }
    return null;
};

export async function checkConnectedWallet() {
    try {


        if (typeof window.ethereum !== 'undefined' && window?.ethereum.isMetaMask) {
            const metaMaskResult = await getMetaMaskAccounts();
            if (metaMaskResult) {
                return metaMaskResult;
            }
        }


        return 'No wallet connected';
    } catch (e) {
        console.log("Network Error");
        return 'Network Error';
    }
}

export const shortenWalletAddress = (address) => {
    if (!address || typeof address !== 'string') {
        return 'Unavailable';
    }
    if (address.length < 8) {
        return address;
    }
    const start = address.slice(0, 6);
    const end = address.slice(-4);
    return `${start}...${end}`;
};

export const generateAvtar = string => string.split(/\s/).reduce((response, word) => (response += word.slice(0, 1)), '')

export const fireSuccessToast = (msg) => {
    toast.success(msg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
    });
}

export const fireInfoToast = (msg) => {
    toast.info(msg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
    });
}

export const fireErrorToast = (msg) => {
    toast.error(msg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
    });
}

export const convertInTokenBigAmount = (amount, decimal) => {
    return ethers.parseUnits(amount.toString(), Number(decimal))
}

export const getTokenBalance = async (tokenAddress, walletAddress) => {
    try {
        if (!tokenAddress || !walletAddress) return 0n;

        // Avoid calling ERC20 methods on EOAs / non-contracts (RPC returns 0x)
        const bytecode = await publicClient.getBytecode({ address: tokenAddress });
        if (!bytecode || bytecode === "0x") return 0n;

        const walletBalance = await readContractData(tokenAddress, ERC20ABI, "balanceOf", [walletAddress]);
        return walletBalance ?? 0n;

    }
    catch (e) {
        // Silently fallback — some token list entries may not be ERC20 on this chain.
        return 0n;
    }
}

export const convertBigToSmallDigitWithSpecificDecimal = (bigValue, decimal) => {
    // const ans = new BigNumber(valueA).dividedBy(valueB);
    if (!bigValue) {
        bigValue = 0
    }
    const ans = convertBigToSmallDigit(bigValue, Number(decimal))
    return Number(ans).toFixed(2);
};

export const convertBigToSmallDigit = (bigValue, decimal) => {
    return ethers.formatUnits(bigValue, Number(decimal))
}

const StyledGridOverlay = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    '& .no-rows-primary': {
        fill: '#3D4751',
    },
    '& .no-rows-secondary': {
        fill: '#1D2126',
    },
}));

export function CustomNoRowsOverlay() {
    return (
        <StyledGridOverlay>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                width={96}
                viewBox="0 0 452 257"
                aria-hidden
                focusable="false"
            >
                <path
                    className="no-rows-primary"
                    d="M348 69c-46.392 0-84 37.608-84 84s37.608 84 84 84 84-37.608 84-84-37.608-84-84-84Zm-104 84c0-57.438 46.562-104 104-104s104 46.562 104 104-46.562 104-104 104-104-46.562-104-104Z"
                />
                <path
                    className="no-rows-primary"
                    d="M308.929 113.929c3.905-3.905 10.237-3.905 14.142 0l63.64 63.64c3.905 3.905 3.905 10.236 0 14.142-3.906 3.905-10.237 3.905-14.142 0l-63.64-63.64c-3.905-3.905-3.905-10.237 0-14.142Z"
                />
                <path
                    className="no-rows-primary"
                    d="M308.929 191.711c-3.905-3.906-3.905-10.237 0-14.142l63.64-63.64c3.905-3.905 10.236-3.905 14.142 0 3.905 3.905 3.905 10.237 0 14.142l-63.64 63.64c-3.905 3.905-10.237 3.905-14.142 0Z"
                />
                <path
                    className="no-rows-secondary"
                    d="M0 10C0 4.477 4.477 0 10 0h380c5.523 0 10 4.477 10 10s-4.477 10-10 10H10C4.477 20 0 15.523 0 10ZM0 59c0-5.523 4.477-10 10-10h231c5.523 0 10 4.477 10 10s-4.477 10-10 10H10C4.477 69 0 64.523 0 59ZM0 106c0-5.523 4.477-10 10-10h203c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 153c0-5.523 4.477-10 10-10h195.5c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 200c0-5.523 4.477-10 10-10h203c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 247c0-5.523 4.477-10 10-10h231c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10Z"
                />
            </svg>
            <Box sx={{ mt: 2 }}>There is no data available for display.</Box>
        </StyledGridOverlay>
    );
}

export function formatNumber(number) {
    // Check if the number is an integer
    const isInteger = Number.isInteger(number);

    const formatted = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: isInteger ? 0 : 2,
        maximumFractionDigits: 2
    }).format(number);

    return formatted;
}

export const getAllowance = async (tokenAddress, walletAddress) => {
    return await readContractData(tokenAddress, ERC20ABI, 'allowance', [walletAddress, CPGAddress]);
}

export const handleWheel = (event) => {
    event.target.blur(); // Remove focus from the input element
};

export const handleKeyDown = (event) => {
    // Prevent arrow keys from changing the number
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault()
        event.target.blur();;
    }
};

export const copyToClipboard = (address) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(address)
            .then(() => {
                fireSuccessToast(COPY_CLIPBOARD_SUCCESS);
            })
            .catch((error) => {
                console.error('Error copying address to clipboard:', error);
            });
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = address;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            fireSuccessToast(COPY_CLIPBOARD_SUCCESS);
        } catch (error) {
            console.error('Error copying address to clipboard:', error);
        }
        document.body.removeChild(textarea);
    }
};

export const getDueDate = (raisedTimestamp) => {
    const raisedTime = new BigNumber(raisedTimestamp);
    const disputeResolutionTime = new BigNumber(disputeDuration);
    const deadlineTimestamp = raisedTime.plus(disputeResolutionTime);
    const deadlineTimestampInMs = deadlineTimestamp.multipliedBy(1000);
    const deadlineDate = new Date(deadlineTimestampInMs.toNumber());
    const day = String(deadlineDate.getDate()).padStart(2, '0');
    const month = String(deadlineDate.getMonth() + 1).padStart(2, '0');
    const year = deadlineDate.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    return formattedDate
}

export const getRaisedDisputeDate = (raisedTimestamp) => {
    const raisedTime = new BigNumber(raisedTimestamp);

    // Convert to milliseconds for JavaScript Date object if timestamp is in seconds
    const raisedTimestampInMs = raisedTime.multipliedBy(1000);
    const raisedDate = new Date(raisedTimestampInMs.toNumber());

    // Format date as dd-mm-yyyy
    const day = String(raisedDate.getDate()).padStart(2, '0');
    const month = String(raisedDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = raisedDate.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    return formattedDate;
}

export const fetchTokenBalances = async (walletAddress) => {
    const list = SUPPORTED_TOKENS.map((t) => ({ ...t, logoURI: t.logo }));
    const updatedTokenList = await Promise.all(
        list.map(async (token) => {
            try {
                const balance = await getTokenBalance(token.address, walletAddress);
                return { ...token, balance };
            } catch (error) {
                console.error(`Error fetching balance for ${token.symbol}:`, error);
                return { ...token, balance: '0' }; // Default to 0 if there's an error
            }
        })
    );
    return updatedTokenList;
};

export function CustomDataGridSkeleton() {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                p: 2,
                mt: 1,
            }}
        >
            {[...Array(5)].map((_, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, width: '100%', mb: 1.5 }}>
                    <Skeleton variant="circular" width={40} height={40} animation="wave" sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', flexShrink: 0 }} />
                    <Skeleton variant="rectangular" height={40} sx={{ flex: 1.5, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.05)' }} animation="wave" />
                    <Skeleton variant="rectangular" height={40} sx={{ flex: 1, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', display: { xs: 'none', sm: 'block' } }} animation="wave" />
                    <Skeleton variant="rectangular" height={40} sx={{ flex: 1, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', display: { xs: 'none', md: 'block' } }} animation="wave" />
                    <Skeleton variant="rectangular" height={40} sx={{ flex: 1, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', display: { xs: 'none', lg: 'block' } }} animation="wave" />
                </Box>
            ))}
        </Box>
    );
}