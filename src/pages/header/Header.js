import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { menuList } from '../../config/data'
import Profile from '../../Modal/Profile'

const Header = () => {
    const [open, setOpen] = useState(false)
    const location = useLocation()

    return (
        <>
            <header
                className="sticky top-0 z-50 flex h-16 min-h-[64px] w-full items-center justify-between border-b border-solid border-[#EEEBE5] bg-[#FFFFFF] px-4 lg:ml-[260px] lg:w-[calc(100%-260px)] lg:px-6"
            >
                <div className="flex min-w-0 items-center gap-3">
                    <button
                        type="button"
                        className="shrink-0 rounded-lg p-2 text-[#6B6B6B] hover:bg-[#FFF7ED] hover:text-[#F97316] transition-colors lg:hidden"
                        onClick={() => setOpen(!open)}
                        aria-label={open ? 'Close menu' : 'Open menu'}
                    >
                        <i className={open ? 'fas fa-times text-lg' : 'fas fa-bars text-lg'}></i>
                    </button>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                    <Profile />
                </div>
            </header>

            {/* Mobile Drawer */}
            {open && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-72 bg-white border-r border-[#EEEBE5] shadow-xl animate-fade-in overflow-y-auto">
                        {/* Logo */}
                        <div className="flex items-center gap-3 p-5 border-b border-[#EEEBE5]">
                            <div className="w-9 h-9 rounded-xl bg-[#F97316] flex items-center justify-center">
                                <span className="text-white font-bold text-lg">$</span>
                            </div>
                            <span className="text-xl font-bold text-[#111111]">TempPay</span>
                        </div>

                        {/* Nav links */}
                        <nav className="p-3 space-y-1">
                            {menuList.map((item) => {
                                const isActive = location.pathname === item.path
                                return (
                                    <Link
                                        key={item.id}
                                        to={item.path}
                                        onClick={() => setOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                            isActive
                                                ? 'bg-[#FFF7ED] text-[#F97316] font-semibold'
                                                : 'text-[#6B6B6B] hover:bg-[#FFF7ED] hover:text-[#F97316]'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                            isActive ? 'bg-[#FFF7ED]' : 'bg-gray-100'
                                        }`}>
                                            <i className={`${item.icon} text-sm ${isActive ? 'text-[#F97316]' : 'text-[#6B6B6B]'}`}></i>
                                        </div>
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                </div>
            )}
        </>
    )
}

export default Header