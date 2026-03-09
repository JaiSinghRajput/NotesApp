import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { NoteCard } from '../components/NoteCard';
import apiClient from '../api/apiClient';
import { useAuthStore } from '../stores/authStore';
import { cn } from '../utils/cn';

export const Dashboard = () => {
    const { user } = useAuthStore();
    const [loading, setLoading] = React.useState(true);
    const [recentNotes, setRecentNotes] = React.useState([]);
    const [trendingNotes, setTrendingNotes] = React.useState([]);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [recentRes, trendingRes] = await Promise.all([
                    apiClient.get('/notes?limit=4'),
                    apiClient.get('/notes/trending?limit=4')
                ]);
                setRecentNotes(recentRes.data.data.notes || []);
                setTrendingNotes(trendingRes.data.data || []);
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Welcome Section */}
            <section>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative p-8 rounded-3xl overflow-hidden glass border border-white/5"
                >
                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold text-white mb-2">
                            Welcome back, <span className="text-primary">{user?.name || 'Explorer'}</span>! 👋
                        </h1>
                        <p className="text-text-secondary text-lg max-w-2xl">
                            Ready to dive back into your studies? Explore thousands of community-shared notes and boost your learning today.
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/10 via-transparent to-transparent hidden lg:block" />
                    <TrendingUp className="absolute bottom-[-20px] right-20 text-primary/5 size-48 lg:block hidden" />
                </motion.div>
            </section>

            {/* Stats / Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Notes', value: '1,280+', color: 'text-primary' },
                    { label: 'Active Learners', value: '45,000+', color: 'text-accent' },
                    { label: 'Daily Downloads', value: '350+', color: 'text-blue-400' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-6 flex flex-col justify-center text-center"
                    >
                        <p className="text-text-secondary text-sm font-medium uppercase tracking-wider mb-1">{stat.label}</p>
                        <p className={cn("text-3xl font-bold", stat.color)}>{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Recent Uploads */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="text-primary" />
                        <h2 className="text-2xl font-bold text-white">Recent Uploads</h2>
                    </div>
                    <button className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm font-medium">
                        View All <ArrowRight size={16} />
                    </button>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {recentNotes.length > 0 ? (
                        recentNotes.map((note: any) => (
                            <motion.div key={note._id} variants={item}>
                                <NoteCard note={note} />
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center glass rounded-2xl">
                            <p className="text-text-secondary">No notes found. Be the first to upload one!</p>
                        </div>
                    )}
                </motion.div>
            </section>

            {/* Trending Notes */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="text-accent" />
                        <h2 className="text-2xl font-bold text-white">Trending Now</h2>
                    </div>
                    <button className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm font-medium">
                        View All <ArrowRight size={16} />
                    </button>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {trendingNotes.length > 0 ? (
                        trendingNotes.map((note: any) => (
                            <motion.div key={note._id} variants={item}>
                                <NoteCard note={note} />
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center glass rounded-2xl">
                            <p className="text-text-secondary">Explore more to see trending notes.</p>
                        </div>
                    )}
                </motion.div>
            </section>
        </div>
    );
};
