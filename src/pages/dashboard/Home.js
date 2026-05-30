import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ethers } from 'ethers';
import React, { useEffect, useRef, useState } from 'react';
import { SkeletonTheme } from 'react-loading-skeleton';
import { Tooltip } from 'react-tooltip';
import { useAccount } from 'wagmi';
import { CPGABI } from '../../ABI/ABI';
import ConnectWalletButton from '../../components/connectWallet/ConnectWalletButton';
import SwitchNetworkButton from '../../components/connectWallet/SwitchNetworkButton';
import Loader from '../../components/loader/Loader';
import { homeFilterData } from '../../config/data';
import { CPGAddress, defaultPageSize, DIRECT_PAYMENT, initialTokenList, pageSizeLength, RECEIVE, SEND, targetChainId } from '../../constant/constant';
import { copyIcon } from '../../constant/icon';
import { TRANSACTION_ERROR_MSG, USER_REJECT_TRANSACTION_MSG } from '../../constant/toasterMessage';
import ClaimPayment from '../../Modal/ClaimPayment';
import DisputeModal from '../../Modal/DisputeModal';
import { copyToClipboard, CustomNoRowsOverlay, CustomDataGridSkeleton, fireErrorToast, formatNumber, shortenWalletAddress } from '../../utils/commonFunction';
import { readContractData } from '../../utils/contractInstance';

