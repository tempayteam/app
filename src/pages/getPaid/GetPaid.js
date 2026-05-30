import { DataGrid } from '@mui/x-data-grid';
import { ethers } from 'ethers';
import React, { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { CPGABI } from '../../ABI/ABI';
import ConnectWalletButton from '../../components/connectWallet/ConnectWalletButton';
import SwitchNetworkButton from '../../components/connectWallet/SwitchNetworkButton';
import { RequestFilterData } from '../../config/data';
import { targetChainId, CPGAddress, defaultPageSize, initialTokenList, pageSizeLength } from '../../constant/constant';
import DisputeModal from '../../Modal/DisputeModal';
import { copyToClipboard, CustomNoRowsOverlay, CustomDataGridSkeleton, findExactMultiple, formatNumber, shortenWalletAddress } from '../../utils/commonFunction';
import { readContractData } from '../../utils/contractInstance';
import SendRequest from './SendRequest';
import { copyIcon } from '../../constant/icon';
import { Box } from '@mui/material';

const GetPaid = () => {
    const [currentItem, setCurrentItem] = useState({});
    const [disputeModal, setDisputeModal] = useState(false);
    const [directPaymentRequestData, setDirecetPaymentRequestData] = useState([]);
    const [trackedPaymentRequestData, setTrackedPaymentRequestData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [filterName, setFilterName] = useState(RequestFilterData[0].name);

    const { isConnected, address: walletAddress, chainId } = useAccount();
    const disputeRef = useRef();

    const handlePaginationModelChange = (model) => setPageSize(model.pageSize);
    const handleChangeFilter = (name) => setFilterName(name);

    // Common Column Generator to keep style consistent
    const commonColumns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 70,
            renderCell: (params) => <span className="text-slate-500 font-mono">#{params.value}</span>
        },
        {
            field: 'receiver',
            headerName: 'Receiver',
            flex: 1.5,
            minWidth: 180,
            renderCell: (params) => (
                <div className='flex items-center gap-2 group'>
                    <div className="w-8 h-8 rounded-full bg-[#FFF7ED] flex items-center justify-center border border-[#FED7AA]">
                        <i className="fas fa-wallet text-[10px] text-[#F97316]"></i>
                    </div>
                    <span className="text-[#111111] font-medium">{shortenWalletAddress(params.value)}</span>
                    <button onClick={() => copyToClipboard(params.value)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded">
                        <i className={`${copyIcon} text-slate-500 text-xs`} />
                    </button>
                </div>
            )
        },
        {
            field: 'tokenName',
            headerName: 'Asset',
            flex: 1,
            minWidth: 140,
            renderCell: (params) => (
                <div className='flex items-center gap-3'>
                    <img src={params.row.tokenImage} alt="" className='w-6 h-6 rounded-full' />
                    <span className="font-semibold text-[#111111]">{params.row.tokenName}</span>
                </div>
            ),
        },
        {
            field: 'amount',
            headerName: 'Amount',
            flex: 1,
            minWidth: 130,
            renderCell: (params) => (
                <span className="text-[#F97316] font-bold tabular-nums">
                    {params.value} <span className="text-[10px] text-[#6B6B6B] ml-1">{params.row.tokenName}</span>
                </span>
            )
        }
    ];

    const directPaymentcolumns = [
        ...commonColumns,
        {
            field: 'isAccepted',
            headerName: 'Status',
            width: 130,
            renderCell: (params) => (
                params.row.isAccepted ?
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider border border-green-500/20">● Accepted</span> :
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">● Pending</span>
            ),
        },
    ];

    const trackedPaymentcolumns = [
        ...commonColumns,
        {
            field: 'milestones',
            headerName: 'Milestones',
            width: 120,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => <span className="bg-gray-100 px-2 py-1 rounded text-xs text-[#6B6B6B]">{params.value} steps</span>
        },
        {
            field: 'isAccepted',
            headerName: 'Status',
            width: 130,
            renderCell: (params) => (
                params.row.isAccepted ?
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider border border-green-500/20">● Active</span> :
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">● Pending</span>
            ),
        },
    ];

    // Data fetching logic (unchanged but cleaned)
    const getDirectPaymentRequestData = async () => {
        try {
            setLoading(true);
            const count = await readContractData(CPGAddress, CPGABI, 'getDirectPaymentRequestCountBySender', [walletAddress]);
            if (Number(count) > 0) {
                const requests = [];
                for (let i = 0; i < Number(count); i++) {
                    const data = await readContractData(CPGAddress, CPGABI, 'getDirectPaymentRequestBySender', [walletAddress, i]);
                    const token = initialTokenList.find(
                        t => t.address?.toLowerCase() === data.tokenAddress?.toLowerCase()
                    );
                    if (token) {
                        requests.push({
                            ...data,
                            id: Number(data.requestId),
                            amount: formatNumber(parseFloat(ethers.formatUnits(data.amount, token.decimals))),
                            tokenName: token.name,
                            tokenImage: token.logoURI,
                        });
                    }
                }
                setDirecetPaymentRequestData(requests);
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const getLockedPaymentRequestData = async () => {
        try {
            setLoading(true);
            const count = await readContractData(CPGAddress, CPGABI, 'getLockedPaymentRequestCountBySender', [walletAddress]);
            if (Number(count) > 0) {
                const requests = [];
                for (let i = 0; i < Number(count); i++) {
                    const data = await readContractData(CPGAddress, CPGABI, 'getLockedPaymentRequestBySender', [walletAddress, i]);
                    const token = initialTokenList.find(
                        t => t.address?.toLowerCase() === data.tokenAddress?.toLowerCase()
                    );
                    if (token) {
                        requests.push({
                            ...data,
                            id: Number(data.requestId),
                            amount: formatNumber(parseFloat(ethers.formatUnits(data.amount, token.decimals))),
                            milestones: Number(data.milestones),
                            tokenName: token.name,
                            tokenImage: token.logoURI,
                        });
                    }
                }
                setTrackedPaymentRequestData(requests);
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => {
        if (isConnected && chainId === targetChainId) {
            getDirectPaymentRequestData();
            getLockedPaymentRequestData();
        }
    }, [walletAddress, isConnected, chainId]);

    const dataGridSx = {
        width: '100%',
        height: 500,
        '& .MuiDataGrid-root': { border: 'none', color: '#111111', '--DataGrid-rowBorderColor': '#EEEBE5' },
        '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F7F6F3', color: '#6B6B6B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, borderBottom: '1px solid #EEEBE5' },
        '& .MuiDataGrid-cell': { fontSize: '0.875rem', borderBottom: '1px solid #EEEBE5', display: 'flex', alignItems: 'center', color: '#111111' },
        '& .MuiDataGrid-row:hover': { backgroundColor: '#FFF7ED' },
        '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #EEEBE5', backgroundColor: '#F7F6F3' },
        '& .MuiTablePagination-root': { color: '#6B6B6B' }
    };

    return (
        <div className="crypto-page relative min-h-[calc(100vh-80px)] bg-[#F7F6F3]">
            <div className="crypto-gradient-bg" />
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {!isConnected ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh]"><ConnectWalletButton /></div>
                ) : chainId !== targetChainId ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh]"><SwitchNetworkButton /></div>
                ) : (
                    <div className="animate-fade-in">
                        {/* HEADER */}
                        <div className="mb-10">
                            <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#F97316] mb-2">Invoicing</p>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-[#111111] tracking-tight">
                                Get <span className="text-[#F97316]">Paid</span>
                            </h1>
                            <p className="mt-3 text-[#6B6B6B] max-w-2xl text-lg">Request funds from clients and track your incoming on-chain revenue.</p>
                        </div>

                        <SendRequest getDirectPaymentRequestData={getDirectPaymentRequestData} getLockedPaymentRequestData={getLockedPaymentRequestData} />

                        {/* TABLE SECTION */}
                        <div className="mt-16">
                            <h2 className="text-2xl font-bold text-[#111111] mb-6">Request History</h2>

                            <div className="glass-card p-0 overflow-hidden border border-[#EEEBE5] rounded-3xl">
                                {/* TABS / FILTERS */}
                                <div className="flex p-2 gap-2 bg-[#F7F6F3]">
                                    {RequestFilterData.map((item) => (
                                        <button
                                            key={item.id}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${filterName === item.name
                                                    ? 'bg-[#F97316] text-white shadow-lg shadow-orange-200'
                                                    : 'text-[#6B6B6B] hover:text-[#111111] hover:bg-[#FFF7ED]'
                                                }`}
                                            onClick={() => handleChangeFilter(item.name)}
                                        >
                                            <i className={item.icon}></i>
                                            <span className="hidden sm:inline">{item.name}</span>
                                        </button>
                                    ))}
                                </div>

                                <Box sx={dataGridSx}>
                                    <DataGrid
                                        rows={filterName === "Tracked Payment" ? trackedPaymentRequestData : directPaymentRequestData}
                                        columns={filterName === "Tracked Payment" ? trackedPaymentcolumns : directPaymentcolumns}
                                        loading={loading}
                                        rowHeight={70}
                                        disableRowSelectionOnClick
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

            {disputeModal && <DisputeModal setDisputeModal={setDisputeModal} currentItem={currentItem} setCurrentItem={setCurrentItem} />}
        </div>
    );
};

export default GetPaid;