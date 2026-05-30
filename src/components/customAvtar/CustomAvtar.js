import React from 'react'
import { generateAvtar } from '../../utils/commonFunction'
import { userIcon } from '../../constant/icon'

const CustomAvtar = ({ name }) => {
    return (
        <div className='relative '>
            <div className='h-9 w-9 rounded-full border border-customBlue flex justify-center items-center bg-customBlue '>
                {/* <i className={`text-white  ${userIcon}`}></i> */}
                {!name ? <i className={`${userIcon} text-white`}></i> : <p className='text-white  font-medium'>{generateAvtar(name)}</p>}
            </div>
            <div className='bg-green-500 p-1 w-2 h-2 rounded-full absolute bottom-[2px] right-[0.1rem]'></div>
        </div>
    )
}

export default CustomAvtar