import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { menuList } from '../../config/data'

const Navbar = () => {
    const location = useLocation()

    return (
        <aside className="hidden lg:flex lg:flex-col fixed top-0 left-0 bottom-0 z-20 w-[260px] border-r border-solid border-[#EEEBE5] bg-[#FFFFFF]">
            {/* Logo — height matches header (64px) */}
            <div className="flex h-16 min-h-[64px] shrink-0 items-center gap-3 border-b border-solid border-[#EEEBE5] px-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F97316]">
                    <span className="text-lg font-bold text-white">$</span>
                </div>
                <span className="truncate text-lg font-bold tracking-tight text-[#111111]">TempPay</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {menuList.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                                isActive
                                    ? 'bg-[#FFF7ED] text-[#F97316] font-semibold'
                                    : 'text-[#6B6B6B] hover:bg-[#FFF7ED] hover:text-[#F97316]'
                            }`}
                        >
                            {/* Active left bar */}
                            {isActive && (
                                <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[#F97316]" />
                            )}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                isActive ? 'bg-[#FFF7ED]' : 'bg-gray-100'
                            }`}>
                                <i className={`${item.icon} text-sm ${isActive ? 'text-[#F97316]' : 'text-[#6B6B6B]'}`}></i>
                            </div>
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom branding */}
            <div className="px-6 py-4 border-t border-[#EEEBE5]">
                <p className="text-xs text-[#9B9B9B]">&copy; {new Date().getFullYear()} TempPay</p>
            </div>
        </aside>
    )
}

export default Navbar