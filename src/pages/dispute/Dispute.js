import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { copyToClipboard, CustomNoRowsOverlay, CustomDataGridSkeleton, getDueDate, getMonthInWordWithDateAndYear, getRaisedDisputeDate, shortenWalletAddress } from '../../utils/commonFunction';
import ConnectWalletButton from '../../components/connectWallet/ConnectWalletButton';
import SwitchNetworkButton from '../../components/connectWallet/SwitchNetworkButton';
import { useAccount, useChainId, useChains } from 'wagmi';
import { targetChainId, CPGAddress, defaultPageSize, disputeDuration, initialTokenList, pageSizeLength } from '../../constant/constant';
import { readContractData } from '../../utils/contractInstance';
import { CPGABI } from '../../ABI/ABI';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { copyIcon, helpIcon } from '../../constant/icon';
import { Tooltip } from 'react-tooltip';
import { Box } from '@mui/material';
import Loader from '../../components/loader/Loader';


const Dispute = () => {
    const [activeSection, setActiveSection] = useState('openDispute');
    const [allOpenDispute, setAllOpenDispute] = useState([]);
    const [allCloseDispute, setAllCloseDispute] = useState([]);
    const [dataLoading, setDataLoading] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [pageSize, setPageSize] = useState(defaultPageSize)
    const [totalOpenDispute, setTotalOpenDispute] = useState(0)
    const [totalCloseDispute, setTotalCloseDispute] = useState(0)

    const navigate = useNavigate();

    const { isConnected, address: walletAddress, chainId } = useAccount()
    // const chainId = useChainId();


    const handlePaginationModelChange = (model) => {
        setPageSize(model.pageSize);
    }

    function getClaimedAmount(claimedMilestones, totalPayment, totalMilestones) {
        claimedMilestones = new BigNumber(claimedMilestones);
        totalPayment = new BigNumber(totalPayment);
        totalMilestones = new BigNumber(totalMilestones);

        const amountPerMilestone = totalPayment.dividedBy(totalMilestones)
        const claimedPayment = claimedMilestones.multipliedBy(amountPerMilestone)

        return claimedPayment.toFixed()

    }

    // --- SHARED COLUMN STYLING ---
    const addressCell = (address) => (
        <div className='flex items-center gap-2 group'>
            <div className="w-7 h-7 rounded-full bg-[#FFF7ED] flex items-center justify-center border border-[#FED7AA]">
                <i className="fas fa-shield-alt text-[10px] text-[#F97316]"></i>
            </div>
            <span className="text-[#111111] font-medium">{shortenWalletAddress(address)}</span>
            <button onClick={() => copyToClipboard(address)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-opacity">
                <i className={`${copyIcon} text-[#6B6B6B] text-xs`} />
            </button>
        </div>
    );

    const columns = [
        { field: 'id', headerName: 'ID', width: 70, renderCell: (p) => <span className="text-[#9B9B9B] font-mono">#{p.value}</span> },
        { field: 'senderAddress', headerName: 'Sender', flex: 1.2, minWidth: 170, renderCell: (p) => addressCell(p.value) },
        { field: 'receiverAddress', headerName: 'Receiver', flex: 1.2, minWidth: 170, renderCell: (p) => addressCell(p.value) },
        {
            field: 'amount',
            headerName: 'Total',
            width: 130,
            renderCell: (p) => <span className="text-[#111111] font-bold tabular-nums">{p.value} <span className="text-[10px] text-[#6B6B6B]">{p.row.tokenName}</span></span>
        },
        { field: 'raisedDate', headerName: 'Raised On', width: 130, renderCell: (p) => <span className="text-[#6B6B6B] text-xs">{p.value}</span> },
        {
            field: 'dueDate',
            headerName: activeSection === 'openDispute' ? 'Due Date' : 'Resolved Date',
            width: 140,
            renderCell: (p) => (
                <span className={`text-xs font-medium ${activeSection === 'openDispute' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {activeSection === 'openDispute' ? p.row.dueDate : p.row.resolveDate}
                </span>
            )
        },
        {
            field: 'action', headerName: 'Action', width: 150, align: 'right', headerAlign: 'right', sortable: false,
            renderCell: () => (
                <button
                    className='bg-[#F97316]/10 hover:bg-[#F97316] text-[#F97316] hover:text-white border border-[#F97316]/20 text-[10px] font-bold px-4 py-2 rounded-lg transition-all'
                    onClick={handleSupportCenter}
                >Support</button>
            ),
        },
    ];

    const openDisputecolumns = [
        {
            field: 'id',
            headerName: 'Id',
            minWidth: 90,
            headerAlign: 'center',
            align: 'center',
            headerClassName: 'super-app-theme--header '
        },
        {
            field: 'senderAddress',
            headerName: 'Sender Address',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 200,
            headerClassName: 'super-app-theme--header',
            renderCell: (params) => {
                return <>
                    <div className='text-center'>

                        <div className='flex justify-center items-center'>
                            <p data-tooltip-id={`my-tooltip-${params.row.id}`}>
                                {shortenWalletAddress(params.row.senderAddress)}
                            </p>
                            <button className='' onClick={() => copyToClipboard(params.row.senderAddress)}>
                                <i className={`text-gray-500 text-sm ms-2 ${copyIcon}`} />
                            </button>
                        </div>


                    </div>
                    {params.row.senderAddress && <Tooltip id={`my-tooltip-${params.row.id}`}
                        place='bottom'
                        content={params.row.senderAddress} />}
                </>
            }
        },
        {
            field: 'receiverAddress',
            headerName: 'Receiver Address',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 200,
            headerClassName: 'super-app-theme--header',
            renderCell: (params) => {
                return <>
                    <div className='text-center'>
                        {params.row.receiverAddress &&
                            <div className='flex justify-center items-center'>
                                <p data-tooltip-id={`my-tooltip-${params.row.receiverAddress}`}>
                                    {shortenWalletAddress(params.row.receiverAddress)}
                                </p>
                                <button className='' onClick={() => copyToClipboard(params.row.receiverAddress)}>
                                    <i className={`text-gray-500 text-sm ms-2 ${copyIcon}`} />
                                </button>
                            </div>
                        }

                    </div>
                    {params.row.receiverAddress && <Tooltip id={`my-tooltip-${params.row.receiverAddress}`}
                        place='bottom'
                        content={params.row.receiverAddress} />}
                </>
            }
        },
        {
            field: 'amount',
            headerName: 'Total Amount',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 200,
            headerClassName: 'super-app-theme--header'
        },
        {
            field: 'claimedAmount',
            headerName: 'Claimed Amount',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 200,
            headerClassName: 'super-app-theme--header'
        },
        {
            field: 'raisedDate',
            headerName: 'Raised Date',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 150,
            headerClassName: 'super-app-theme--header',

        },
        {
            field: 'dueDate',
            headerName: 'Due Date',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 200,
            headerClassName: 'super-app-theme--header',

        },
        // {
        //     field: 'status',
        //     headerName: 'Status',
        //     flex: 1,
        //     headerAlign: 'center',
        //     align: 'center',
        //     minWidth: 200,
        //     headerClassName: 'super-app-theme--header',
        //     renderCell: (params) => {
        //         const statusColor = params.value === 'Completed' ? 'text-green-600' : 'text-yellow-500';
        //         return (
        //             <div className={`flex justify-center ${statusColor}`}>
        //                 <div className='px-10 h-10 flex items-center my-1 rounded-xl'>
        //                     <p>{params.value}</p>
        //                 </div>
        //             </div>
        //         );
        //     },
        // },
        {
            field: 'action',
            headerName: 'Action',
            flex: 1,
            minWidth: 200,
            headerAlign: 'center',
            headerClassName: 'super-app-theme--header',
            sortable: false,
            renderCell: (params) => (
                <div className='flex justify-center'>
                    <button
                        className='border border-[#F97316]/80 text-[#F97316] hover:bg-[#F97316]/10 px-8 h-10 flex items-center my-1 rounded-xl transition-colors'
                        onClick={() => handleSupportCenter(params.row)}
                    >
                        Support Center
                    </button>
                </div>
            ),
        },
    ];

    const closeDisputecolumns = [
        {
            field: 'id',
            headerName: 'Id',
            minWidth: 90,
            headerAlign: 'center',
            align: 'center',
            headerClassName: 'super-app-theme--header '
        },
        {
            field: 'senderAddress',
            headerName: 'Sender Address',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 200,
            headerClassName: 'super-app-theme--header',
            renderCell: (params) => {
                return <>
                    <div className='text-center'>

                        <div className='flex justify-center items-center'>
                            <p data-tooltip-id={`my-tooltip-${params.row.id}`}>
                                {shortenWalletAddress(params.row.senderAddress)}
                            </p>
                            <button className='' onClick={() => copyToClipboard(params.row.senderAddress)}>
                                <i className={`text-gray-500 text-sm ms-2 ${copyIcon}`} />
                            </button>
                        </div>


                    </div>
                    {params.row.senderAddress && <Tooltip id={`my-tooltip-${params.row.id}`}
                        place='bottom'
                        content={params.row.senderAddress} />}
                </>
            }
        },
        {
            field: 'receiverAddress',
            headerName: 'Receiver Address',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 150,
            headerClassName: 'super-app-theme--header',
            renderCell: (params) => {
                return <>
                    <div className='text-center'>
                        {params.row.receiverAddress &&
                            <div className='flex justify-center items-center'>
                                <p data-tooltip-id={`my-tooltip-${params.row.receiverAddress}`}>
                                    {shortenWalletAddress(params.row.receiverAddress)}
                                </p>
                                <button className='' onClick={() => copyToClipboard(params.row.receiverAddress)}>
                                    <i className={`text-gray-500 text-sm ms-2 ${copyIcon}`} />
                                </button>
                            </div>
                        }

                    </div>
                    {params.row.receiverAddress && <Tooltip id={`my-tooltip-${params.row.receiverAddress}`}
                        place='bottom'
                        content={params.row.receiverAddress} />}
                </>
            }
        },
        {
            field: 'amount',
            headerName: 'Total Amount',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 150,
            headerClassName: 'super-app-theme--header'
        },
        {
            field: 'claimedAmount',
            headerName: 'Claimed Amount',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 150,
            headerClassName: 'super-app-theme--header'
        },
        {
            field: 'raisedDate',
            headerName: 'Raised Date',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 150,
            headerClassName: 'super-app-theme--header',

        },
        {
            field: 'resolveDate',
            headerName: 'Resolved Date',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 150,
            headerClassName: 'super-app-theme--header',

        },
        // {
        //     field: 'status',
        //     headerName: 'Status',
        //     flex: 1,
        //     headerAlign: 'center',
        //     align: 'center',
        //     minWidth: 150,
        //     headerClassName: 'super-app-theme--header',
        //     renderCell: (params) => {
        //         const statusColor = params.value === 'Completed' ? 'text-green-600' : 'text-yellow-500';
        //         return (
        //             <div className={`flex justify-center ${statusColor}`}>
        //                 <div className='px-10 h-10 flex items-center my-1 rounded-xl'>
        //                     <p>{params.value}</p>
        //                 </div>
        //             </div>
        //         );
        //     },
        // },
        {
            field: 'action',
            headerName: 'Action',
            flex: 1,
            minWidth: 200,
            headerAlign: 'center',
            headerClassName: 'super-app-theme--header',
            sortable: false,
            renderCell: (params) => (
                <div className='flex justify-center'>
                    <button
                        className='border border-[#F97316]/80 text-[#F97316] hover:bg-[#FFF7ED] px-8 h-10 flex items-center my-1 rounded-xl transition-colors'
                        onClick={() => handleSupportCenter(params.row)}
                    >
                        Support Center
                    </button>
                </div>
            ),
        },
    ];


    const filteredOpenRows = allOpenDispute?.filter(row =>
        row.senderAddress.toLowerCase().includes(searchInput.toLowerCase()) ||
        row.receiverAddress.toLowerCase().includes(searchInput.toLowerCase())
    );
    const filteredCloseRows = allCloseDispute?.filter(row =>
        row.senderAddress.toLowerCase().includes(searchInput.toLowerCase()) ||
        row.receiverAddress.toLowerCase().includes(searchInput.toLowerCase())
    );

    const handleSearchChange = (event) => {
        setSearchInput(event.target.value);
    };

    const handleSupportCenter = () => {
        navigate('/dispute/support-center');
    };

    const handleReportClick = () => {
        navigate('/dispute/report-problem');
    };



    const getAllOpenDispute = async () => {
        try {
            setDataLoading(true)
            const count = await readContractData(CPGAddress, CPGABI, 'disputeCountOfUser', [walletAddress])
            const onGoingPayment = [];
            if (Number(count) > 0) {

                for (let i = 0; i < Number(count); i++) {
                    const disputeId = await readContractData(CPGAddress, CPGABI, 'disputesByUser', [walletAddress, i]);


                    const disputeData = await readContractData(CPGAddress, CPGABI, 'disputes', [disputeId]);
                    const paymentData = await readContractData(CPGAddress, CPGABI, 'lockedPayments', [disputeData[0]]);

                    const processedPaymentData = {
                        id: paymentData[0],
                        sender: paymentData[1],
                        receiver: paymentData[2],
                        tokenAddress: paymentData[3],
                        amount: paymentData[4],
                        milestone: paymentData[5],
                        milestoneInterval: paymentData[6],
                        claimedMilestone: paymentData[7],
                        startTime: paymentData[8]
                    }


                    // Find the token data based on the tokenAddress in disputeData
                    const tokenInfo = initialTokenList.find(token => token.address === processedPaymentData.tokenAddress);

                    if (tokenInfo) {
                        const { name, decimals, logoURI } = tokenInfo;

                        // Convert the amount using the token decimal
                        // const amount = parseFloat(ethers.formatUnits(disputeData.amount, decimals));
                        const formatted = parseFloat(ethers.formatUnits(processedPaymentData.amount, decimals));
                        const parsedNumber = parseFloat(formatted);

                        const amount = Number.isInteger(parsedNumber) ? parsedNumber : formatted.toFixed(2);

                        // const claimableAmountInWei = calculateClaimableAmount(
                        //     disputeData.startTime,
                        //     disputeData.milestoneInterval,
                        //     disputeData.claimedMilestones,
                        //     disputeData.totalAmount,
                        //     disputeData.milestones
                        // );

                        // const claimedPayment = getClaimedAmount(
                        //     disputeData.claimedMilestones,
                        //     disputeData.totalAmount,
                        //     disputeData.milestones
                        // );
                        // Add tokenName and converted amount to the processed data

                        const dueDate = getDueDate(disputeData[4]) || 0
                        const raisedDate = getRaisedDisputeDate(disputeData[4])
                        const resolveDate = getRaisedDisputeDate(disputeData[5])
                        const claimedAmount = getClaimedAmount(processedPaymentData.claimedMilestone, processedPaymentData.amount, processedPaymentData.milestone)
                        try {


                            const processedData = {
                                id: Number(disputeId),
                                raisedBy: disputeData[1],
                                resolved: disputeData[2],
                                raisedTimestamp: disputeData[3],
                                resolvedTimestamp: disputeData[4],
                                amount,
                                tokenName: name,
                                tokenImage: logoURI,     // Add token name
                                tokenDecimal: decimals,    // Add token decimal if needed for further processing
                                // claimableAmount: ethers.formatUnits(claimableAmountInWei, decimals),
                                claimedAmount: ethers.formatUnits(claimedAmount, decimals),
                                senderAddress: processedPaymentData.sender,
                                receiverAddress: processedPaymentData.receiver,
                                claimedMilestone: processedPaymentData.claimedMilestone,
                                milestone: processedPaymentData.milestone,
                                milestoneInterval: processedPaymentData.milestoneInterval,
                                raisedDate,
                                resolveDate,
                                dueDate
                            };

                            onGoingPayment.push(processedData);

                        }
                        catch (e) {

                            console.log(e);

                        }
                    } else {
                        console.warn(`Token information not found for address: ${disputeData.tokenAddress}`);
                    }
                }

                const closeDispute = onGoingPayment.filter(dispute => dispute.resolved === true);
                const openDispute = onGoingPayment.filter(dispute => dispute.resolved === false);

                setTotalCloseDispute(closeDispute.length)
                setTotalOpenDispute(openDispute.length)
                setAllCloseDispute(closeDispute)
                setAllOpenDispute(openDispute);
            }
        } catch (error) {
            console.log(error);

        } finally {
            setDataLoading(false)
        }
    }

    useEffect(() => {
        getAllOpenDispute()
        // eslint-disable-next-line
    }, [walletAddress])


    const dataGridSx = {
        width: '100%', height: 500,
        '& .MuiDataGrid-root': { border: 'none', color: '#111111', '--DataGrid-rowBorderColor': '#EEEBE5' },
        '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F7F6F3', color: '#6B6B6B', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, borderBottom: '1px solid #EEEBE5' },
        '& .MuiDataGrid-cell': { fontSize: '0.8rem', borderBottom: '1px solid #EEEBE5', display: 'flex', alignItems: 'center', color: '#111111' },
        '& .MuiDataGrid-row:hover': { backgroundColor: '#FFF7ED' },
        '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #EEEBE5', backgroundColor: '#F7F6F3' },
        '& .MuiTablePagination-root': { color: '#6B6B6B' },
    };

    const filteredRows = activeSection === 'openDispute'
        ? allOpenDispute.filter(row => row.senderAddress.toLowerCase().includes(searchInput.toLowerCase()) || row.receiverAddress.toLowerCase().includes(searchInput.toLowerCase()))
        : allCloseDispute.filter(row => row.senderAddress.toLowerCase().includes(searchInput.toLowerCase()) || row.receiverAddress.toLowerCase().includes(searchInput.toLowerCase()));

    return (
        <div className="crypto-page relative min-h-[calc(100vh-80px)] bg-[#F7F6F3]">
            <div className="crypto-gradient-bg" />
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

                {!isConnected ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in"><ConnectWalletButton /></div>
                ) : chainId !== targetChainId ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in"><SwitchNetworkButton /></div>
                ) : (
                    <div className="animate-fade-in">
                        {/* HEADER & SEARCH */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-10">
                            <div>
                                <p className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-[#F97316] mb-2">Resolution Center</p>
                                <h1 className="text-3xl md:text-5xl font-extrabold text-[#111111] tracking-tight">Dispute <span className="text-[#F97316]">Management</span></h1>
                                <p className="mt-2 md:mt-3 text-[#6B6B6B] max-w-xl text-base md:text-lg">Resolve conflicts and monitor transaction mediation status.</p>
                            </div>

                            <div className="relative w-full md:w-80 group">
                                <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                                    <svg className="w-4 h-4 text-[#9B9B9B] group-focus-within:text-[#F97316] transition-colors" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                    </svg>
                                </div>
                                <input
                                    type="search"
                                    className="block w-full bg-white border border-[#EEEBE5] text-[#111111] text-sm rounded-2xl focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] p-3.5 ps-11 transition-all outline-none"
                                    placeholder="Search by wallet address..."
                                    value={searchInput}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        </div>

                        {/* SECTION SWITCHER CARDS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-8 md:mb-12">
                            <div
                                onClick={() => setActiveSection('openDispute')}
                                className={`p-4 md:p-6 rounded-2xl border transition-all cursor-pointer group ${activeSection === 'openDispute' ? 'bg-[#FFF7ED] border-[#F97316] shadow-lg shadow-orange-100' : 'bg-white border-[#EEEBE5] hover:border-[#FED7AA]'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <p className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${activeSection === 'openDispute' ? 'text-[#F97316]' : 'text-[#6B6B6B]'}`}>Open Cases</p>
                                    <div className={`p-2 rounded-lg ${activeSection === 'openDispute' ? 'bg-[#F97316] text-white' : 'bg-gray-100 text-[#6B6B6B]'}`}>
                                        <i className="fas fa-folder-open text-xs md:text-sm"></i>
                                    </div>
                                </div>
                                <div className="text-2xl md:text-3xl font-bold text-[#111111] mt-1 md:mt-2">
                                    {dataLoading ? <Loader size="16px" /> : totalOpenDispute}
                                </div>
                            </div>

                            <div
                                onClick={() => setActiveSection('closeDispute')}
                                className={`p-4 md:p-6 rounded-2xl border transition-all cursor-pointer group ${activeSection === 'closeDispute' ? 'bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-100' : 'bg-white border-[#EEEBE5] hover:border-emerald-200'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <p className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${activeSection === 'closeDispute' ? 'text-emerald-600' : 'text-[#6B6B6B]'}`}>Resolved Cases</p>
                                    <div className={`p-2 rounded-lg ${activeSection === 'closeDispute' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-[#6B6B6B]'}`}>
                                        <i className="fas fa-check-circle text-xs md:text-sm"></i>
                                    </div>
                                </div>
                                <div className="text-2xl md:text-3xl font-bold text-[#111111] mt-1 md:mt-2">
                                    {dataLoading ? <Loader size="16px" /> : totalCloseDispute}
                                </div>
                            </div>

                            <div className="sm:col-span-2 lg:col-span-1 flex items-center">
                                <button
                                    className="w-full bg-white hover:bg-[#FFF7ED] border border-[#EEEBE5] text-[#111111] font-bold py-3 md:py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all group text-sm md:text-base"
                                    onClick={handleReportClick}
                                >
                                    <i className={`${helpIcon} group-hover:text-[#F97316]`}></i>
                                    Report a Problem
                                </button>
                            </div>
                        </div>

                        {/* DATA TABLE */}
                        <div className="glass-card border border-[#EEEBE5] rounded-2xl md:rounded-3xl overflow-hidden animate-fade-in-up">
                            <Box sx={dataGridSx}>
                                <DataGrid
                                    rows={filteredRows}
                                    columns={columns}
                                    loading={dataLoading}
                                    rowHeight={75}
                                    initialState={{ pagination: { paginationModel: { pageSize } } }}
                                    onPaginationModelChange={handlePaginationModelChange}
                                    slots={{ noRowsOverlay: CustomNoRowsOverlay, loadingOverlay: CustomDataGridSkeleton }}
                                />
                            </Box>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dispute;