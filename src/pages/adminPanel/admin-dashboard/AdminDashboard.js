import React, { useState } from 'react';
import { checkIcon, closeIcon, responseIcon } from '../../../constant/icon';
import { Autocomplete, Box, FormControl, MenuItem, TextField } from '@mui/material';
import { filterTypes } from '../../../config/data';
import { CustomNoRowsOverlay, CustomDataGridSkeleton, getMonthInWordWithDateAndYear } from '../../../utils/commonFunction';
import { DataGrid } from '@mui/x-data-grid';
import { defaultPageSize, pageSizeLength } from '../../../constant/constant';

const AdminDashboard = () => {
    const [type, setType] = useState([])
    const [pageSize, setPageSize] = useState(defaultPageSize)


    const handleChangeType = (event, newValue) => {
        setType(newValue);
    };

    const handlePaginationModelChange = (model) => {
        setPageSize(model.pageSize);
    }

    const closeDisputecolumns = [
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
            headerName: ' User name',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 150,
            headerClassName: 'super-app-theme--header'
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
            field: 'dueDate',
            headerName: 'Due Date',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 150,
            headerClassName: 'super-app-theme--header',
            renderCell: (params) => {
                return (
                    <div className='flex justify-center'>
                        <div className='px-10 h-10 flex items-center my-1 rounded-xl'>
                            <p>{getMonthInWordWithDateAndYear(params.row.releaseDate)}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            field: 'status',
            headerName: 'Status',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 150,
            headerClassName: 'super-app-theme--header',
            renderCell: (params) => {
                const statusColor = params.value === 'Accepted' ? 'text-green-600' : 'text-red-500';
                return (
                    <div className={`flex justify-center ${statusColor}`}>
                        <div className='px-10 h-10 flex items-center my-1 rounded-xl'>
                            <p>{params.value}</p>
                        </div>
                    </div>
                );
            },
        }

    ];

    const closeDisputerows = [
        { id: 1, userName: 'Snow', amount: 1000.00, releaseDate: '2024-11-21', status: 'Accepted' },
        { id: 2, userName: 'Lannister', amount: 500.00, releaseDate: '2024-11-15', status: 'Accepted' },
        { id: 3, userName: 'Lannister', amount: 500.00, releaseDate: '2024-11-15', status: 'Rejected' },
        { id: 4, userName: 'Stark', amount: 600.00, releaseDate: '2024-11-17', status: 'Accepted' },
        { id: 5, userName: 'Targaryen', amount: 500.00, releaseDate: '2024-11-15', status: 'Rejected' },
        { id: 6, userName: 'Melisandre', amount: 500.00, releaseDate: '2024-11-15', status: 'Accepted' },
        { id: 7, userName: 'Clifford', amount: 500.00, releaseDate: '2024-11-15', status: 'Rejected' },
        { id: 8, userName: 'Frances', amount: 400.00, releaseDate: '2024-11-20', status: 'Rejected' },
        { id: 9, userName: 'Roxie', amount: 500.00, releaseDate: '2024-11-15', status: 'Accepted' },
    ];

    return (
        <div className='lg:container lg:mx-auto sm:mx-5 md:p-4 p-5 mt-3'>
            <p className='font-medium text-3xl mb-5'>Dashboard</p>
            {/********************************************** Card Section ******************************************************/}
            <div className='grid md:grid-cols-3 grid-cols-1 gap-4 mt'>
                <div className='border border-gray-300 bg-white shadow-lg shadow-gray-400 rounded-xl p-5 text-center flex flex-col items-center justify-center'>
                    {/* <p className='rounded-full p-3 w-10 h-10  border border-blue-500 flex items-center justify-center'>
                        <i className={`${responseIcon} text-blue-500`}></i>
                    </p> */}
                    <p className=' text-lg mb-2'>Pending Dispute</p>
                    <p className='text-gray-700 text-2xl '>10</p>
                </div>
                <div className='border border-gray-300 bg-white shadow-lg shadow-gray-400 rounded-xl p-5 text-center flex flex-col items-center justify-center'>
                    {/* <p className='rounded-full p-3 w-10 h-10  border border-green-500 flex items-center justify-center'>
                        <i className={`${checkIcon} text-green-500`}></i>
                    </p> */}
                    <p className='text-lg mb-2'>Accepted Dispute</p>
                    <p className='text-gray-700 text-2xl '>10</p>
                </div>
                <div className='border border-gray-300 bg-white shadow-lg shadow-gray-400 rounded-xl p-5 text-center flex flex-col items-center justify-center'>
                    {/* <p className='rounded-full p-3 w-10 h-10  border border-red-500 flex items-center justify-center'>
                        <i className={`${closeIcon} text-red-500`}></i>
                    </p> */}
                    <p className='text-lg mb-2'>Rejected Dispute</p>
                    <p className='text-gray-700 text-2xl '>10</p>
                </div>

            </div>
            {/********************************************** Card Section ******************************************************/}

            {/********************************************** Filter Section ******************************************************/}
            <div className='border border-gray-300 bg-white shadow-xl shadow-gray-400 rounded-xl p-7 mt-10'>
                <div className='flex justify-end items-center mb-7'>
                    <p className='me-4'>Filter By:</p>
                    <FormControl size="small" className='sm:w-auto md:w-72 w-full'
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                            },
                        }}>
                        <Autocomplete
                            multiple
                            limitTags={2}
                            size='small'
                            id="autocomplete-multiple-chip"
                            options={filterTypes} // The list of options
                            value={type} // The current selected values
                            onChange={handleChangeType} // Handle change events
                            // renderTags={(selected, getTagProps) =>
                            //     selected.map((value, index) => (
                            //         <Chip
                            //             key={value}
                            //             label={value}
                            //             {...getTagProps({ index })}
                            //         />
                            //     ))
                            // }
                            renderOption={(props, option, { selected }) => {
                                return (
                                    <MenuItem
                                        {...props}
                                        key={option}
                                        value={option}
                                        sx={{
                                            backgroundColor: selected ? 'yellow' : 'inherit',
                                            '&.Mui-focused': {
                                                backgroundColor: selected ? 'black' : 'yellow',
                                            },
                                        }}
                                    >
                                        {option}
                                    </MenuItem>
                                )
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                />
                            )}
                        // Add your styles here
                        />
                    </FormControl>
                </div>
                <Box
                    sx={{
                        width: '100%',
                        '& .super-app-theme--header': {
                            backgroundColor: '#F3EFFD',
                            color: 'black'
                        },
                    }}
                >
                    <DataGrid
                        rows={closeDisputerows}
                        columns={closeDisputecolumns}
                        rowsPerPageOptions={[5]}
                        disableSelectionOnClick
                        experimentalFeatures={{ newEditingApi: true }}
                        loading={false}
                        sx={{
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: 'transparent',
                            },
                            '& .MuiDataGrid-cell:focus': {
                                outline: 'none',
                            },
                            border: 1,
                            borderColor: 'grey.300',
                            borderRadius: 3

                        }}
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
                            loadingOverlay: CustomDataGridSkeleton
                        }}
                    />
                </Box>
            </div>
            {/********************************************** Filter Section ******************************************************/}

        </div>
    )
}

export default AdminDashboard