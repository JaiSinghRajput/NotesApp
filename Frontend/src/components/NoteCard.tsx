import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, Star, Clock, User, Tag } from 'lucide-react';
import { cn } from '../utils/cn';

interface NoteCardProps {
    note: {
        _id: string;
        title: string;
        description: string;
        course?: string;
        branch?: string;
        semester?: string;
        category: string;
        unit?: string;
        tags: string[];
        fileUrl: string;
        viewCount: number;
        downloadCount: number;
        uploadedBy: {
            name: string;
        };
        createdAt: string;
    };
    onView?: () => void;
    onDownload?: () => void;
}

export const NoteCard = ({ note, onView, onDownload }: NoteCardProps) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="glass-card overflow-hidden group border border-white/5 hover:border-primary/30"
        >
            <div className="h-40 bg-linear-to-br from-primary/10 via-surface to-accent/5 p-6 flex items-center justify-center relative overflow-hidden">
                <FileText size={64} className="text-primary/20 group-hover:text-primary/40 transition-colors group-hover:scale-110 duration-500" />
                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                        <span className="px-2 py-1 rounded-md bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                            {note.category}
                        </span>
                        {note.course && (
                            <span className="px-2 py-1 rounded-md bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                                {note.course}
                            </span>
                        )}
                    </div>

                {/* Animated accent line */}
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="p-5 space-y-4">
                <div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {note.title}
                    </h3>
                    <p className="text-sm text-text-secondary line-clamp-2 min-h-10">
                        {note.description || 'No description provided.'}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 text-[10px] text-text-secondary">
                    {note.branch && <span className="px-2 py-1 rounded-full bg-white/5 border border-white/5">{note.branch}</span>}
                    {note.semester && <span className="px-2 py-1 rounded-full bg-white/5 border border-white/5">Sem {note.semester}</span>}
                    {note.unit && <span className="px-2 py-1 rounded-full bg-white/5 border border-white/5">{note.unit}</span>}
                </div>

                <div className="flex flex-wrap gap-2">
                    {note.tags?.slice(0, 3).map((tag) => (
                        <span key={tag} className="flex items-center gap-1 text-[10px] text-text-secondary bg-white/5 px-2 py-1 rounded-full">
                            <Tag size={10} />
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-text-secondary">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <Eye size={14} className="text-primary" />
                            {note.viewCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                            <Download size={14} className="text-accent" />
                            {note.downloadCount || 0}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 italic">
                        <User size={12} />
                        {note.uploadedBy?.name}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                        onClick={onView}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all"
                    >
                        <Eye size={16} />
                        View
                    </button>
                    <button
                        onClick={onDownload}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-semibold transition-all border border-primary/20"
                    >
                        <Download size={16} />
                        PDF
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
