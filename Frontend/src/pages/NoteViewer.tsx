import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download,
    Eye,
    MessageSquare,
    Star,
    Bookmark,
    Share2,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Calendar,
    User,
    Tag as TagIcon,
    Info
} from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

// Set up pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const NoteViewer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);

    const { data: note, isLoading } = useQuery({
        queryKey: ['note', id],
        queryFn: async () => {
            const res = await apiClient.get(`/notes/${id}`);
            return res.data.data;
        },
    });

    const { data: comments } = useQuery({
        queryKey: ['comments', id],
        queryFn: async () => {
            const res = await apiClient.get(`/notes/comments/${id}`);
            return res.data.data;
        },
    });

    const bookmarkMutation = useMutation({
        mutationFn: () => apiClient.post(`/notes/bookmark/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['note', id] });
            toast.success('Bookmark updated');
        },
    });

    const downloadMutation = useMutation({
        mutationFn: () => apiClient.patch(`/notes/download/${id}`),
        onSuccess: () => {
            window.open(note.fileUrl, '_blank');
        }
    });

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    if (isLoading) return (
        <div className="h-[80vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={48} />
        </div>
    );

    if (!note) return <div>Note not found</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-6 glass-card p-6">
                <div className="space-y-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm font-medium mb-2"
                    >
                        <ChevronLeft size={16} /> Back to Browse
                    </button>
                    <h1 className="text-3xl font-bold text-white">{note.title}</h1>
                    <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                        <span className="flex items-center gap-1.5"><User size={16} className="text-primary" /> {note.uploadedBy?.name}</span>
                        <span className="flex items-center gap-1.5"><Calendar size={16} className="text-accent" /> {new Date(note.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><TagIcon size={16} className="text-blue-400" /> {note.category}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 self-start">
                    <button
                        onClick={() => bookmarkMutation.mutate()}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10"
                    >
                        <Bookmark size={20} />
                    </button>
                    <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10">
                        <Share2 size={20} />
                    </button>
                    <button
                        onClick={() => downloadMutation.mutate()}
                        className="btn-primary flex items-center gap-2 px-6 h-[48px]"
                    >
                        <Download size={20} /> Download PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* PDF Viewer */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="glass-card overflow-hidden bg-surface-brighter min-h-[600px] flex flex-col relative">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center bg-white/5 rounded-lg overflow-hidden border border-white/10">
                                    <button
                                        disabled={pageNumber <= 1}
                                        onClick={() => setPageNumber(p => p - 1)}
                                        className="p-2 hover:bg-white/10 disabled:opacity-30"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span className="px-4 text-sm font-medium border-x border-white/10">
                                        Page {pageNumber} of {numPages || '...'}
                                    </span>
                                    <button
                                        disabled={pageNumber >= (numPages || 0)}
                                        onClick={() => setPageNumber(p => p + 1)}
                                        className="p-2 hover:bg-white/10 disabled:opacity-30"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-2 hover:bg-white/10 rounded-lg">-</button>
                                <span className="text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
                                <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="p-2 hover:bg-white/10 rounded-lg">+</button>
                                <button className="p-2 hover:bg-white/10 rounded-lg ml-2"><Maximize2 size={18} /></button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-8 flex justify-center bg-[#1a1a1a]">
                            <Document
                                file={note.fileUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={<Loader2 className="animate-spin text-primary m-10" size={32} />}
                            >
                                <Page
                                    pageNumber={pageNumber}
                                    scale={scale}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    className="shadow-2xl"
                                />
                            </Document>
                        </div>
                    </div>

                    <div className="glass-card p-8 space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Info size={20} className="text-primary" /> Description
                        </h2>
                        <p className="text-text-secondary leading-relaxed">
                            {note.description}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-4">
                            {note.tags?.map((tag: string) => (
                                <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-xs text-text-secondary border border-white/10">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Details & Comments */}
                <div className="space-y-6">
                    <div className="glass-card p-6 space-y-6">
                        <h3 className="font-bold text-lg mb-4">Stats</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-text-secondary text-sm flex items-center gap-2"><Eye size={16} /> Total Views</span>
                                <span className="font-bold">{note.viewCount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-text-secondary text-sm flex items-center gap-2"><Download size={16} /> Downloads</span>
                                <span className="font-bold">{note.downloadCount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-text-secondary text-sm flex items-center gap-2"><Star size={16} /> Avg Rating</span>
                                <span className="font-bold">4.8 / 5</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg">Comments</h3>
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{comments?.length || 0}</span>
                        </div>

                        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {comments?.map((comment: any) => (
                                <div key={comment._id} className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                            {comment.user?.name?.charAt(0)}
                                        </div>
                                        <span className="text-sm font-semibold text-white">{comment.user?.name}</span>
                                        <span className="text-[10px] text-text-secondary">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-text-secondary pl-8">{comment.content}</p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <div className="relative">
                                <textarea
                                    placeholder="Add a comment..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                    rows={3}
                                />
                                <button className="absolute bottom-3 right-3 p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                                    <MessageSquare size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
