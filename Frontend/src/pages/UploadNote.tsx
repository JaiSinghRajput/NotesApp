import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useQuery } from '@tanstack/react-query';
import {
    Upload,
    X,
    CheckCircle2,
    Loader2,
    Tag as TagIcon,
    Info
} from 'lucide-react';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

const uploadSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    category: z.string().min(1, 'Category is required'),
    tags: z.string().optional(),
});

type UploadForm = z.infer<typeof uploadSchema>;

export const UploadNote = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const { data: categories, isLoading: catsLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await apiClient.get('/categories');
            return res.data.data;
        }
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<UploadForm>({
        resolver: zodResolver(uploadSchema),
    });

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
        } else {
            toast.error('Please upload a valid PDF file');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false,
    });

    const onSubmit = async (data: UploadForm) => {
        if (!file) {
            toast.error('Please select a PDF file');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('category', data.category);
        if (data.tags) formData.append('tags', data.tags);
        formData.append('pdfFile', file);

        try {
            await apiClient.post('/notes/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 0));
                    setProgress(percentCompleted);
                },
            });
            toast.success('Note uploaded successfully!');
            reset();
            setFile(null);
            setProgress(0);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white">Upload New Note</h1>
                <p className="text-text-secondary">Share your knowledge with the community. Upload high-quality PDF notes.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <form id="upload-form" onSubmit={handleSubmit(onSubmit)} className="glass-card p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Note Title</label>
                                <input
                                    {...register('title')}
                                    className="input-field"
                                    placeholder="e.g. Advanced Quantum Physics - Week 4"
                                />
                                {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Description</label>
                                <textarea
                                    {...register('description')}
                                    rows={4}
                                    className="input-field resize-none"
                                    placeholder="Provide a brief overview of what this note covers..."
                                />
                                {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary">Category</label>
                                    <select {...register('category')} className="input-field appearance-none">
                                        <option value="">Select Category</option>
                                        {catsLoading ? (
                                            <option disabled>Loading...</option>
                                        ) : (
                                            categories?.map((cat: any) => (
                                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                                            ))
                                        )}
                                    </select>
                                    {errors.category && <p className="text-xs text-red-400">{errors.category.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary">Tags (optional)</label>
                                    <input
                                        {...register('tags')}
                                        className="input-field"
                                        placeholder="tag1, tag2, tag3"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>

                    <div {...getRootProps()} className={cn(
                        "glass-card p-12 border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center group",
                        isDragActive ? "border-primary bg-primary/5" : "border-white/10 hover:border-primary/50",
                        file && "border-accent/50 bg-accent/5"
                    )}>
                        <input {...getInputProps()} />
                        <AnimatePresence mode="wait">
                            {file ? (
                                <motion.div
                                    key="file-selected"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-4"
                                >
                                    <div className="w-20 h-20 bg-accent/20 rounded-2xl flex items-center justify-center text-accent mx-auto">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-lg">{file.name}</p>
                                        <p className="text-text-secondary text-sm">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                        className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1 mx-auto"
                                    >
                                        <X size={16} /> Remove File
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="no-file"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-4"
                                >
                                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto group-hover:scale-110 transition-transform">
                                        <Upload size={40} />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-lg">
                                            {isDragActive ? "Drop the PDF here" : "Click or drag PDF to upload"}
                                        </p>
                                        <p className="text-text-secondary text-sm">Max file size: 50MB</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        type="submit"
                        form="upload-form"
                        disabled={uploading || !file}
                        className="w-full btn-primary py-4 text-lg font-semibold flex items-center justify-center gap-3"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="animate-spin" size={24} />
                                Uploading... {progress}%
                            </>
                        ) : (
                            <>
                                <Upload size={24} />
                                Publish Note
                            </>
                        )}
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-6 space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <Info size={20} />
                            <h3 className="font-bold">Guidelines</h3>
                        </div>
                        <ul className="space-y-3 text-sm text-text-secondary">
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                Ensure the PDF is clear and readable.
                            </li>
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                Provide a descriptive title for better searching.
                            </li>
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                Select the most relevant category.
                            </li>
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                Do not upload copyrighted or prohibited material.
                            </li>
                        </ul>
                    </div>

                    <div className="glass-card p-6 bg-primary/5 border-primary/20">
                        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                            <TagIcon size={18} className="text-primary" />
                            Pro Tip
                        </h3>
                        <p className="text-sm text-text-secondary italic">
                            "Notes with good descriptions and tags get 5x more views and downloads!"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
