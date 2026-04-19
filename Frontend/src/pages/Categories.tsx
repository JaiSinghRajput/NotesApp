import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Book,
    Code,
    Cpu,
    Globe,
    Atom,
    Binary,
    Calculator,
    Palette,
    Music,
    FlaskConical,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { cn } from '../utils/cn';

const iconMap: Record<string, any> = {
    'programming': Code,
    'technology': Cpu,
    'science': FlaskConical,
    'math': Calculator,
    'design': Palette,
    'music': Music,
    'global': Globe,
    'physics': Atom,
    'data': Binary,
    'default': Book
};

const colorMap: Record<string, string> = {
    'programming': 'from-blue-500/20 to-cyan-500/20 text-blue-400',
    'technology': 'from-purple-500/20 to-pink-500/20 text-purple-400',
    'science': 'from-green-500/20 to-emerald-500/20 text-green-400',
    'math': 'from-orange-500/20 to-yellow-500/20 text-orange-400',
    'design': 'from-pink-500/20 to-rose-500/20 text-pink-400',
    'music': 'from-indigo-500/20 to-purple-500/20 text-indigo-400',
    'default': 'from-primary/20 to-primary/10 text-primary'
};

export const Categories = () => {
    const navigate = useNavigate();

    const { data: categories, isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await apiClient.get('/categories');
            return res.data.data;
        }
    });

    const getIcon = (name: string) => {
        const lower = name.toLowerCase();
        for (const key in iconMap) {
            if (lower.includes(key)) return iconMap[key];
        }
        return iconMap.default;
    };

    const getColor = (name: string) => {
        const lower = name.toLowerCase();
        for (const key in colorMap) {
            if (lower.includes(key)) return colorMap[key];
        }
        return colorMap.default;
    };

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
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        show: { opacity: 1, scale: 1, y: 0 }
    };

    if (isLoading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-text-secondary animate-pulse">Fetching categories...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white">Explore Subjects</h1>
                <p className="text-text-secondary">Browse through academic subjects and jump straight into the matching notes.</p>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                {categories?.map((cat: any) => {
                    const Icon = getIcon(cat.name);
                    const colors = getColor(cat.name);

                    return (
                        <motion.button
                            key={cat._id}
                            variants={item}
                            whileHover={{ y: -8, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(`/browse?subject=${encodeURIComponent(cat.name)}`)}
                            className="group relative flex flex-col items-start p-8 rounded-3xl overflow-hidden glass border border-white/5 hover:border-primary/30 transition-all text-left"
                        >
                            {/* Gradient Background */}
                            <div className={cn("absolute inset-0 bg-linear-to-br opacity-50 group-hover:opacity-100 transition-opacity", colors.split(' ').slice(0, 2).join(' '))} />

                            {/* Icon Wrapper */}
                            <div className={cn("relative z-10 p-4 rounded-2xl bg-white/5 mb-6 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300", colors.split(' ').pop())}>
                                <Icon size={32} />
                            </div>

                            <div className="relative z-10 w-full">
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{cat.name}</h3>
                                <div className="flex items-center justify-between text-text-secondary text-sm">
                                    <span>Explore Notes</span>
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>

                            {/* Decorative element */}
                            <div className="absolute top-[-10%] right-[-10%] w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
                        </motion.button>
                    );
                })}

                {(!categories || categories.length === 0) && (
                    <div className="col-span-full py-20 text-center glass rounded-3xl border border-white/5">
                        <p className="text-text-secondary">No categories found yet. Start by uploading some notes!</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};
