import React, { useState } from 'react'
import { useAccount } from 'wagmi';
import { mileStoneDuration } from '../../config/data';
import { chevronDownIcon } from '../../constant/icon';

const Milestone = ({ handleSelectChange, milestoneDuration }) => {
    const [isOpenFromDropdown, setIsOpenFromDropdown] = useState(false);

    const { address: walletAddress } = useAccount()

    const toggleFirstDropdown = () => {
        setIsOpenFromDropdown(!isOpenFromDropdown);
    };
    return (
        <div>
            <div onClick={toggleFirstDropdown} className="flex justify-between items-center gap-5 rounded-lg border border-gray-300 p-2.5 bg-white text-black cursor-pointer">
                {milestoneDuration ? (
                    <div className="flex items-center justify-between w-full">
                        <div className='flex'>
                            <span>{milestoneDuration}</span>
                        </div>
                        <div className=''><i className={chevronDownIcon}></i></div>

                    </div>
                ) : (
                    <div className='flex justify-between w-full'>
                        <div>Select Token</div>
                        <div className=''><i className={chevronDownIcon}></i></div>
                    </div>
                )}
            </div>
            {isOpenFromDropdown && (
                <ul className="absolute bg-white w-full max-h-52 overflow-y-auto py-3 rounded shadow-md z-10">
                    {mileStoneDuration.map((item) => (
                        <li
                            key={item.name}
                            onClick={() => handleSelectChange(item)}
                            className="flex items-center cursor-pointer hover:bg-gray-200 p-2 w-full"
                        >
                            <div className='flex justify-between items-center w-full'>
                                <div className='flex'>
                                    <span>{item.name}</span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default Milestone