import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Search,
    FileText,
    Layers,
    Upload,
    Users,
    User,
    LogOut,
    ChevronLeft,
    X
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import { cn } from '../utils/cn';

const SidebarItem = ({
    icon: Icon,
    label,
    to,
    collapsed,
    isActive
}: {
    icon: any,
    label: string,
    to: string,
    collapsed: boolean,
    isActive: boolean
}) => (
    <Link
        to={to}
        className={cn(
            "flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group relative",
            isActive
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-text-secondary hover:text-white hover:bg-white/5"
        )}
    >
        <Icon size={20} className={cn(isActive ? "text-white" : "group-hover:text-primary transition-colors")} />
        {!collapsed && (
            <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-medium whitespace-nowrap"
            >
                {label}
            </motion.span>
        )}
        {collapsed && (
            <div className="absolute left-14 bg-surface px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl border border-white/10 whitespace-nowrap">
                {label}
            </div>
        )}
    </Link>
);

export const Sidebar = () => {
    const { isSidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
    const { user, clearAuth } = useAuthStore();
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
        { icon: Search, label: 'Browse Notes', to: '/browse' },
        { icon: Layers, label: 'Categories', to: '/categories' },
    ];

    const adminItems = [
        { icon: Upload, label: 'Upload Note', to: '/admin/upload' },
        { icon: FileText, label: 'My Uploads', to: '/admin/my-uploads' },
        { icon: Layers, label: 'Category Mgmt', to: '/admin/categories' },
    ];

    const superAdminItems = [
        { icon: Users, label: 'User Management', to: '/super-admin/users' },
        { icon: LayoutDashboard, label: 'Platform Stats', to: '/super-admin/stats' },
    ];

    const profileItems = [
        { icon: Search, label: 'Search', to: '/search' },
        { icon: User, label: 'Profile', to: '/profile' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{
                    width: isSidebarOpen ? 260 : 80,
                    x: 0
                }}
                className={cn(
                    "fixed top-0 left-0 h-screen glass border-r border-white/5 bg-surface/90 backdrop-blur-2xl z-50 flex flex-col",
                    !isSidebarOpen && "lg:w-20"
                )}
            >
                <div className="flex items-center justify-between p-6 h-20">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/40">
                            N
                        </div>
                        {isSidebarOpen && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="font-bold text-xl tracking-tight text-white"
                            >
                                NOTES_APP
                            </motion.span>
                        )}
                    </Link>
                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary lg:flex hidden"
                    >
                        <ChevronLeft className={cn("transition-transform duration-300", !isSidebarOpen && "rotate-180")} />
                    </button>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-6">
                    <div className="space-y-1">
                        {menuItems.map((item) => (
                            <SidebarItem
                                key={item.to}
                                {...item}
                                collapsed={!isSidebarOpen}
                                isActive={location.pathname === item.to}
                            />
                        ))}
                    </div>

                    {user?.role === 'admin' && (
                        <div className="space-y-1">
                            {isSidebarOpen && <p className="px-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2 opacity-50">Admin</p>}
                            {adminItems.map((item) => (
                                <SidebarItem
                                    key={item.to}
                                    {...item}
                                    collapsed={!isSidebarOpen}
                                    isActive={location.pathname === item.to}
                                />
                            ))}
                        </div>
                    )}

                    {user?.role === 'super-admin' && (
                        <div className="space-y-1">
                            {isSidebarOpen && <p className="px-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2 opacity-50">Super Admin</p>}
                            {superAdminItems.map((item) => (
                                <SidebarItem
                                    key={item.to}
                                    {...item}
                                    collapsed={!isSidebarOpen}
                                    isActive={location.pathname === item.to}
                                />
                            ))}
                        </div>
                    )}

                    <div className="space-y-1">
                        {isSidebarOpen && <p className="px-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2 opacity-50">Settings</p>}
                        {profileItems.map((item) => (
                            <SidebarItem
                                key={item.to}
                                {...item}
                                collapsed={!isSidebarOpen}
                                isActive={location.pathname === item.to}
                            />
                        ))}
                        <button
                            onClick={clearAuth}
                            className={cn(
                                "w-full flex items-center gap-4 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all group relative",
                            )}
                        >
                            <LogOut size={20} />
                            {isSidebarOpen && <span className="font-medium">Logout</span>}
                        </button>
                    </div>
                </div>

                {isSidebarOpen && (
                    <div className="p-4 border-t border-white/5">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate text-white">{user?.name || 'Guest'}</p>
                                <p className="text-xs text-text-secondary truncate">{user?.role || 'user'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </motion.aside>
        </>
    );
};
