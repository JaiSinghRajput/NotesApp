import { useQuery } from '@tanstack/react-query';
import {
    BarChart3,
    Users,
    FileText,
    Download,
    TrendingUp,
    Activity,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '../api/apiClient';

export const Stats = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['platform-stats'],
        queryFn: async () => {
            const res = await apiClient.get('/uploads/platform-stats');
            return res.data.data;
        }
    });

    if (isLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    const cards = [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Total Notes', value: stats.totalNotes, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
        { label: 'Total Downloads', value: stats.totalDownloads, icon: Download, color: 'text-accent', bg: 'bg-accent/10' },
        { label: 'Growth Rate', value: '+12%', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    ];

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <BarChart3 className="text-primary" /> Platform Intelligence
                </h1>
                <p className="text-text-secondary">Comprehensive analytics and platform oversight for administrators.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-6 flex items-center gap-4"
                    >
                        <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
                            <card.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-text-secondary">{card.label}</p>
                            <p className="text-2xl font-bold text-white">{card.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Category Distribution */}
                <div className="lg:col-span-2 glass-card p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Activity size={20} className="text-primary" /> Content Distribution
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {stats.categoryStats.map((cat: any, i: number) => {
                            const percentage = (cat.count / stats.totalNotes) * 100;
                            return (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">{cat._id}</span>
                                        <span className="text-white font-medium">{cat.count} Notes ({percentage.toFixed(1)}%)</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            className="h-full bg-primary"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Recent Uploads Table */}
                    <div className="pt-8 border-t border-white/5 space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileText size={20} className="text-accent" /> Recent Platform Activity
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-xs text-text-secondary uppercase tracking-widest border-b border-white/5">
                                        <th className="pb-4 font-bold">What</th>
                                        <th className="pb-4 font-bold">Who</th>
                                        <th className="pb-4 font-bold">Category</th>
                                        <th className="pb-4 font-bold">When</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {stats.recentNotes.map((note: any, j: number) => (
                                        <tr key={j} className="border-b border-white/5 group hover:bg-white/[0.02] transition-colors">
                                            <td className="py-4 text-white font-medium">{note.title}</td>
                                            <td className="py-4 text-text-secondary">{note.uploadedBy?.name || 'Deleted User'}</td>
                                            <td className="py-4">
                                                <span className="px-2 py-1 rounded-md bg-white/5 text-[10px] font-bold text-primary uppercase">
                                                    {note.category}
                                                </span>
                                            </td>
                                            <td className="py-4 text-text-secondary">{new Date(note.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* System Activity */}
                <div className="glass-card p-8 space-y-6 flex flex-col h-full">
                    <h2 className="text-xl font-bold text-white">Quick Insights</h2>
                    <div className="space-y-4 flex-1">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-1">Most Active</p>
                            <p className="text-white font-medium">Content growth is currently focused on the {stats.categoryStats[0]?._id || 'Unknown'} area.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-1">User Base</p>
                            <p className="text-white font-medium">The platform has reached {stats.totalUsers} registered scholars.</p>
                        </div>
                    </div>
                    <button className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all">
                        Export Comprehensive Report
                    </button>
                </div>
            </div>
        </div>
    );
};
