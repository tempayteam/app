import React from 'react'
import { homeIcon } from '../../constant/icon'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
    const navigate = useNavigate()
    return (
        <div className=''>
            <div className='container mx-auto h-screen flex items-center justify-center md:p-4 p-5'>
                <div className='text-center'>
                    <img src="https://static-00.iconduck.com/assets.00/404-page-not-found-illustration-2048x998-yjzeuy4v.png" alt="" className='sm:h-80 h-60 mb-5' />
                    <p className='text-3xl mb-2'>Page Not Found⚠️</p>
                    <p className='text-xl mb-5'>We couldn′t find the page you are looking for.</p>
                    <button className='bg-customBlue text-white rounded-xl text-lg font-medium px-8 py-3' onClick={() => navigate('/')}>
                        <i className={`${homeIcon} me-3`}></i>
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    )
}

export default NotFound