import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { useUIStore } from '../stores/uiStore';
import { motion } from 'framer-motion';

export const RootLayout = () => {
    const { isSidebarOpen } = useUIStore();

    return (
        <div className="min-h-screen bg-bg text-text-primary">
            <Sidebar />
            <motion.div
                initial={false}
                animate={{
                    marginLeft: isSidebarOpen ? 260 : 80,
                }}
                className="flex flex-col min-h-screen transition-all lg:block hidden"
            >
                <Topbar />
                <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
                    <Outlet />
                </main>
            </motion.div>

            {/* Mobile Layout */}
            <div className="flex flex-col min-h-screen lg:hidden">
                <Topbar />
                <main className="flex-1 p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
