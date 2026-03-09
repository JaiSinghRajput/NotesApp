import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, X, ArrowRight, History, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { Loader2 } from 'lucide-react';

export const Search = () => {
    const navigate = useNavigate();
    const [query, setQuery] = React.useState('');
    const { data: categories, isLoading: catsLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await apiClient.get('/categories');
            return res.data.data;
        }
    });

    const [recentSearches, setRecentSearches] = React.useState<string[]>(() => {
        const saved = localStorage.getItem('recentSearches');
        return saved ? JSON.parse(saved) : ['Web Development', 'React Design', 'Node.js API'];
    });

    const handleSearch = (searchQuery: string) => {
        if (!searchQuery.trim()) return;

        // Save to recent searches
        const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));

        navigate(`/browse?query=${encodeURIComponent(searchQuery)}`);
    };

    const container = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, x: -10 },
        show: { opacity: 1, x: 0 }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-12 py-12">
            <div className="text-center space-y-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex p-4 rounded-3xl bg-primary/10 text-primary mb-2"
                >
                    <SearchIcon size={32} />
                </motion.div>
                <h1 className="text-4xl font-bold text-white">Find Your Next Lesson</h1>
                <p className="text-text-secondary text-lg">Search through thousands of high-quality notes shared by the community.</p>
            </div>

            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-blue-500 rounded-[2rem] blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
                <div className="relative flex items-center bg-surface border border-white/10 rounded-[2rem] p-2 pr-4 shadow-2xl">
                    <div className="p-4 text-text-secondary group-focus-within:text-primary transition-colors">
                        <SearchIcon size={24} />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                        autoFocus
                        placeholder="Type something like 'advanced calculus' or 'react hooks'..."
                        className="flex-1 bg-transparent border-none outline-none text-xl text-white py-4 placeholder:text-text-secondary/50"
                    />
                    <AnimatePresence>
                        {query && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => setQuery('')}
                                className="p-2 hover:bg-white/5 rounded-full text-text-secondary mr-2"
                            >
                                <X size={20} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => handleSearch(query)}
                        className="bg-primary hover:bg-primary-dark text-white p-4 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                        <ArrowRight size={24} />
                    </button>
                </div>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-12"
            >
                {/* Recent Searches */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-white font-bold text-lg">
                        <History size={20} className="text-text-secondary" />
                        <h2>Recent Searches</h2>
                    </div>
                    <div className="space-y-2">
                        {recentSearches.map((search, i) => (
                            <motion.button
                                key={i}
                                variants={item}
                                onClick={() => handleSearch(search)}
                                className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all text-left group"
                            >
                                <SearchIcon size={16} className="text-text-secondary group-hover:text-primary" />
                                <span className="text-text-secondary group-hover:text-white transition-colors">{search}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Popular Topics / Suggestions */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-white font-bold text-lg">
                        <Sparkles size={20} className="text-accent" />
                        <h2>Popular Topics</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {catsLoading ? (
                            <div className="w-full flex items-center gap-2 text-text-secondary text-sm">
                                <Loader2 className="animate-spin" size={16} /> Loading topics...
                            </div>
                        ) : (
                            categories?.slice(0, 8).map((cat: any) => (
                                <motion.button
                                    key={cat._id}
                                    variants={item}
                                    onClick={() => handleSearch(cat.name)}
                                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-text-secondary hover:text-primary hover:border-primary/30 transition-all font-medium"
                                >
                                    {cat.name}
                                </motion.button>
                            ))
                        )}
                    </div>

                    <div className="pt-8">
                        <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 relative overflow-hidden group">
                            <TrendingUp className="absolute right-[-10px] bottom-[-10px] size-24 text-primary/10 group-hover:text-primary/20 transition-colors" />
                            <h3 className="text-white font-bold mb-2">Feeling lucky?</h3>
                            <p className="text-text-secondary text-sm mb-4">Discover the most trending notes of the week automatically.</p>
                            <button
                                onClick={() => navigate('/browse?sort=trending')}
                                className="text-primary text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"
                            >
                                View Trending <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