const Home = () => {
    const [filterName, setFilterName] = useState(SEND)
    const [currentItem, setCurrentItem] = useState({})
    const [disputeModal, setDisputeModal] = useState(false);
    const [collectPaymentData, setCollectPaymentData] = useState([])
    const [sendData, setSendData] = useState([])
    const [receiveData, setReceiveData] = useState([])
    const [sendDataLoading, setSendDataLoading] = useState(false)
    const [receiveDataLoading, setReceiveDataLoading] = useState(false)
    const [disputeLoading, setDisputeLoading] = useState(false)
    const [paymentId, setPaymentId] = useState(null)
    const [claimModal, setClaimModal] = useState(null)
    const [totalSendAmount, setTotalSendAmount] = useState(0)
    const [totalReceiveAmount, setTotalReceiveAmount] = useState(0)
    const [totalClaimableAmount, setTotalClaimableAmount] = useState(0)
    const [totalOpenDispute, setTotalOpenDispute] = useState(0)
    const [pageSize, setPageSize] = useState(defaultPageSize)


    const { isConnected, address: walletAddress, chainId } = useAccount()

    // const chainId = useChainId();
    const disputeRef = useRef();
    const claimModalRef = useRef()

    const handlePaginationModelChange = (model) => {
        setPageSize(model.pageSize);
    };

    const onWriteSuccess = async (data) => {
        if (data) {
            // console.log("Success", data);
            if (data.transactionHash) {
                // setShowCongratulationModal(true)
            }
        }
    };



    const onWriteError = (error) => {
        if (error) {
            if (!error?.details?.includes('MetaMask Tx Signature: User denied transaction signature')) {
                fireErrorToast(TRANSACTION_ERROR_MSG)
            }
            if (error?.details?.includes('MetaMask Tx Signature: User denied transaction signature')) {
                fireErrorToast(USER_REJECT_TRANSACTION_MSG)
            }
        }

        // }
    }

    // Reusable Cell Renderers
    const renderAddressCell = (address) => (
        <div className='flex items-center gap-2 group'>
            <div className="w-7 h-7 rounded-full bg-[#FFF7ED] flex items-center justify-center border border-[#FED7AA]">
                <i className="fas fa-wallet text-[10px] text-[#F97316]"></i>
            </div>
            <span className="text-[#111111] font-medium">{shortenWalletAddress(address)}</span>
            <button onClick={() => copyToClipboard(address)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all">
                <i className={`${copyIcon} text-[#6B6B6B] text-xs`} />
            </button>
        </div>
    );

    const renderAssetCell = (params) => (
        <div className='flex items-center gap-3'>
            <img src={params.row.tokenImage} alt="" className='w-6 h-6 rounded-full' />
            <span className="font-semibold text-[#111111]">{params.row.tokenName}</span>
        </div>
    );

    const columns = [
        { field: 'id', headerName: 'ID', width: 70, renderCell: (p) => <span className="text-[#9B9B9B] font-mono">#{p.value}</span> },
        { field: 'receiver', headerName: filterName === SEND ? 'Receiver' : 'Sender', flex: 1.5, minWidth: 180, renderCell: (p) => renderAddressCell(p.value) },
        { field: 'tokenName', headerName: 'Asset', flex: 1, minWidth: 140, renderCell: renderAssetCell },
        { field: 'amount', headerName: 'Amount', flex: 1, minWidth: 130, renderCell: (p) => <span className="text-[#F97316] font-bold tabular-nums">{p.value}</span> },
    ];

    const collectPaymentcolumns = [
        { field: 'id', headerName: 'ID', width: 70, renderCell: (p) => <span className="text-[#9B9B9B] font-mono">#{p.row.paymentId.toString()}</span> },
        { field: 'sender', headerName: 'From Sender', flex: 1.5, minWidth: 180, renderCell: (p) => renderAddressCell(p.value) },
        { field: 'tokenName', headerName: 'Asset', flex: 1, minWidth: 140, renderCell: renderAssetCell },
        { field: 'amount', headerName: 'Value', flex: 1, renderCell: (p) => <span className="text-emerald-600 font-bold">{p.value}</span> },
        {
            field: 'action', headerName: 'Action', width: 140, align: 'right', headerAlign: 'right', sortable: false,
            renderCell: (params) => (
                <button
                    className='bg-[#F97316] hover:bg-[#EA580C] text-white text-[10px] font-bold px-5 py-2 rounded-lg transition-all'
                    onClick={() => { setPaymentId(Number(params.row.paymentId)); setClaimModal(true); }}
                >Claim</button>
            ),
        },
    ];




    const getReceiveDirectPaymentData = async () => {
        try {
            setReceiveDataLoading(true)
            const count = await readContractData(CPGAddress, CPGABI, 'getDirectPaymentCountOfReceiver', [walletAddress])


            const directPayments = [];
            let totalReceive = 0
            if (Number(count) > 0) {

                for (let i = 0; i < Number(count); i++) {
                    const paymentData = await readContractData(CPGAddress, CPGABI, 'getDirectPaymentByIndexOfReceiver', [walletAddress, i]);
                    const paymentId = Number(paymentData.paymentId);

                    // Find the token data based on the tokenAddress in paymentData
                    const tokenInfo = initialTokenList.find(
                        token => token.address?.toLowerCase() === paymentData.tokenAddress?.toLowerCase()
                    );

                    if (tokenInfo) {
                        const { name, decimals, logoURI } = tokenInfo;

                        // Convert the amount using the token decimal
                        const formatted = parseFloat(ethers.formatUnits(paymentData.amount, decimals));
                        const parsedNumber = parseFloat(formatted);

                        // const amount = Number.isInteger(parsedNumber) ? parsedNumber : formatted.toFixed(2);
                        const amount = formatNumber(parsedNumber);

                        if (paymentData.isClaimed) {
                            totalReceive += parsedNumber;
                        }
                        // Add tokenName and converted amount to the processed data
                        const processedData = {
                            ...paymentData,
                            id: paymentId,
                            amount,
                            parsedNumber,
                            tokenName: name,
                            tokenImage: logoURI,
                            tokenDecimal: decimals,
                        };

                        directPayments.push(processedData);
                    } else {
                        console.warn(`Token information not found for address: ${paymentData.tokenAddress}`);
                    }
                }

                const unclaimedPayments = directPayments.filter(payment => payment.isClaimed === false);
                const claimedPayments = directPayments.filter(payment => payment.isClaimed === true);

                const totalUnclaimedAmount = unclaimedPayments.reduce((accumulator, payment) => {
                    return accumulator + payment.parsedNumber;
                }, 0);

                // Now you have the total unclaimed amount in the `totalUnclaimedAmount` variable.
                setTotalClaimableAmount(totalUnclaimedAmount);

                setTotalReceiveAmount(totalReceive);
                setReceiveData(claimedPayments)
                setCollectPaymentData(unclaimedPayments);
            }
        } catch (error) {
            console.log(error);

        } finally {
            setReceiveDataLoading(false)
        }
    }

    const getSendDirectPaymentData = async () => {
        try {
            setSendDataLoading(true)
            const count = await readContractData(CPGAddress, CPGABI, 'getDirectPaymentCountOfSender', [walletAddress])

            const directPayments = [];
            if (Number(count) > 0) {

                let totalSend = 0
                for (let i = 0; i < Number(count); i++) {
                    const paymentData = await readContractData(CPGAddress, CPGABI, 'getDirectPaymentByIndexOfSender', [walletAddress, i]);

                    const paymentId = Number(paymentData.paymentId);

                    // Find the token data based on the tokenAddress in paymentData
                    const tokenInfo = initialTokenList.find(
                        token => token.address?.toLowerCase() === paymentData.tokenAddress?.toLowerCase()
                    );

                    if (tokenInfo) {
                        const { name, decimals, logoURI } = tokenInfo;

                        // Convert the amount using the token decimal
                        // const amount = parseFloat(ethers.formatUnits(paymentData.amount, decimals));
                        const formatted = parseFloat(ethers.formatUnits(paymentData.amount, decimals));
                        const parsedNumber = parseFloat(formatted);

                        // const amount = Number.isInteger(parsedNumber) ? parsedNumber : formatted.toFixed(2);
                        const amount = formatNumber(parsedNumber);


                        totalSend += parsedNumber
                        // Add tokenName and converted amount to the processed data
                        const processedData = {
                            ...paymentData,
                            id: paymentId,
                            amount,
                            parsedNumber,
                            tokenName: name,
                            tokenImage: logoURI,
                            tokenDecimal: decimals    // Add token decimal if needed for further processing
                        };

                        directPayments.push(processedData);
                    } else {
                        console.warn(`Token information not found for address: ${paymentData.tokenAddress}`);
                    }
                }

                setTotalSendAmount(totalSend)
                setSendData(directPayments)
            }
        } catch (error) {
            console.log(error);

        } finally {
            setSendDataLoading(false)
        }
    }

    const getOpenDispute = async () => {
        try {
            setDisputeLoading(true)
            const count = await readContractData(CPGAddress, CPGABI, 'disputeCountOfUser', [walletAddress])
            setTotalOpenDispute(Number(count))

        } catch (error) {

        } finally {
            setDisputeLoading(false)
        }
    }

    const handleClaim = (paymentId) => {
        try {
            setPaymentId(Number(paymentId))
            // claimDirectPaymentArgs([Number(paymentId).toString()])
            // claimDirectPayment()
            claimModalRef.current.click()
        } catch (error) {
            console.log(error);

        }

    }



    const handleChangeFilter = (name) => {
        setFilterName(name)
    }

    useEffect(() => {
        if (isConnected && chainId === targetChainId) {
            getSendDirectPaymentData()
            getReceiveDirectPaymentData()
            getOpenDispute()
        }
        // eslint-disable-next-line
    }, [walletAddress])

    const dataGridSx = {
        width: '100%', height: '50vh',
        '& .MuiDataGrid-root': { border: 'none', color: '#111111', '--DataGrid-rowBorderColor': '#EEEBE5' },
        '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F7F6F3', color: '#6B6B6B', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, borderBottom: '1px solid #EEEBE5' },
        '& .MuiDataGrid-cell': { fontSize: '0.8rem', borderBottom: '1px solid #EEEBE5', display: 'flex', alignItems: 'center', color: '#111111' },
        '& .MuiDataGrid-row:hover': { backgroundColor: '#FFF7ED' },
        '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #EEEBE5', backgroundColor: '#F7F6F3' },
        '& .MuiTablePagination-root': { color: '#6B6B6B' },
    };

    return (
        <SkeletonTheme baseColor={'#F0EDE8'} highlightColor={'#FFFFFF'}>
            <div className="crypto-page relative min-h-[calc(100vh-80px)] bg-[#F7F6F3]">
                <div className="crypto-gradient-bg" />
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                    {!isConnected ? (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in">
                            <div className="text-center max-w-2xl mx-auto space-y-5 px-4">
                                <div className="inline-flex items-center gap-2 bg-[#FFF7ED] border border-[#FED7AA] rounded-full px-4 py-1.5 mb-2">
                                    <span className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse"></span>
                                    <span className="text-[11px] font-semibold tracking-wide uppercase text-[#C05200]">TempPay Protocol</span>
                                </div>
                                <h1 className="text-3xl md:text-6xl font-extrabold text-[#111111] tracking-tight leading-[1.1]">
                                    Your On-Chain<br/><span className="text-[#F97316]">Payment Hub</span>
                                </h1>
                                <p className="text-[#6B6B6B] text-sm md:text-lg max-w-lg mx-auto leading-relaxed">Connect your wallet to send, receive, and manage crypto payments — secured by smart contracts on TempPay.</p>
                            </div>
                            <ConnectWalletButton />
                            <div className="grid grid-cols-3 gap-6 mt-6 max-w-md mx-auto">
                                {[{ icon: 'fa-bolt', label: 'Instant' }, { icon: 'fa-shield-halved', label: 'Secure' }, { icon: 'fa-link', label: 'On-Chain' }].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1.5">
                                        <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center">
                                            <i className={`fa-solid ${item.icon} text-[#F97316] text-sm`}></i>
                                        </div>
                                        <span className="text-[11px] font-medium text-[#6B6B6B]">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : chainId !== targetChainId ? (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-fade-in">
                            <div className="w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center"><i className="fas fa-exclamation-triangle text-amber-500 text-3xl"></i></div>
                            <h2 className="text-3xl font-bold text-[#111111]">Wrong Network</h2>
                            <p className="text-[#6B6B6B] text-sm">Please switch to the correct network to continue.</p>
                            <SwitchNetworkButton />
                        </div>
                    ) : (
                        <div className="animate-fade-in space-y-10">
                            {/* PAGE HEADER */}
                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                                <div>
                                    <div className="inline-flex items-center gap-2 bg-[#FFF7ED] border border-[#FED7AA] rounded-full px-3 py-1 mb-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]"></span>
                                        <span className="text-[10px] font-semibold tracking-wider uppercase text-[#C05200]">Dashboard</span>
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-[#111111]">Payment Overview</h1>
                                </div>
                                <p className="text-xs text-[#6B6B6B] font-medium">Direct payments powered by TempPay</p>
                            </div>

                            {/* STATS GRID */}
                            <div className="grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4">
                                {[
                                    { label: 'Total Sent', value: totalSendAmount, iconBg: 'bg-[#FFF7ED]', iconColor: 'text-[#F97316]', icon: 'fa-arrow-up-right-from-square', loading: sendDataLoading },
                                    { label: 'Total Received', value: totalReceiveAmount, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', icon: 'fa-arrow-down-to-line', loading: receiveDataLoading },
                                    { label: 'Claimable', value: totalClaimableAmount, iconBg: 'bg-[#FFF7ED]', iconColor: 'text-[#F97316]', icon: 'fa-coins', loading: receiveDataLoading },
                                    { label: 'Open Disputes', value: totalOpenDispute, iconBg: 'bg-amber-50', iconColor: 'text-amber-600', icon: 'fa-triangle-exclamation', loading: disputeLoading, isCount: true }
                                ].map((stat, i) => (
                                    <div key={i} className="glass-card border border-[#EEEBE5] p-5 rounded-2xl group">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B6B6B]">{stat.label}</p>
                                            <div className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                                                <i className={`fa-solid ${stat.icon} ${stat.iconColor} text-xs`}></i>
                                            </div>
                                        </div>
                                        <div className="text-2xl md:text-3xl font-bold text-[#111111] tabular-nums">
                                            {stat.loading ? <Loader size="18px" /> : (stat.isCount ? stat.value : stat.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* HISTORY TABLE */}
                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-[#111111] flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] flex items-center justify-center">
                                            <i className="fas fa-history text-[#F97316] text-xs"></i>
                                        </div>
                                        Transaction History
                                    </h2>
                                </div>
                                <div className="glass-card border border-[#EEEBE5] rounded-2xl md:rounded-3xl overflow-hidden">
                                    <div className="flex p-2 gap-1 bg-[#F7F6F3] overflow-x-auto no-scrollbar">
                                        <div className="flex min-w-full gap-1">
                                            {homeFilterData.map((item) => (
                                                <button
                                                    key={item.id}
                                                    className={`flex-1 min-w-[120px] md:min-w-0 py-2.5 px-4 rounded-xl text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${filterName === item.name ? 'bg-[#F97316] text-white shadow-lg shadow-orange-200' : 'text-[#6B6B6B] hover:text-[#111111] hover:bg-[#FFF7ED]'}`}
                                                    onClick={() => handleChangeFilter(item.name)}
                                                >
                                                    <i className={`${item.icon} mr-2`}></i>{item.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <Box sx={dataGridSx}>
                                        <DataGrid
                                            rows={filterName === RECEIVE ? receiveData : sendData}
                                            columns={columns}
                                            loading={filterName === RECEIVE ? receiveDataLoading : sendDataLoading}
                                            rowHeight={70}
                                            initialState={{ pagination: { paginationModel: { pageSize } } }}
                                            onPaginationModelChange={handlePaginationModelChange}
                                            slots={{ noRowsOverlay: CustomNoRowsOverlay, loadingOverlay: CustomDataGridSkeleton }}
                                        />
                                    </Box>
                                </div>
                            </div>

                            {/* COLLECT PAYMENT TABLE */}
                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-[#111111] flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                            <i className="fas fa-hand-holding-usd text-emerald-600 text-xs"></i>
                                        </div>
                                        Pending Claims
                                    </h2>
                                </div>
                                <div className="glass-card border border-[#EEEBE5] rounded-2xl md:rounded-3xl overflow-hidden">
                                    <Box sx={dataGridSx}>
                                        <DataGrid
                                            rows={collectPaymentData}
                                            columns={collectPaymentcolumns}
                                            loading={receiveDataLoading}
                                            rowHeight={70}
                                            initialState={{ pagination: { paginationModel: { pageSize } } }}
                                            onPaginationModelChange={handlePaginationModelChange}
                                            slots={{ noRowsOverlay: CustomNoRowsOverlay, loadingOverlay: CustomDataGridSkeleton }}
                                        />
                                    </Box>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* MODALS */}
                {disputeModal && <DisputeModal setDisputeModal={setDisputeModal} currentItem={currentItem} setCurrentItem={setCurrentItem} />}
                {claimModal && <ClaimPayment setClaimModal={setClaimModal} paymentId={paymentId} setPaymentId={setPaymentId} onWriteError={onWriteError} onWriteSuccess={onWriteSuccess} getData={getReceiveDirectPaymentData} paymentType={'DirectPayment'} />}
            </div>
        </SkeletonTheme>
    );
}

export default Home