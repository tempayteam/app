import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import React, { useRef, useState, useEffect } from 'react'
import { copyToClipboard, CustomNoRowsOverlay, CustomDataGridSkeleton, fireErrorToast, fireInfoToast, getDueDate, getMonthInWordWithDateAndYear, getRaisedDisputeDate, shortenWalletAddress } from '../../../utils/commonFunction';
import NeedResponse from '../../../Modal/NeedResponse'
import { CPGAddress, defaultPageSize, initialTokenList, pageSizeLength, PENDING_DISPUTE, RESOLVE_DISPUTE } from '../../../constant/constant';
import { CPGABI } from '../../../ABI/ABI';
import { readContractData } from '../../../utils/contractInstance';
import { copyIcon } from '../../../constant/icon';
import { Tooltip } from 'react-tooltip';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import Loader from '../../../components/loader/Loader';
const AdminDispute = () => {
    const [searchInput, setSearchInput] = useState('')
    const [activeSection, setActiveSection] = useState(PENDING_DISPUTE)
    const [currentItem, setCurrentItem] = useState(null)
    const [needResponseModal, setNeedResponseModal] = useState(null)
    const [allResolveDispute, setAllResolveDispute] = useState([])
    const [allPendingDispute, setAllPendingDispute] = useState([])
    const [dataLoading, setDataLoading] = useState(false)
    const [pageSize, setPageSize] = useState(defaultPageSize)

    const { address: walletAddress } = useAccount()

    const needResponseRef = useRef()

    const handleSearchChange = (event) => {
        setSearchInput(event.target.value);
    };


    const handleOpenApproveModal = (item) => {
        setCurrentItem(item)
        needResponseRef.current.click()

    }

    // --- REUSABLE COLUMN COMPONENTS ---
    const renderAddressCell = (address) => (
        <div className='flex items-center gap-2 group'>
            <div className="w-7 h-7 rounded-full bg-[#FFF7ED] flex items-center justify-center border border-[#FED7AA]">
                <i className="fas fa-user-shield text-[10px] text-[#F97316]"></i>
            </div>
            <span className="text-[#111111] font-medium">{shortenWalletAddress(address)}</span>
            <button onClick={() => copyToClipboard(address)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#FFF7ED] rounded transition-all">
                <i className={`${copyIcon} text-[#9B9B9B] text-xs`} />
            </button>
        </div>
    );

    const commonColumns = [
        { field: 'id', headerName: 'ID', width: 70, renderCell: (p) => <span className="text-[#9B9B9B] font-mono">#{p.value}</span> },
        { field: 'raisedBy', headerName: 'Raised By', flex: 1, minWidth: 170, renderCell: (p) => renderAddressCell(p.value) },
        { field: 'raisedAgainst', headerName: 'Against', flex: 1, minWidth: 170, renderCell: (p) => renderAddressCell(p.value) },
        {
            field: 'amount',
            headerName: 'Amount',
            width: 130,
            renderCell: (p) => <span className="text-[#111111] font-bold tabular-nums">{p.value}</span>
        },
        { field: 'raisedDate', headerName: 'Raised On', width: 130, renderCell: (p) => <span className="text-[#6B6B6B] text-xs">{p.value}</span> },
    ];

    const allPendingColumns = [
        ...commonColumns,
        { field: 'dueDate', headerName: 'Deadline', width: 130, renderCell: (p) => <span className="text-amber-400 text-xs font-bold">{p.value}</span> },
        {
            field: 'action', headerName: 'Action', width: 160, align: 'right', headerAlign: 'right', sortable: false,
            renderCell: (params) => (
                <button
                    className='bg-[#F97316] hover:bg-[#EA580C] text-white text-[10px] font-bold px-4 py-2 rounded-lg transition-all shadow-lg shadow-orange-200'
                    onClick={() => fireInfoToast("COMING SOON")}
                >
                    Review Case
                </button>
            ),
        },
    ];

    const allResolveColumns = [
        ...commonColumns,
        { field: 'resolveDate', headerName: 'Resolved On', width: 130, renderCell: (p) => <span className="text-emerald-400 text-xs font-bold">{p.value}</span> },
        {
            field: 'status', headerName: 'Verdict', width: 130, align: 'right', headerAlign: 'right',
            renderCell: (params) => (
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${params.row.refund ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                    {params.row.refund ? 'Refunded' : 'Rejected'}
                </span>
            ),
        }
    ];

    const handlePaginationModelChange = (model) => {
        setPageSize(model.pageSize);
    }



    // const filteredCloseRows = allResolveDispute.filter(row =>
    //     row.raisedBy.toLowerCase().includes(searchInput.toLowerCase())
    // );
    const filteredNeedResponseRows = allPendingDispute.filter(row =>
        row.raisedBy.toLowerCase().includes(searchInput.toLowerCase())
    );

    function getClaimedAmount(claimedMilestones, totalPayment, totalMilestones) {
        claimedMilestones = new BigNumber(claimedMilestones);
        totalPayment = new BigNumber(totalPayment);
        totalMilestones = new BigNumber(totalMilestones);

        const amountPerMilestone = totalPayment.dividedBy(totalMilestones)
        const claimedPayment = claimedMilestones.multipliedBy(amountPerMilestone)
        return claimedPayment.toFixed(0)

    }


    const getPendingDispute = async () => {
        try {
            setDataLoading(true)
            const count = await readContractData(CPGAddress, CPGABI, 'disputeCount', [])


            const alldisputeData = [];

            if (Number(count) > 0) {

                for (let i = 0; i < Number(count); i++) {
                    const disputeId = await readContractData(CPGAddress, CPGABI, 'disputeIds', [i]);
                    const disputesData = await readContractData(CPGAddress, CPGABI, 'disputes', [disputeId]);
                    const paymentData = await readContractData(CPGAddress, CPGABI, 'lockedPayments', [disputesData[0]])

                    const sender = paymentData[1]
                    const receiver = paymentData[2]
                    const totalAmount = paymentData[4]
                    const milestone = paymentData[5]
                    const claimedMilestone = paymentData[7]
                    const id = Number(disputesData[0])
                    const raisedBy = disputesData[1]
                    const resolved = disputesData[2]
                    const refund = disputesData[3]
                    const raisedTimestamp = disputesData[4]
                    const resolvedTimestamp = disputesData[5]
                    const raisedAgainst = sender === raisedBy ? receiver : sender
                    // const status = !resolved ? (!refund ? "Pending" : "Continue Payment") : (refund ? "Refunded" : "Continue Payment")

                    const tokenInfo = initialTokenList.find(token => token.address === paymentData[3]);
                    const raisedDate = getRaisedDisputeDate(raisedTimestamp)
                    const resolveDate = getRaisedDisputeDate(resolvedTimestamp)
                    const dueDate = getDueDate(raisedTimestamp) || 0


                    if (tokenInfo) {
                        const { name, decimals, logoURI } = tokenInfo;
                        const formatted = parseFloat(ethers.formatUnits(totalAmount, decimals));
                        const parsedNumber = parseFloat(formatted);

                        const amount = Number.isInteger(parsedNumber) ? parsedNumber : formatted.toFixed(2);
                        const claimedAmount = getClaimedAmount(claimedMilestone, totalAmount, milestone)

                        try {
                            const processedData = {
                                id,
                                raisedBy,
                                raisedAgainst,
                                amount,
                                resolved,
                                claimedAmount: parseFloat(ethers.formatUnits(claimedAmount, decimals)).toFixed(2),
                                refund,
                                raisedTimestamp,
                                resolvedTimestamp,
                                raisedDate,
                                resolveDate,
                                dueDate,

                            };

                            alldisputeData.push(processedData);

                        }
                        catch (e) {

                            console.log("Error making data object :", e);

                        }
                    }
                }

                const resolveData = alldisputeData.filter(payment => payment.resolved === true);
                const pendingData = alldisputeData.filter(payment => payment.resolved === false);
                setAllPendingDispute(pendingData)
                setAllResolveDispute(resolveData)

            }
        } catch (error) {
            console.log("Error getting data :", error);

        } finally {
            setDataLoading(false)
        }
    }

    useEffect(() => {
        getPendingDispute()
    }, [walletAddress])

    const dataGridSx = {
        width: '100%', height: 500,
        '& .MuiDataGrid-root': { border: 'none', color: '#111111', '--DataGrid-rowBorderColor': '#EEEBE5' },
        '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F7F6F3', color: '#6B6B6B', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, borderBottom: '1px solid #EEEBE5' },
        '& .MuiDataGrid-cell': { fontSize: '0.8rem', borderBottom: '1px solid #EEEBE5', display: 'flex', alignItems: 'center' },
        '& .MuiDataGrid-row:hover': { backgroundColor: '#FFF7ED' },
        '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #EEEBE5', backgroundColor: '#F7F6F3' },
    };

    const filteredRows = allPendingDispute.filter(row =>
        row.raisedBy.toLowerCase().includes(searchInput.toLowerCase()) ||
        row.raisedAgainst.toLowerCase().includes(searchInput.toLowerCase())
    );


    return (
        <div className="crypto-page relative min-h-[calc(100vh-80px)] bg-[#F7F6F3]">
            <div className="crypto-gradient-bg opacity-20" />
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* ADMIN HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                    <div className="animate-fade-in-up">
                        <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#F97316] mb-2">Admin Control</p>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-[#111111] tracking-tight">Dispute <span className="text-[#F97316]">Queue</span></h1>
                        <p className="mt-3 text-[#6B6B6B] max-w-xl text-lg">Review raised conflicts and issue final verdicts for locked payments.</p>
                    </div>

                    <div className="relative w-full md:w-80 group animate-fade-in-up">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                            <svg className="w-4 h-4 text-[#9B9B9B] group-focus-within:text-[#F97316] transition-colors" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input
                            type="search"
                            className="block w-full bg-white border border-[#EEEBE5] text-[#111111] text-sm rounded-2xl focus:ring-2 focus:ring-[#F97316]/30 p-3.5 ps-11 transition-all outline-none"
                            placeholder="Search by wallet..."
                            value={searchInput}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>

                {/* SECTION SWITCHER */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                    <div
                        onClick={() => setActiveSection(PENDING_DISPUTE)}
                        className={`p-6 rounded-2xl border transition-all cursor-pointer group animate-fade-in-up ${activeSection === PENDING_DISPUTE ? 'bg-[#FFF7ED] border-[#F97316] shadow-lg shadow-orange-200' : 'bg-white border-[#EEEBE5] hover:border-[#FED7AA]'}`}
                    >
                        <div className="flex justify-between items-start">
                            <p className={`text-xs font-bold uppercase tracking-widest ${activeSection === PENDING_DISPUTE ? 'text-[#F97316]' : 'text-[#9B9B9B]'}`}>Pending Action</p>
                            <div className={`p-2 rounded-lg ${activeSection === PENDING_DISPUTE ? 'bg-[#F97316] text-white' : 'bg-[#F7F6F3] text-[#9B9B9B]'}`}>
                                <i className="fas fa-clock text-sm"></i>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-[#111111] mt-2">
                            {dataLoading ? <Loader size="20px" /> : allPendingDispute.length}
                        </div>
                    </div>

                    <div
                        onClick={() => setActiveSection(RESOLVE_DISPUTE)}
                        className={`p-6 rounded-2xl border transition-all cursor-pointer group animate-fade-in-up ${activeSection === RESOLVE_DISPUTE ? 'bg-[#FFF7ED] border-[#F97316] shadow-lg shadow-orange-200' : 'bg-white border-[#EEEBE5] hover:border-[#FED7AA]'}`}
                    >
                        <div className="flex justify-between items-start">
                            <p className={`text-xs font-bold uppercase tracking-widest ${activeSection === RESOLVE_DISPUTE ? 'text-[#F97316]' : 'text-[#9B9B9B]'}`}>History</p>
                            <div className={`p-2 rounded-lg ${activeSection === RESOLVE_DISPUTE ? 'bg-[#F97316] text-white' : 'bg-[#F7F6F3] text-[#9B9B9B]'}`}>
                                <i className="fas fa-history text-sm"></i>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-[#111111] mt-2">
                            {dataLoading ? <Loader size="20px" /> : allResolveDispute.length}
                        </div>
                    </div>
                </div>

                {/* TABLE SECTION */}
                <div className="glass-card border border-[#EEEBE5] rounded-3xl bg-white overflow-hidden shadow-xl animate-fade-in-up">
                    <Box sx={dataGridSx}>
                        <DataGrid
                            rows={activeSection === PENDING_DISPUTE ? filteredRows : allResolveDispute}
                            columns={activeSection === PENDING_DISPUTE ? allPendingColumns : allResolveColumns}
                            loading={dataLoading}
                            rowHeight={75}
                            initialState={{ pagination: { paginationModel: { pageSize } } }}
                            onPaginationModelChange={handlePaginationModelChange}
                            slots={{ noRowsOverlay: CustomNoRowsOverlay, loadingOverlay: CustomDataGridSkeleton }}
                        />
                    </Box>
                </div>
            </div>

            {/* MODAL */}
            {needResponseModal && (
                <NeedResponse
                    setNeedResponseModal={setNeedResponseModal}
                    currentItem={currentItem}
                    setCurrentItem={setCurrentItem}
                    getPendingDispute={getPendingDispute}
                />
            )}
        </div>
    );
}

export default AdminDispute