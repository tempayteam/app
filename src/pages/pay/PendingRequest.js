import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ethers } from 'ethers';
import React, { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { CPGABI } from '../../ABI/ABI';
import { targetChainId, CPGAddress, defaultPageSize, initialTokenList, pageSizeLength } from '../../constant/constant';
import ApproveRequestModal from '../../Modal/ApproveRequest';
import { copyToClipboard, CustomNoRowsOverlay, formatNumber, shortenWalletAddress } from '../../utils/commonFunction';
import { readContractData } from '../../utils/contractInstance';
import { Tooltip } from 'react-tooltip';
import { copyIcon } from '../../constant/icon';

const PendingRequest = ({ selectedPaymentType }) => {
    const [approveReqModal, setApproveReqModal] = useState(false);
    const [currentItem, setCurrentItem] = useState({});
    const [loading, setLoading] = useState(false);
    const [pendingPaymentData, setPendingPaymentData] = useState([]);
    const [pageSize, setPageSize] = useState(defaultPageSize);

    const handlePaginationModelChange = (model) => setPageSize(model.pageSize);
    const { isConnected, address: walletAddress, chainId } = useAccount();
    const approveRef = useRef();

    const handleOpenApproveModal = (item) => {
        setCurrentItem(item);
        setApproveReqModal(true);
    };

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 70,
            headerAlign: 'left',
            align: 'left',
            renderCell: (params) => <span className="text-slate-500 font-mono">#{params.value}</span>
        },
        {
            field: 'requester',
            headerName: 'Requester',
            flex: 1.5,
            minWidth: 180,
            renderCell: (params) => (
                <div className='flex items-center gap-2 group'>
                    <div className="w-8 h-8 rounded-full bg-[#FFF7ED] flex items-center justify-center border border-[#FED7AA]">
                        <i className="fas fa-user text-[10px] text-[#F97316]"></i>
                    </div>
                    <span className="text-slate-200 font-medium">{shortenWalletAddress(params.value)}</span>
                    <button
                        onClick={() => copyToClipboard(params.value)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#FFF7ED] rounded"
                    >
                        <i className={`${copyIcon} text-slate-500 text-xs`} />
                    </button>
                </div>
            )
        },
        {
            field: 'tokenName',
            headerName: 'Asset',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <div className='flex items-center gap-3'>
                    <img src={params.row.tokenImage} alt="" className='w-7 h-7 rounded-full shadow-sm' />
                    <span className="font-semibold text-slate-200">{params.row.tokenName}</span>
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
                    {params.value} <span className="text-[10px] text-slate-500 ml-1">{params.row.tokenName}</span>
                </span>
            )
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: () => (
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
                    ● Pending
                </span>
            )
        },
        {
            field: 'action',
            headerName: 'Action',
            width: 120,
            sortable: false,
            headerAlign: 'right',
            align: 'right',
            renderCell: (params) => (
                <button
                    className='bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold px-5 py-2 rounded-lg transition-all shadow-lg shadow-orange-200'
                    onClick={() => handleOpenApproveModal(params.row)}
                >
                    View
                </button>
            ),
        },
    ];

    const getPendingRequestData = async () => {
        try {
            setLoading(true);
            const count = await readContractData(CPGAddress, CPGABI, 'getDirectPaymentRequestCountByReceiver', [walletAddress]);
            const pendingRequests = [];
            if (Number(count) > 0) {
                for (let i = 0; i < Number(count); i++) {
                    const paymentData = await readContractData(CPGAddress, CPGABI, 'getDirectPaymentRequestByReceiver', [walletAddress, i]);
                    const tokenInfo = initialTokenList.find(
                        token => token.address?.toLowerCase() === paymentData.tokenAddress?.toLowerCase()
                    );
                    if (tokenInfo) {
                        const formatted = parseFloat(ethers.formatUnits(paymentData.amount, tokenInfo.decimals));
                        pendingRequests.push({
                            ...paymentData,
                            id: Number(paymentData.requestId),
                            amount: formatNumber(formatted),
                            tokenName: tokenInfo.name,
                            tokenImage: tokenInfo.logoURI,
                        });
                    }
                }
                setPendingPaymentData(pendingRequests.filter(p => !p.isAccepted));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isConnected && chainId === targetChainId) getPendingRequestData();
    }, [walletAddress]);

    return (
        <div className="mt-12 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <h2 className='text-2xl font-bold text-[#111111] flex items-center gap-3'>
                    Pending Requests
                    <span className="text-xs bg-[#FFF7ED] text-[#F97316] px-2 py-1 rounded-md font-mono">
                        {pendingPaymentData.length}
                    </span>
                </h2>
            </div>

            <div className='relative overflow-hidden rounded-3xl border border-[#EEEBE5] bg-white shadow-2xl'>
                <Box sx={{
                    width: '100%',
                    height: 500,
                    '& .MuiDataGrid-root': {
                        border: 'none',
                        color: '#cbd5e1',
                        '--DataGrid-rowBorderColor': '#1e293b',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#0f172a',
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontWeight: 800,
                        borderBottom: '1px solid #1e293b',
                    },
                    '& .MuiDataGrid-cell': {
                        fontSize: '0.875rem',
                        borderBottom: '1px solid #1e293b',
                        display: 'flex',
                        alignItems: 'center',
                    },
                    '& .MuiDataGrid-row:hover': {
                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    },
                    '& .MuiDataGrid-footerContainer': {
                        borderTop: '1px solid #1e293b',
                        backgroundColor: '#0f172a',
                    },
                    '& .MuiTablePagination-root': {
                        color: '#94a3b8',
                    }
                }}>
                    <DataGrid
                        rows={pendingPaymentData}
                        columns={columns}
                        loading={loading}
                        rowHeight={70}
                        disableRowSelectionOnClick
                        pageSizeOptions={[5, 10, 25]}
                        initialState={{
                            pagination: { paginationModel: { pageSize } },
                        }}
                        onPaginationModelChange={handlePaginationModelChange}
                        slots={{ noRowsOverlay: CustomNoRowsOverlay }}
                    />
                </Box>
            </div>

            {approveReqModal && (
                <ApproveRequestModal
                    setApproveReqModal={setApproveReqModal}
                    currentItem={currentItem}
                    setCurrentItem={setCurrentItem}
                    getPendingRequestData={getPendingRequestData}
                    selectedPaymentType={selectedPaymentType}
                />
            )}
        </div>
    );
};

export default PendingRequest;