import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '../organisms/Sidebar';

export const DashboardLayout = ({ children, user }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#0a0a0c]">
            <Sidebar user={user} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <main className="flex-1 lg:ml-72 p-4 md:p-8 lg:p-12 overflow-y-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
};
