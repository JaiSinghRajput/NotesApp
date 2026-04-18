import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Grid, List, Loader2, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { NoteCard } from '../components/NoteCard';
import apiClient from '../api/apiClient';
import { cn } from '../utils/cn';
import { academicCourses, getCourseBranches, semesterOptions } from '../constants/academicHierarchy';

export const Browse = () => {
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
    const [selectedCourse, setSelectedCourse] = useState(searchParams.get('course') || '');
    const [selectedBranch, setSelectedBranch] = useState(searchParams.get('branch') || '');
    const [selectedSemester, setSelectedSemester] = useState(searchParams.get('semester') || '');
    const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || searchParams.get('category') || '');
    const [selectedUnit, setSelectedUnit] = useState(searchParams.get('unit') || '');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const branchOptions = selectedCourse ? getCourseBranches(selectedCourse) : [];

    const { data: notes = [], isLoading } = useQuery<any[], Error>({
        queryKey: ['notes', searchQuery, selectedCourse, selectedBranch, selectedSemester, selectedSubject, selectedUnit],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set('limit', '1000');
            if (searchQuery) params.set('query', searchQuery);
            if (selectedCourse) params.set('course', selectedCourse);
            if (selectedBranch) params.set('branch', selectedBranch);
            if (selectedSemester) params.set('semester', selectedSemester);
            if (selectedSubject) params.set('subject', selectedSubject);
            if (selectedUnit) params.set('unit', selectedUnit);

            const res = await apiClient.get(`/notes?${params.toString()}`);
            return res.data?.data?.notes ?? [];
        },
    });

    const subjectOptions = useMemo(() => {
        const set = new Set<string>();
        notes.forEach((n: any) => { if (n.category) set.add(n.category); });
        return Array.from(set).sort();
    }, [notes]);

    const unitOptions = useMemo(() => {
        const set = new Set<string>();
        notes.forEach((n: any) => { if (n.unit) set.add(n.unit); });
        return Array.from(set).sort();
    }, [notes]);

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white">Browse Knowledge</h1>
                <p className="text-text-secondary">Discover best notes shared by our community members.</p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by title, description, or tags..."
                        className="w-full bg-surface border border-white/5 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/5 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                <div className="flex gap-3">
                    <div className="flex gap-2 items-center">
                        <div className="relative">
                            <label className="sr-only">Course</label>
                            <select
                                value={selectedCourse}
                                onChange={(e) => { setSelectedCourse(e.target.value); setSelectedBranch(''); }}
                                className="bg-surface border border-white/5 rounded-2xl pl-4 pr-4 py-3 appearance-none text-sm font-medium cursor-pointer"
                            >
                                <option value="">All Courses</option>
                                {academicCourses.map((c) => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <label className="sr-only">Branch</label>
                            <select
                                value={selectedBranch}
                                onChange={(e) => setSelectedBranch(e.target.value)}
                                className="bg-surface border border-white/5 rounded-2xl pl-4 pr-4 py-3 appearance-none text-sm font-medium cursor-pointer"
                            >
                                <option value="">All Branches</option>
                                {branchOptions.map((b) => (
                                    <option key={b.value} value={b.value}>{b.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <label className="sr-only">Semester</label>
                            <select
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                                className="bg-surface border border-white/5 rounded-2xl pl-4 pr-4 py-3 appearance-none text-sm font-medium cursor-pointer"
                            >
                                <option value="">All Semesters</option>
                                {semesterOptions.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <label className="sr-only">Subject</label>
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="bg-surface border border-white/5 rounded-2xl pl-4 pr-4 py-3 appearance-none text-sm font-medium cursor-pointer"
                            >
                                <option value="">All Subjects</option>
                                {subjectOptions.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <label className="sr-only">Unit</label>
                            <select
                                value={selectedUnit}
                                onChange={(e) => setSelectedUnit(e.target.value)}
                                className="bg-surface border border-white/5 rounded-2xl pl-4 pr-4 py-3 appearance-none text-sm font-medium cursor-pointer"
                            >
                                <option value="">All Units</option>
                                {unitOptions.map((u) => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex bg-surface border border-white/5 rounded-2xl p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "p-3 rounded-xl transition-all",
                                viewMode === 'grid' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-secondary hover:text-white"
                            )}
                        >
                            <Grid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-3 rounded-xl transition-all",
                                viewMode === 'list' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-secondary hover:text-white"
                            )}
                        >
                            <List size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Results */}
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-64 flex flex-col items-center justify-center gap-4"
                    >
                        <Loader2 className="animate-spin text-primary" size={40} />
                        <p className="text-text-secondary animate-pulse">Loading amazing notes...</p>
                    </motion.div>
                ) : notes?.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "grid gap-6",
                            viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                        )}
                    >
                        {notes.map((note: any) => (
                            <NoteCard key={note._id} note={note} />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card py-20 flex flex-col items-center justify-center text-center space-y-4"
                    >
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-text-secondary mb-2">
                            <Search size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-white">No notes found</h3>
                        <p className="text-text-secondary max-w-xs">
                            We couldn't find any notes matching your search or filters. Try checking different keywords.
                        </p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedCourse(''); setSelectedBranch(''); setSelectedSemester(''); setSelectedSubject(''); setSelectedUnit(''); }}
                            className="btn-primary px-6"
                        >
                            Clear All Filters
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
