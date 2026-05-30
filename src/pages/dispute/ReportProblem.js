import React, { useState, useRef, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { getMonthInWordWithDateAndYear, shortenWalletAddress, copyToClipboard, CustomDataGridSkeleton } from '../../utils/commonFunction';
import DisputeModal from '../../Modal/DisputeModal';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { leftArrowIcon, copyIcon } from '../../constant/icon';
import { useAccount } from 'wagmi';
import { readContractData } from '../../utils/contractInstance';
import { CPGAddress, initialTokenList } from '../../constant/constant';
import { CPGABI } from '../../ABI/ABI';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

const ReportProblem = () => {

    const [disputeModal, setDisputeModal] = useState(false);
    const [currentItem, setCurrentItem] = useState({});
    const [searchInput, setSearchInput] = useState('');
    const [onGoingData, setOnGoingData] = useState([]);
    const [dataLoading, setDataLoading] = useState(false);

    const disputeRef = useRef();
    const navigate = useNavigate();
    const { address: walletAddress } = useAccount();

    const getReleaseDate = (startTime, interval, milestone) => {
        startTime = new BigNumber(startTime.toString());
        interval = new BigNumber(interval.toString());
        milestone = new BigNumber(milestone.toString());
        const timeToAdd = interval.multipliedBy(milestone);
        const finalTimestamp = startTime.plus(timeToAdd);
        const finalTimestampInMs = finalTimestamp.multipliedBy(1000);
        const resultDate = new Date(finalTimestampInMs.toNumber());
        const day = String(resultDate.getDate()).padStart(2, '0');
        const month = String(resultDate.getMonth() + 1).padStart(2, '0');
        const year = resultDate.getFullYear();
        return `${year}-${month}-${day}`; // Format recognizable by Date()
    }

    const getAllOnGoingPayments = async () => {
        if (!walletAddress) return;
        try {
            setDataLoading(true);
            const activePayments = [];

            // Fetch Send Payments
            const sendCount = await readContractData(CPGAddress, CPGABI, 'getLockedPaymentCountOfSender', [walletAddress]);
            if (Number(sendCount) > 0) {
                for (let i = 0; i < Number(sendCount); i++) {
                    const paymentData = await readContractData(CPGAddress, CPGABI, 'getLockedPaymentByIndexOfSender', [walletAddress, i]);
                    if (!paymentData.claimed && !paymentData.isDisputeRaised) {
                        const tokenInfo = initialTokenList.find(token => token.address === paymentData.tokenAddress);
                        if(tokenInfo) {
                            const formatted = parseFloat(ethers.formatUnits(paymentData.totalAmount, tokenInfo.decimals));
                            activePayments.push({
                                ...paymentData,
                                id: Number(paymentData.paymentId),
                                userName: paymentData.receiver, // Counterparty
                                amount: formatted,
                                releaseDate: getReleaseDate(paymentData.startTime, paymentData.milestoneInterval, paymentData.milestones)
                            });
                        }
                    }
                }
            }

            // Fetch Receive Payments
            const receiveCount = await readContractData(CPGAddress, CPGABI, 'getLockedPaymentCountOfReceiver', [walletAddress]);
            if (Number(receiveCount) > 0) {
                for (let i = 0; i < Number(receiveCount); i++) {
                    const paymentData = await readContractData(CPGAddress, CPGABI, 'getLockedPaymentByIndexOfReceiver', [walletAddress, i]);
                    if (!paymentData.claimed && !paymentData.isDisputeRaised) {
                        const tokenInfo = initialTokenList.find(token => token.address === paymentData.tokenAddress);
                        if(tokenInfo) {
                            const formatted = parseFloat(ethers.formatUnits(paymentData.totalAmount, tokenInfo.decimals));
                            activePayments.push({
                                ...paymentData,
                                id: Number(paymentData.paymentId),
                                userName: paymentData.sender, // Counterparty
                                amount: formatted,
                                releaseDate: getReleaseDate(paymentData.startTime, paymentData.milestoneInterval, paymentData.milestones)
                            });
                        }
                    }
                }
            }

            setOnGoingData(activePayments);
        } catch (error) {
            console.error("Error fetching ongoing payments:", error);
        } finally {
            setDataLoading(false);
        }
    };

    useEffect(() => {
        getAllOnGoingPayments();
        // eslint-disable-next-line
    }, [walletAddress]);

    const columns = [
        {
            field: 'id',
            headerName: 'Id',
            minWidth: 90,
            headerAlign: 'center',
            align: 'center',
            headerClassName: 'super-app-theme--header'
        },
        {
            field: 'userName',
            headerName: 'User name',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 200,
            headerClassName: 'super-app-theme--header',
            renderCell: (params) => (
                <div className='flex justify-center items-center h-full'>
                    <p>{shortenWalletAddress(params.row.userName)}</p>
                    <button className='' onClick={() => copyToClipboard(params.row.userName)}>
                        <i className={`text-gray-500 text-sm ms-2 ${copyIcon}`} />
                    </button>
                </div>
            )
        },
        {
            field: 'amount',
            headerName: 'Amount',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 200,
            headerClassName: 'super-app-theme--header'
        },
        {
            field: 'dueDate',
            headerName: 'Due Date',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 200,
            headerClassName: 'super-app-theme--header',
            renderCell: (params) => {
                return (
                    <div className='flex justify-center'>
                        <div className=' px-10 h-10 flex items-center my-1 rounded-xl'>
                            <p>{getMonthInWordWithDateAndYear(params.row.releaseDate)}</p>
                        </div>
                    </div>
                );
            },
        },
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
                        className='border border-customBlue text-customBlue hover:bg-customBlue hover:text-white px-10 h-10 flex items-center my-1 rounded-xl'
                        onClick={() => handleOpenDisputeModal(params.row)}
                    >
                        Dispute
                    </button>
                </div>
            ),
        },
    ];

    const filteredRows = onGoingData.filter(row =>
        row.userName.toLowerCase().includes(searchInput.toLowerCase())
    );

    const handleSearchChange = (event) => {
        setSearchInput(event.target.value);
    };

    const handleOpenDisputeModal = (item) => {
        setCurrentItem(item);
        disputeRef.current.click();
    };

    return (
        <div className='lg:container lg:mx-auto sm:mx-5  mt-3  lg:p-4 md:p-3 p-5'>

            <form className="max-w-full mx-auto flex md:flex-row flex-col justify-between md:items-center">
                <div className='flex md:justify-between items-center'>
                    <div className='px-2.5 py-1 rounded-xl border border-customBlue hover:bg-customBlue text-customBlue hover:text-white cursor-pointer' onClick={() => navigate('/dispute')}>
                        <i className={`${leftArrowIcon} text-lg md:text-xl `} ></i>
                    </div>
                    <p className='font-bold text-2xl md:text-3xl ms-3 '>Report a problem</p>
                </div>

                <div className="relative md:w-72 w-full md:mt-0 mt-5">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                        </svg>
                    </div>
                    <input
                        type="search"
                        id="default-search"
                        className="block w-full focus:outline-none py-3 ps-10  text-black border border-gray-300 rounded-lg bg-white z-10 text-base"
                        placeholder="Search by User Address..."
                        value={searchInput}
                        onChange={handleSearchChange}
                    />
                </div>
            </form>

            <div className='mt-8 md:mt-10 border border-gray-300 bg-white shadow-xl shadow-gray-400 rounded-xl p-4 md:p-7'>
                <Box
                    sx={{
                        width: '100%',
                        height: '66vh',
                        '& .super-app-theme--header': {
                            backgroundColor: '#F3EFFD',
                            color: 'black'
                        },
                    }}
                >
                    <DataGrid
                        rows={filteredRows}
                        columns={columns}
                        loading={dataLoading}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        disableSelectionOnClick
                        experimentalFeatures={{ newEditingApi: true }}
                        slots={{ loadingOverlay: CustomDataGridSkeleton }}
                        sx={{
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: 'transparent',
                            },
                            '& .Mui-selected': {
                                backgroundColor: 'transparent !important',
                            },
                            '& .MuiDataGrid-cell:focus': {
                                outline: 'none',
                            },
                            '& .MuiDataGrid-columnHeader:focus': {
                                outline: 'none'
                            },
                            border: 1,
                            borderRadius: 3,
                            borderColor: 'grey.300'
                        }}
                    />
                </Box>
            </div>

            {/**************************************************************** dispute modal *****************************************************************/}
            <>
                <button
                    ref={disputeRef}
                    className="bg-[#FFF7ED] text-black active:bg-[#F97316] 
                      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 hidden"
                    type="button"
                    onClick={() => setDisputeModal(true)}
                >
                    Fill Details
                </button>
                {disputeModal ? (
                    <>
                        {/* We pass a prop so that when dispute is raised, the list updates */}
                        <DisputeModal setDisputeModal={setDisputeModal} currentItem={currentItem} setCurrentItem={setCurrentItem} getData={getAllOnGoingPayments}/>
                    </>
                ) : null}
            </>
            {/**************************************************************** dispute modal *****************************************************************/}

        </div>
    )
}

export default ReportProblem
