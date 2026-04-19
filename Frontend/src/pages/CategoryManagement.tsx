import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Layers,
    Plus,
    Trash2,
    Edit2,
    Loader2,
    Tag
} from 'lucide-react';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export const CategoryManagement = () => {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    const { data: categories, isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await apiClient.get('/categories');
            return res.data.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => apiClient.post('/categories', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Category created');
            setIsAdding(false);
            setFormData({ name: '', description: '' });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create')
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiClient.delete(`/categories/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Category deleted');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => apiClient.patch(`/categories/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Category updated');
            setEditingId(null);
        }
    });

    if (isLoading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={48} />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Layers className="text-primary" /> Subject Management
                    </h1>
                    <p className="text-text-secondary">Define and organize the subjects available on the platform.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} /> Create New
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {(isAdding || editingId) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass-card p-6 border-primary/30 space-y-4"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-white">{editingId ? 'Edit' : 'New'} Subject Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    placeholder="e.g. Data Structures"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-white">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field min-h-25"
                                    placeholder="Brief overview of this subject..."
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        if (editingId) {
                                            updateMutation.mutate({ id: editingId, data: formData });
                                        } else {
                                            createMutation.mutate(formData);
                                        }
                                    }}
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="flex-1 bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary-dark transition-all disabled:opacity-50"
                                >
                                    {(createMutation.isPending || updateMutation.isPending) ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Save Subject'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsAdding(false);
                                        setEditingId(null);
                                        setFormData({ name: '', description: '' });
                                    }}
                                    className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all font-bold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {categories?.map((category: any) => (
                    <motion.div
                        layout
                        key={category._id}
                        className="glass-card p-6 group space-y-4"
                    >
                        <div className="flex justify-between items-start">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                <Tag size={20} />
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => {
                                        setEditingId(category._id);
                                        setFormData({ name: category.name, description: category.description || '' });
                                        setIsAdding(false);
                                    }}
                                    className="p-2 hover:bg-white/5 rounded-lg text-text-secondary hover:text-white"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => deleteMutation.mutate(category._id)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg text-text-secondary hover:text-red-400"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                            <p className="text-sm text-text-secondary line-clamp-2">{category.description || 'No description provided.'}</p>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded w-fit">
                            SLUG: {category.slug}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
