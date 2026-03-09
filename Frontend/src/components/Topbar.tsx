import React from 'react';
import { Search, Bell, Moon, Sun, Menu } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';

export const Topbar = () => {
    const { toggleSidebar, theme, toggleTheme } = useUIStore();
    const { user } = useAuthStore();

    return (
        <header className="h-20 glass border-b border-white/5 sticky top-0 z-30 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-text-secondary"
                >
                    <Menu size={20} />
                </button>

                <div className="max-w-md w-full relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search notes, categories, tags..."
                        className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white/10 transition-all placeholder:text-text-secondary/50"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl hover:bg-white/5 text-text-secondary hover:text-white transition-all"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <button className="p-2.5 rounded-xl hover:bg-white/5 text-text-secondary hover:text-white transition-all relative">
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-surface" />
                </button>

                <div className="h-8 w-px bg-white/10 mx-2" />

                <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                    <div className="text-right lg:block hidden">
                        <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors">{user?.name || 'Guest'}</p>
                        <p className="text-[10px] text-text-secondary group-hover:text-text-secondary/80 uppercase tracking-widest">{user?.role || 'user'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent p-[2px] shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                        <div className="w-full h-full rounded-[10px] bg-surface flex items-center justify-center text-white font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
