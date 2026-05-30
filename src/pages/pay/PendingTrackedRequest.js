import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ethers } from 'ethers';
import React, { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { CPGABI } from '../../ABI/ABI';
import { targetChainId, CPGAddress, defaultPageSize, initialTokenList, pageSizeLength } from '../../constant/constant';
import ApproveRequestModal from '../../Modal/ApproveRequest';
import { copyToClipboard, CustomNoRowsOverlay, findExactMultiple, formatNumber, shortenWalletAddress } from '../../utils/commonFunction';
import { readContractData } from '../../utils/contractInstance';
import { copyIcon } from '../../constant/icon';
import { Tooltip } from 'react-tooltip';

const PendingTrackedRequest = ({ selectedPaymentType }) => {
    const [approveReqModal, setApproveReqModal] = useState(false)
    const [currentItem, setCurrentItem] = useState({})
    const [loading, setLoading] = useState(false)
    const [pendingPaymentData, setPendingPaymentData] = useState([])
    const [pageSize, setPageSize] = useState(defaultPageSize)

    const handlePaginationModelChange = (model) => {
        setPageSize(model.pageSize);
    }


    const { isConnected, address: walletAddress, chainId } = useAccount()
    // const chainId = useChainId();


    const approveRef = useRef()

    const handleOpenApproveModal = (item) => {
        setCurrentItem(item)
        approveRef.current.click()

    }
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
            field: 'requester',
            headerName: 'Requester Address',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 150,
            headerClassName: 'super-app-theme--header',
            renderCell: (params) => {

                return <>
                    <div className='text-center'>
                        {params.row.requester &&
                            <div className='flex justify-center items-center'>
                                <p data-tooltip-id={`my-tooltip-${params.row.id}`}>
                                    {shortenWalletAddress(params.row.requester)}
                                </p>
                                <button className='' onClick={() => copyToClipboard(params.row.requester)}>
                                    <i className={`text-gray-500 text-sm ms-2 ${copyIcon}`} />
                                </button>
                            </div>
                        }

                    </div>
                    {params.row.requester && <Tooltip id={`my-tooltip-${params.row.id}`}
                        place='bottom'
                        content={params.row.requester} />}
                </>
            }
        },
        {
            field: 'tokenName',
            headerName: 'Token Name',
            flex: 1,
            minWidth: 110,
            headerAlign: 'center',
            align: 'center',
            headerClassName: 'super-app-theme--header',
            renderCell: (params) => (
                <div className='flex justify-center'>
                    <img src={params.row.tokenImage} alt="" className='w-8 h-8 mt-2.5 me-3' />
                    <span>{params.row.tokenName}</span>
                </div>
            ),
        },
        {
            field: 'amount',
            headerName: 'Amount',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 150,
            headerClassName: 'super-app-theme--header'
        },
        {
            field: 'milestones',
            headerName: 'Milestone Count',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 150,
            headerClassName: 'super-app-theme--header'
        },
        {
            field: 'milestoneInterval',
            headerName: 'Milestone Duration',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 150,
            headerClassName: 'super-app-theme--header',
            renderCell: (params) => {
                const unitName = findExactMultiple(params.row.milestoneInterval.toString())
                return (
                    <div className='flex justify-center'>
                        {unitName?.unit || 0}
                    </div>
                )
            }
        },
        {
            field: 'action',
            headerName: 'Action',
            flex: 1,
            minWidth: 150,
            headerAlign: 'center',
            headerClassName: 'super-app-theme--header',
            sortable: false,
            renderCell: (params) => (
                <div className='flex justify-center'>
                    <button
                        variant="contained"
                        className='border border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white px-10 h-10 flex items-center my-1 rounded-xl'
                        onClick={() => handleOpenApproveModal(params.row)}
                    >
                        View
                    </button>
                </div>
            ),
        },
    ];



    const getPendingRequestData = async () => {
        try {
            setLoading(true)
            const count = await readContractData(CPGAddress, CPGABI, 'getLockedPaymentRequestCountByReceiver', [walletAddress])

            const pendingRequest = [];
            if (Number(count) > 0) {

                for (let i = 0; i < Number(count); i++) {
                    const paymentData = await readContractData(CPGAddress, CPGABI, 'getLockedPaymentRequestByReceiver', [walletAddress, i]);

                    const paymentId = Number(paymentData.requestId);

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

                        // Add tokenName and converted amount to the processed data
                        const processedData = {
                            ...paymentData,
                            id: paymentId,
                            amount,
                            parsedNumber,
                            tokenName: name,
                            tokenImage: logoURI,     // Add token name
                            tokenDecimal: decimals,
                        };

                        pendingRequest.push(processedData);
                    } else {
                        console.warn(`Token information not found for address: ${paymentData.tokenAddress}`);
                    }
                }

                const pendingPayments = pendingRequest.filter(payment => payment.isAccepted === false);

                // const claimedPayments = pendingRequest.filter(payment => payment.isClaimed === true);
                setPendingPaymentData(pendingPayments);
            }
        } catch (error) {
            console.log(error);

        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isConnected && chainId === targetChainId) {
            getPendingRequestData()
        }
        // eslint-disable-next-line
    }, [walletAddress])

    return (
        <>
            <div>
                <p className='text-2xl mb-4 font-medium mt-10 text-slate-50'>Pending Request</p>
                <div className='glass-card p-0 overflow-visible'>
                    <div className='crypto-datagrid-wrapper'>
                        <Box
                            sx={{
                                width: '100%',
                                height: '66vh',
                                '& .super-app-theme--header': {
                                    backgroundColor: '#020617',
                                    color: '#e5e7eb',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    borderBottom: '1px solid #1f2937',
                                },
                                '& .MuiDataGrid-root': {
                                    backgroundColor: 'transparent',
                                    color: '#e5e7eb',
                                    border: 'none',
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    borderBottomColor: '#1f2937',
                                },
                                '& .MuiDataGrid-cell': {
                                    borderBottomColor: '#1f2937',
                                },
                                '& .MuiDataGrid-row:hover': {
                                    backgroundColor: '#020617',
                                },
                                '& .MuiDataGrid-cell:focus': {
                                    outline: 'none',
                                },
                                borderBottom: 1,
                                borderColor: '#1f2937',
                                borderBottomLeftRadius: 16,
                                borderBottomRightRadius: 16,
                                overflow: 'hidden',
                            }}
                        >
                            <DataGrid
                                rows={pendingPaymentData}
                                columns={columns}
                                pageSize={5}
                                rowsPerPageOptions={[5]}
                                disableSelectionOnClick
                                loading={loading}
                                pageSizeOptions={pageSizeLength}
                                initialState={{
                                    pagination: {
                                        paginationModel: {
                                            pageSize: pageSize,
                                        },
                                    },
                                }}
                                onPaginationModelChange={handlePaginationModelChange}
                                slots={{
                                    noRowsOverlay: CustomNoRowsOverlay,
                                }}
                                slotProps={{
                                    loadingOverlay: {
                                        variant: 'skeleton',
                                        noRowsVariant: 'skeleton',
                                    },
                                }}
                                experimentalFeatures={{ newEditingApi: true }}
                            />
                        </Box>
                    </div>
                </div>
            </div>
            {/*************************************************************Approve Request Modal********************************************/}
            <>
                <button
                    ref={approveRef}
                    className="bg-[#FFF7ED] text-black active:bg-[#F97316] 
                      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 hidden"
                    type="button"
                    onClick={() => setApproveReqModal(true)}
                >
                    Fill Details
                </button>
                {approveReqModal ? (
                    <>
                        <ApproveRequestModal setApproveReqModal={setApproveReqModal} currentItem={currentItem} setCurrentItem={setCurrentItem} getPendingRequestData={getPendingRequestData} selectedPaymentType={selectedPaymentType} />
                    </>
                ) : null}
            </>
            {/*************************************************************Approve Request Modal********************************************/}
        </>
    )
}

export default PendingTrackedRequest;
