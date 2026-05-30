import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import React, { useEffect, useRef, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { useAccount } from 'wagmi';
import { CPGABI } from '../../ABI/ABI';
import ClaimPayment from '../../Modal/ClaimPayment';
import DisputeModal from '../../Modal/DisputeModal';
import ConnectWalletButton from '../../components/connectWallet/ConnectWalletButton';
import SwitchNetworkButton from '../../components/connectWallet/SwitchNetworkButton';
import Loader from '../../components/loader/Loader';
import { homeFilterData } from '../../config/data';
import { CPGAddress, defaultPageSize, initialTokenList, pageSizeLength, RECEIVE, SEND, targetChainId } from '../../constant/constant';
import { copyIcon } from '../../constant/icon';
import { TRANSACTION_ERROR_MSG, USER_REJECT_TRANSACTION_MSG } from '../../constant/toasterMessage';
import { copyToClipboard, CustomNoRowsOverlay, CustomDataGridSkeleton, fireErrorToast, formatNumber, shortenWalletAddress } from '../../utils/commonFunction';
import { readContractData } from '../../utils/contractInstance';

const OnGoing = () => {
    const [onGoingData, setOnGoingData] = useState([])
    const [dataLoading, setDataLoading] = useState(false)
    const [pageSize, setPageSize] = useState(defaultPageSize)
    const [paymentId, setPaymentId] = useState(null)
    const [claimModal, setClaimModal] = useState(false)
    const [sendData, setSendData] = useState([])
    const [receiveData, setReceiveData] = useState([])
    const [filterName, setFilterName] = useState(SEND)
    const [sendDataLoading, setSendDataLoading] = useState(false)
    const [receiveDataLoading, setReceiveDataLoading] = useState(false)
    const [currentItem, setCurrentItem] = useState({})
    const [disputeModal, setDisputeModal] = useState(false)
    const [totalSendAmount, setTotalSendAmount] = useState(0)
    const [totalReceiveAmount, setTotalReceiveAmount] = useState(0)
    const [totalClaimableAmount, setTotalClaimableAmount] = useState(0)
    const [totalOpenDispute, setTotalOpenDispute] = useState(0)
    const [disputeLoading, setDisputeLoading] = useState(false)

    // --- UTILITY STYLING FOR COLUMNS ---
    const renderAddressCell = (address, id) => (
        <div className='flex items-center gap-2 group'>
            <div className="w-7 h-7 rounded-full bg-[#FFF7ED] flex items-center justify-center border border-[#FED7AA]">
                <i className="fas fa-wallet text-[10px] text-[#F97316]"></i>
            </div>
            <span className="text-[#111111] font-medium">{shortenWalletAddress(address)}</span>
            <button onClick={() => copyToClipboard(address)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-opacity">
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

    const claimModalRef = useRef()
    const disputeRef = useRef()

    const { isConnected, address: walletAddress, chainId } = useAccount()
    // const chainId = useChainId();

    const handlePaginationModelChange = (model) => {
        setPageSize(model.pageSize);
    }
    const handleChangeFilter = (name) => {
        setFilterName(name)
    }
    function getClaimedAmount(claimedMilestones, totalPayment, totalMilestones) {

        // claimedMilestones = new BigNumber(claimedMilestones);
        // totalPayment = new BigNumber(totalPayment);
        // totalMilestones = new BigNumber(totalMilestones);
        try {
            claimedMilestones = new BigNumber(claimedMilestones.toString());
            totalPayment = new BigNumber(totalPayment.toString());
            totalMilestones = new BigNumber(totalMilestones.toString());

            const amountPerMilestone = totalPayment.dividedBy(totalMilestones)
            const claimedPayment = claimedMilestones.multipliedBy(amountPerMilestone)
            return claimedPayment.toFixed(0)
        } catch (e) {

            return '0';
        }

    }
    const getReleaseDate = (startTime, interval, milestone) => {
        startTime = new BigNumber(startTime);
        interval = new BigNumber(interval);
        milestone = new BigNumber(milestone);

        // Calculate the total time to add: interval * milestone
        const timeToAdd = interval.multipliedBy(milestone);

        // Calculate the final timestamp
        const finalTimestamp = startTime.plus(timeToAdd);

        // Convert to milliseconds for Date compatibility
        const finalTimestampInMs = finalTimestamp.multipliedBy(1000);

        // Create a Date object
        const resultDate = new Date(finalTimestampInMs.toNumber());

        // Format as dd-mm-yyyy
        const day = String(resultDate.getDate()).padStart(2, '0');
        const month = String(resultDate.getMonth() + 1).padStart(2, '0');
        const year = resultDate.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;

        return formattedDate;
    }

    function calculateClaimableAmount(startTime, intervalSeconds, claimedMilestones, totalPayment, totalMilestones) {
        // Convert inputs to BigNumber
        startTime = new BigNumber(startTime);
        intervalSeconds = new BigNumber(intervalSeconds);
        claimedMilestones = new BigNumber(claimedMilestones);
        totalPayment = new BigNumber(totalPayment).multipliedBy(new BigNumber(10).pow(18));  // Scale up to avoid decimals
        totalMilestones = new BigNumber(totalMilestones);

        const currentTimestamp = new BigNumber(Math.floor(Date.now() / 1000));
        const lastTimestamp = startTime.plus(intervalSeconds.multipliedBy(totalMilestones));
        const effectiveTimestamp = BigNumber.minimum(currentTimestamp, lastTimestamp);
        const availableMilestones = effectiveTimestamp.minus(startTime).dividedToIntegerBy(intervalSeconds);
        const claimableMilestones = availableMilestones.minus(claimedMilestones);

        const claimableAmount = claimableMilestones.isGreaterThan(0)
            ? claimableMilestones.multipliedBy(totalPayment.dividedBy(totalMilestones)).dividedBy(new BigNumber(10).pow(18))  // Scale down
            : new BigNumber(0);


        return claimableAmount.toFixed(0);
    }

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
            if (!error.details?.includes('MetaMask Tx Signature: User denied transaction signature')) {
                fireErrorToast(TRANSACTION_ERROR_MSG)
            }
            if (error.details?.includes('MetaMask Tx Signature: User denied transaction signature')) {
                fireErrorToast(USER_REJECT_TRANSACTION_MSG)
            }
        }
    }

    const handleClaim = (id) => {
        try {
            setPaymentId(Number(id))
            setClaimModal(true)
        } catch (error) {
            console.log(error);

        }
    }

    const handleOpenDisputeModal = (item) => {
        setCurrentItem(item);
        setDisputeModal(true);
    };

    // --- COLUMN DEFINITIONS ---
    const commonColumns = [
        { field: 'id', headerName: 'ID', width: 70, renderCell: (p) => <span className="text-[#9B9B9B] font-mono">#{p.value}</span> },
        { field: 'tokenName', headerName: 'Asset', flex: 1, minWidth: 140, renderCell: renderAssetCell },
        { field: 'amount', headerName: 'Total Amount', flex: 1, minWidth: 130, renderCell: (p) => <span className="text-[#111111] font-bold tabular-nums">{p.value}</span> },
        { field: 'claimedAmount', headerName: 'Claimed', flex: 1, minWidth: 130, renderCell: (p) => <span className="text-emerald-600 font-medium tabular-nums">{p.value}</span> },
    ];

    const sendDataColumns = [
        ...commonColumns,
        { field: 'receiver', headerName: 'Receiver', flex: 1.2, minWidth: 180, renderCell: (p) => renderAddressCell(p.value, p.row.id) },
        {
            field: 'action', headerName: 'Status', width: 150, align: 'right', headerAlign: 'right',
            renderCell: (params) => (
                params.row.isDisputeRaised ?
                    <span className="text-red-400 text-xs font-bold uppercase">Dispute Raised</span> :
                    params.row.claimed ?
                        <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest">● Fullfilled</span> :
                        <button className='bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 text-[10px] font-bold px-4 py-1.5 rounded-lg transition-all' onClick={() => handleOpenDisputeModal(params.row)}>Dispute</button>
            )
        }
    ];

    const receiveDataColumns = [
        ...commonColumns,
        { field: 'sender', headerName: 'Sender', flex: 1.2, minWidth: 180, renderCell: (p) => renderAddressCell(p.value, p.row.id) },
    ];

    const columns = [
        { field: 'id', headerName: 'ID', width: 70, renderCell: (p) => <span className="text-slate-500 font-mono">#{p.value}</span> },
        { field: 'releaseDate', headerName: 'Next Release', width: 130, renderCell: (p) => <span className="text-slate-400 text-xs">{p.value}</span> },
        { field: 'sender', headerName: 'From', flex: 1, minWidth: 160, renderCell: (p) => renderAddressCell(p.value, p.row.id) },
        { field: 'tokenName', headerName: 'Asset', width: 120, renderCell: renderAssetCell },
        { field: 'claimableAmount', headerName: 'Unlocked', flex: 1, renderCell: (p) => <span className="text-[#F97316] font-bold">{p.value}</span> },
        {
            field: 'action', headerName: 'Actions', width: 220, sortable: false, align: 'right', headerAlign: 'right',
            renderCell: (params) => (
                <div className='flex gap-2'>
                    {!params.row.isDisputeRaised ? (
                        <>
                            <button
                                className='bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-lg disabled:opacity-30'
                                disabled={!params.row.isMilestoneAvailable}
                                onClick={() => handleClaim(params.row.paymentId)}
                            >Claim</button>
                            <button className='bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white text-[10px] font-bold px-4 py-1.5 rounded-lg' onClick={() => handleOpenDisputeModal(params.row)}>Dispute</button>
                        </>
                    ) : <span className="text-red-500 text-[10px] font-bold uppercase">Dispute Active</span>}
                </div>
            )
        },
    ];

    // const columns = [
    //     {
    //         field: 'id',
    //         headerName: 'Id',
    //         minWidth: 90,
    //         headerAlign: 'center',
    //         align: 'center',
    //         headerClassName: 'super-app-theme--header'
    //     },
    //     {
    //         field: 'releaseDate',
    //         headerName: 'Release Date',
    //         flex: 1,
    //         headerAlign: 'center',
    //         align: 'center',
    //         minWidth: 200,
    //         headerClassName: 'super-app-theme--header',
    //         // renderCell: (params) => {

    //         //     return <div className='flex justify-center'>
    //         //         <div
    //         //             className=' px-10 h-10 flex items-center my-1 rounded-xl'
    //         //         // onClick={() => handleButtonClick(params.row)}
    //         //         >
    //         //             <p>{getMonthInWordWithDateAndYear(params.row.releaseDate)}</p>
    //         //         </div>
    //         //     </div>
    //         // },
    //     },
    //     {
    //         field: 'sender',
    //         headerName: 'Sender Address',
    //         flex: 1,
    //         headerAlign: 'center',
    //         align: 'center',
    //         minWidth: 200,
    //         headerClassName: 'super-app-theme--header',
    //         renderCell: (params) => {

    //             return <>
    //                 <div className='text-center'>
    //                     {params.row.sender &&
    //                         <div className='flex justify-center items-center'>
    //                             <p data-tooltip-id={`my-tooltip-${params.row.id}`}>
    //                                 {shortenWalletAddress(params.row.sender)}
    //                             </p>
    //                             <button className='' onClick={() => copyToClipboard(params.row.sender)}>
    //                                 <i className={`text-gray-500 text-sm ms-2 ${copyIcon}`} />
    //                             </button>
    //                         </div>
    //                     }


    //                 </div>
    //                 {params.row.sender && <Tooltip id={`my-tooltip-${params.row.id}`}
    //                     place='bottom'
    //                     content={params.row.sender} />}
    //             </>
    //         }
    //     },
    //     {
    //         field: 'tokenName',
    //         headerName: 'Token Name',
    //         flex: 1,
    //         headerAlign: 'center',
    //         align: 'center',
    //         minWidth: 200,
    //         headerClassName: 'super-app-theme--header',
    //         renderCell: (params) => (
    //             <div className='flex justify-center'>
    //                 <img src={params.row.tokenImage} alt="" className='w-8 h-8 mt-2.5 me-3' />
    //                 <span>{params.row.tokenName}</span>
    //             </div>
    //         ),
    //     },
    //     {
    //         field: 'amount',
    //         headerName: 'Amount',
    //         flex: 1,
    //         headerAlign: 'center',
    //         align: 'center',
    //         minWidth: 200,
    //         headerClassName: 'super-app-theme--header'
    //     },
    //     {
    //         field: 'claimedAmount',
    //         headerName: 'Claimed Amount',
    //         flex: 1,
    //         headerAlign: 'center',
    //         align: 'center',
    //         minWidth: 200,
    //         headerClassName: 'super-app-theme--header'
    //     },
    //     {
    //         field: 'claimableAmount',
    //         headerName: 'Unlocked Amount',
    //         flex: 1,
    //         headerAlign: 'center',
    //         align: 'center',
    //         minWidth: 200,
    //         headerClassName: 'super-app-theme--header'
    //     },
    //     {
    //         field: 'action',
    //         headerName: 'Action',
    //         flex: 1,
    //         minWidth: 300,
    //         headerAlign: 'center',
    //         headerClassName: 'super-app-theme--header',
    //         sortable: false,
    //         renderCell: (params) => {
    //             return (
    //                 <div className='flex gap-1 justify-center'>
    //                     {!params.row.isDisputeRaised ? <>
    //                         <button
    //                             variant="contained"
    //                             className=' border border-green-500 hover:bg-green-500 text-green-500 hover:text-white px-10 h-10 flex items-center my-1 rounded-xl disabled:bg-gray-400 disabled:text-white disabled:border-none'
    //                             disabled={!params.row.isMilestoneAvailable || params.row.isDisputeRaised}
    //                             onClick={() => handleClaim(params.row.paymentId)}

    //                         >
    //                             Claim
    //                         </button>
    //                         <button
    //                             variant="contained"
    //                             className='border border-red-500 hover:bg-red-500 text-red-500 hover:text-white px-10 h-10 flex items-center my-1 rounded-xl disabled:bg-gray-400 disabled:text-white disabled:border-none'
    //                             onClick={() => handleOpenDisputeModal(params.row)}
    //                         >
    //                             Dispute
    //                         </button>
    //                     </> :
    //                         <div className=' text-white px-[4.5rem] h-10 flex items-center my-1'>
    //                             <p className='text-red-500 text'>Dispute Raised</p>
    //                         </div>}
    //                 </div>
    //             )
    //         },
    //     },
    // ];

    // const sendDataColumns = [
    //     {
    //         field: 'id',
    //         headerName: 'Id',
    //         minWidth: 90,
    //         headerClassName: 'super-app-theme--header',
    //         headerAlign: 'center',
    //         align: 'center'
    //     },
    //     {
    //         field: 'receiver',
    //         headerName: 'Receiver Address',
    //         flex: 1,
    //         minWidth: 200,
    //         headerClassName: 'super-app-theme--header',
    //         headerAlign: 'center',
    //         align: 'center',
    //         renderCell: (params) => {
    //             return <>
    //                 <div className='text-center'>
    //                     {params.row.receiver &&
    //                         <div className='flex justify-center items-center'>
    //                             <p data-tooltip-id={`my-tooltip-${params.row.id}`}>
    //                                 {shortenWalletAddress(params.row.receiver)}
    //                             </p>
    //                             <button className='' onClick={() => copyToClipboard(params.row.receiver)}>
    //                                 <i className={`text-gray-500 text-sm ms-2 ${copyIcon}`} />
    //                             </button>
    //                         </div>
    //                     }

    //                 </div>
    //                 {params.row.receiver && <Tooltip id={`my-tooltip-${params.row.id}`}
    //                     place='bottom'
    //                     content={params.row.receiver} />}
    //             </>
    //         }
    //     },
    //     {
    //         field: 'tokenName',
    //         headerName: 'Token Name',
    //         flex: 1,
    //         headerAlign: 'center',
    //         align: 'center',
    //         minWidth: 200,
    //         headerClassName: 'super-app-theme--header',
    //         renderCell: (params) => (
    //             <div className='flex justify-center'>
    //                 <img src={params.row.tokenImage} alt="" className='w-8 h-8 mt-2.5 me-3' />
    //                 <span>{params.row.tokenName}</span>
    //             </div>
    //         ),
    //     },
    //     {
    //         field: 'amount',
    //         headerName: 'Amount',
    //         type: 'number',
    //         flex: 1,
    //         minWidth: 200,
    //         headerClassName: 'super-app-theme--header',
    //         headerAlign: 'center',
    //         align: 'center'
    //     },
    //     {
    //         field: 'claimedAmount',
    //         headerName: 'Claimed Amount',
    //         type: 'number',
    //         flex: 1,
    //         minWidth: 200,
    //         headerClassName: 'super-app-theme--header',
    //         headerAlign: 'center',
    //         align: 'center'
    //     },
    //     {
    //         field: 'action',
    //         headerName: 'Action',
    //         flex: 1,
    //         minWidth: 200,
    //         headerAlign: 'center',
    //         headerClassName: 'super-app-theme--header',
    //         sortable: false,
    //         renderCell: (params) => {
    //             return (
    //                 <div className='flex gap-1 justify-center'>
    //                     {params.row.isDisputeRaised && params.row.claimed ?
    //                         <div className='text-blue-400'>
    //                             Refunded
    //                         </div>
    //                         : params.row.isDisputeRaised ?
    //                             <div className='text-red-500'>
    //                                 Dispute Raised
    //                             </div>
    //                             : params.row.claimed ?
    //                                 <div className='text-green-500'>
    //                                     Claimed
    //                                 </div>
    //                                 :
    //                                 <button
    //                                     variant="contained"
    //                                     className='border border-red-500 hover:bg-red-500 text-red-500 hover:text-white  px-10 h-10 flex items-center my-1 rounded-xl disabled:bg-gray-400 disabled:text-white disabled:border-none'
    //                                     onClick={() => handleOpenDisputeModal(params.row)}
    //                                 >
    //                                     Dispute
    //                                 </button>}
    //                 </div>
    //             )
    //         },
    //     },


    // ];
    // const receiveDataColumns = [
    //     {
    //         field: 'id',
    //         headerName: 'Id',
    //         minWidth: 90,
    //         headerClassName: 'super-app-theme--header',
    //         headerAlign: 'center',
    //         align: 'center'
    //     },
    //     {
    //         field: 'sender',
    //         headerName: 'Sender Address',
    //         flex: 1,
    //         minWidth: 200,
    //         headerClassName: 'super-app-theme--header',
    //         headerAlign: 'center',
    //         align: 'center',
    //         renderCell: (params) => {

    //             return <>
    //                 <div className='text-center'>
    //                     {params.row.sender &&
    //                         <div className='flex justify-center items-center'>
    //                             <p data-tooltip-id={`my-tooltip-${params.row.id}`}>
    //                                 {shortenWalletAddress(params.row.sender)}
    //                             </p>
    //                             <button className='' onClick={() => copyToClipboard(params.row.sender)}>
    //                                 <i className={`text-gray-500 text-sm ms-2 ${copyIcon}`} />
    //                             </button>
    //                         </div>
    //                     }

    //                 </div>
    //                 {params.row.sender && <Tooltip id={`my-tooltip-${params.row.id}`}
    //                     place='bottom'
    //                     content={params.row.sender} />}
    //             </>
    //         }
    //     },
    //     {
    //         field: 'tokenName',
    //         headerName: 'Token Name',
    //         flex: 1,
    //         headerAlign: 'center',
    //         align: 'center',
    //         minWidth: 200,
    //         headerClassName: 'super-app-theme--header',
    //         renderCell: (params) => (
    //             <div className='flex justify-center'>
    //                 <img src={params.row.tokenImage} alt="" className='w-8 h-8 mt-2.5 me-3' />
    //                 <span>{params.row.tokenName}</span>
    //             </div>
    //         ),
    //     },
    //     {
    //         field: 'amount',
    //         headerName: 'Amount',
    //         type: 'number',
    //         flex: 1,
    //         minWidth: 200,
    //         headerClassName: 'super-app-theme--header',
    //         headerAlign: 'center',
    //         align: 'center'
    //     },
    //     {
    //         field: 'claimedAmount',
    //         headerName: 'Claimed Amount',
    //         type: 'number',
    //         flex: 1,
    //         minWidth: 200,
    //         headerClassName: 'super-app-theme--header',
    //         headerAlign: 'center',
    //         align: 'center'
    //     },
    //     {
    //         field: 'action',
    //         headerName: 'Action',
    //         flex: 1,
    //         minWidth: 200,
    //         headerAlign: 'center',
    //         headerClassName: 'super-app-theme--header',
    //         sortable: false,
    //         renderCell: (params) => {
    //             return (
    //                 <div className='flex gap-1 justify-center'>
    //                     {params.row.isDisputeRaised && params.row.claimed ?
    //                         <div className='text-blue-400'>
    //                             Refunded
    //                         </div>
    //                         : params.row.isDisputeRaised ?
    //                             <div className='text-red-500'>
    //                                 Dispute Raised
    //                             </div>
    //                             : params.row.claimed ?
    //                                 <div className='text-green-500'>
    //                                     Claimed
    //                                 </div>
    //                                 : <button
    //                                     variant="contained"
    //                                     className='border border-red-500 hover:bg-red-500 text-red-500 hover:text-white  px-10 h-10 flex items-center my-1 rounded-xl disabled:bg-gray-400'
    //                                     onClick={() => handleOpenDisputeModal(params.row)}
    //                                 >
    //                                     Dispute
    //                                 </button>}
    //                 </div>
    //             )
    //         },
    //     },
    // ];

    const getOnGoingPaymentData = async () => {
        try {
            setDataLoading(true)
            const count = await readContractData(CPGAddress, CPGABI, 'getLockedPaymentCountOfReceiver', [walletAddress])

            const onGoingPayment = [];
            let totalClaim = 0

            if (Number(count) > 0) {

                for (let i = 0; i < Number(count); i++) {
                    const paymentData = await readContractData(CPGAddress, CPGABI, 'getLockedPaymentByIndexOfReceiver', [walletAddress, i]);

                    const paymentId = Number(paymentData.paymentId);
                    const isMilestoneAvailable = await readContractData(CPGAddress, CPGABI, 'isNewMilestoneAvailable', [paymentData.paymentId]);



                    // Find the token data based on the tokenAddress in paymentData
                    const tokenInfo = initialTokenList.find(
                        token => token.address?.toLowerCase() === paymentData.tokenAddress?.toLowerCase()
                    );

                    if (tokenInfo) {
                        const { name, decimals, logoURI } = tokenInfo;

                        // Convert the amount using the token decimal
                        // const amount = parseFloat(ethers.formatUnits(paymentData.amount, decimals));
                        const formatted = parseFloat(ethers.formatUnits(paymentData.totalAmount, decimals));
                        const parsedNumber = parseFloat(formatted);

                        const amount = Number.isInteger(parsedNumber) ? parsedNumber : formatted.toFixed(2);

                        const claimableAmountInWei = calculateClaimableAmount(
                            paymentData.startTime,
                            paymentData.milestoneInterval,
                            paymentData.claimedMilestones,
                            paymentData.totalAmount,
                            paymentData.milestones
                        );

                        const claimedPayment = getClaimedAmount(
                            paymentData.claimedMilestones,
                            paymentData.totalAmount,
                            paymentData.milestones
                        );

                        const formatClaimedAmount = ethers.formatUnits(claimedPayment, decimals)
                        const formateClaimableAmount = ethers.formatUnits(claimableAmountInWei, decimals)


                        totalClaim += parseFloat(formateClaimableAmount)


                        const releaseDate = getReleaseDate(paymentData.startTime, paymentData.milestoneInterval, paymentData.milestones)
                        // Add tokenName and converted amount to the processed data
                        try {


                            const processedData = {
                                ...paymentData,
                                id: paymentId,
                                amount,
                                isMilestoneAvailable,
                                tokenName: name,
                                tokenImage: logoURI,     // Add token name
                                tokenDecimal: decimals,    // Add token decimal if needed for further processing
                                claimableAmount: formatNumber(formateClaimableAmount),
                                claimedAmount: formatNumber(formatClaimedAmount),
                                // claimableAmount: 0,
                                // claimedAmount: 0,
                                releaseDate
                            };

                            onGoingPayment.push(processedData);

                        }
                        catch (e) {

                            console.log("Error making data object :", e);

                        }
                    } else {
                        console.warn(`Token information not found for address: ${paymentData.tokenAddress}`);
                    }
                }

                const pendingPayments = onGoingPayment.filter(payment => payment.claimed === false);

                // const claimedPayments = onGoingPayment.filter(payment => payment.isClaimed === true);

                setTotalClaimableAmount(totalClaim)
                setOnGoingData(pendingPayments);
            }
        } catch (error) {
            console.log("Error getting data :", error);

        } finally {
            setDataLoading(false)
        }
    }

    const getReceiveLockedPaymentData = async () => {
        try {
            setReceiveDataLoading(true)
            const count = await readContractData(CPGAddress, CPGABI, 'getLockedPaymentCountOfReceiver', [walletAddress])
            const lockedPayments = [];
            let totalReceive = 0

            if (Number(count) > 0) {
                for (let i = 0; i < Number(count); i++) {
                    const paymentData = await readContractData(CPGAddress, CPGABI, 'getLockedPaymentByIndexOfReceiver', [walletAddress, i]);
                    const paymentId = Number(paymentData.paymentId);



                    // Find the token data based on the tokenAddress in paymentData
                    const tokenInfo = initialTokenList.find(
                        token => token.address?.toLowerCase() === paymentData.tokenAddress?.toLowerCase()
                    );

                    if (tokenInfo) {
                        const { name, decimals, logoURI } = tokenInfo;

                        // Convert the amount using the token decimal
                        const formatted = parseFloat(ethers.formatUnits(paymentData.totalAmount, decimals));
                        const parsedNumber = parseFloat(formatted);

                        // const amount = Number.isInteger(parsedNumber) ? parsedNumber : formatted.toFixed(2);
                        const amount = formatNumber(parsedNumber);
                        totalReceive += parsedNumber


                        let claimedAmountinWei
                        let claimedAmountInEther = 0
                        try {
                            claimedAmountinWei = getClaimedAmount(paymentData.claimedMilestones, paymentData.totalAmount, paymentData.milestones)
                            claimedAmountInEther = ethers.formatUnits(claimedAmountinWei, decimals)
                            // Add tokenName and converted amount to the processed data

                        } catch (e) {

                            // console.log(e);

                        }
                        const processedData = {
                            ...paymentData,
                            id: paymentId,
                            amount,
                            parsedNumber,
                            tokenName: name,
                            tokenImage: logoURI,
                            tokenDecimal: decimals,    // Add token decimal if needed for further processing
                            claimedAmount: formatNumber(claimedAmountInEther)
                        };

                        lockedPayments.push(processedData);
                    } else {
                        console.warn(`Token information not found for address: ${paymentData.tokenAddress}`);
                    }
                }

                // const unclaimedPayments = lockedPayments.filter(payment => payment.claimed === false);
                // const claimedPayments = lockedPayments.filter(payment => payment.claimed === true);

                setTotalReceiveAmount(totalReceive)
                setReceiveData(lockedPayments)
            }
        } catch (error) {
            console.log(error);

        } finally {
            setReceiveDataLoading(false)
        }
    }

    const getSendLockedPaymentData = async () => {
        try {
            setSendDataLoading(true)
            const count = await readContractData(CPGAddress, CPGABI, 'getLockedPaymentCountOfSender', [walletAddress])

            const lockedPayments = [];
            let totalSend = 0

            if (Number(count) > 0) {

                for (let i = 0; i < Number(count); i++) {
                    const paymentData = await readContractData(CPGAddress, CPGABI, 'getLockedPaymentByIndexOfSender', [walletAddress, i]);
                    const paymentId = Number(paymentData.paymentId);

                    // Find the token data based on the tokenAddress in paymentData
                    const tokenInfo = initialTokenList.find(
                        token => token.address?.toLowerCase() === paymentData.tokenAddress?.toLowerCase()
                    );

                    if (tokenInfo) {
                        const { name, decimals, logoURI } = tokenInfo;

                        // Convert the amount using the token decimal
                        // const amount = parseFloat(ethers.formatUnits(paymentData.amount, decimals));
                        const formatted = parseFloat(ethers.formatUnits(paymentData.totalAmount, decimals));
                        const parsedNumber = parseFloat(formatted);

                        // const amount = Number.isInteger(parsedNumber) ? parsedNumber : formatted.toFixed(2);
                        const amount = formatNumber(parsedNumber);
                        totalSend += parsedNumber


                        const claimedAmountinWei = getClaimedAmount(paymentData.claimedMilestones, paymentData.totalAmount, paymentData.milestones)
                        // Add tokenName and converted amount to the processed data
                        const processedData = {
                            ...paymentData,
                            id: paymentId,
                            amount,
                            parsedNumber,
                            tokenName: name,
                            tokenImage: logoURI,
                            tokenDecimal: decimals,    // Add token decimal if needed for further processing
                            claimedAmount: formatNumber(ethers.formatUnits(claimedAmountinWei, decimals))
                        };

                        lockedPayments.push(processedData);

                    } else {
                        console.warn(`Token information not found for address: ${paymentData.tokenAddress}`);
                    }
                }
                setTotalSendAmount(totalSend)

                setSendData(lockedPayments)
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




    useEffect(() => {
        getOpenDispute()
        getOnGoingPaymentData()
        getSendLockedPaymentData()
        getReceiveLockedPaymentData()
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

    return (
        <div className="crypto-page relative min-h-[calc(100vh-80px)] bg-[#F7F6F3]">
            <div className="crypto-gradient-bg" />
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

                {/* PAGE HEADER */}
                <div className="mb-6 md:mb-10 animate-fade-in-up">
                    <p className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-[#F97316] mb-2">Portfolio</p>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-[#111111] tracking-tight">
                        Ongoing <span className="text-[#F97316]">Payments</span>
                    </h1>
                </div>

                {/* STATS CARDS */}
                <div className="grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-5 mt-8">
                    {[
                        { label: 'Sent', value: totalSendAmount, color: 'text-[#111111]', loading: sendDataLoading },
                        { label: 'Received', value: totalReceiveAmount, color: 'text-emerald-600', loading: receiveDataLoading },
                        { label: 'Unlocked', value: totalClaimableAmount, color: 'text-[#F97316]', loading: dataLoading },
                        { label: 'Disputes', value: totalOpenDispute, color: 'text-amber-600', loading: disputeLoading, isCount: true }
                    ].map((stat, i) => (
                        <div key={i} className="glass-card border border-[#EEEBE5] p-6 rounded-2xl animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B6B6B] mb-1">{stat.label}</p>
                            <div className={`text-2xl font-bold ${stat.color}`}>
                                {stat.loading ? <Loader size="20px" /> : (stat.isCount ? stat.value : stat.value.toLocaleString(undefined, { minimumFractionDigits: 2 }))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* TRANSACTION HISTORY SECTION */}
                <div className="mt-12 md:mt-16 animate-fade-in-up">
                    <h2 className="text-lg md:text-xl font-bold text-[#111111] mb-6">History Overview</h2>
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
                                columns={filterName === RECEIVE ? receiveDataColumns : sendDataColumns}
                                loading={filterName === RECEIVE ? receiveDataLoading : sendDataLoading}
                                rowHeight={70}
                                initialState={{ pagination: { paginationModel: { pageSize } } }}
                                onPaginationModelChange={handlePaginationModelChange}
                                slots={{ noRowsOverlay: CustomNoRowsOverlay, loadingOverlay: CustomDataGridSkeleton }}
                            />
                        </Box>
                    </div>
                </div>

                {/* COLLECT PAYMENT SECTION */}
                <div className="mt-12 md:mt-16 animate-fade-in-up">
                    <h2 className="text-lg md:text-xl font-bold text-[#111111] mb-6">Active Milestones</h2>
                    <div className="glass-card border border-[#EEEBE5] rounded-2xl md:rounded-3xl overflow-hidden">
                        <Box sx={dataGridSx}>
                            <DataGrid
                                rows={onGoingData}
                                columns={columns}
                                loading={dataLoading}
                                rowHeight={80}
                                initialState={{ pagination: { paginationModel: { pageSize } } }}
                                onPaginationModelChange={handlePaginationModelChange}
                                slots={{ noRowsOverlay: CustomNoRowsOverlay, loadingOverlay: CustomDataGridSkeleton }}
                            />
                        </Box>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {claimModal && <ClaimPayment setClaimModal={setClaimModal} paymentId={paymentId} getData={getOnGoingPaymentData} getReceiveLockedPaymentData={getReceiveLockedPaymentData} paymentType="LockedPayment" />}
            {disputeModal && <DisputeModal setDisputeModal={setDisputeModal} currentItem={currentItem} setCurrentItem={setCurrentItem} getData={getOnGoingPaymentData} getSendLockedPaymentData={getSendLockedPaymentData} getReceiveLockedPaymentData={getReceiveLockedPaymentData} />}
        </div>
    );
}

export default OnGoing