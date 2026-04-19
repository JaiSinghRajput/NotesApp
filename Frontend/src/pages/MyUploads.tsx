import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Trash2, Eye, Download, Loader2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';

export const MyUploads = () => {
    const queryClient = useQueryClient();

    const { data: notes, isLoading } = useQuery({
        queryKey: ['my-notes'],
        queryFn: async () => {
            const res = await apiClient.get('/notes/user-notes'); // I'll check/add this endpoint
            return res.data.data;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiClient.delete(`/notes/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-notes'] });
            toast.success('Note deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete note');
        }
    });

    if (isLoading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={48} />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Uploads</h1>
                    <p className="text-text-secondary">Manage and track your shared notes.</p>
                </div>
                <Link to="/admin/upload" className="btn-primary flex items-center gap-2">
                    <Plus size={20} /> Upload New
                </Link>
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/5">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Note</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Academic Path</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Stats</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Date</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {notes?.length > 0 ? (
                            notes.map((note: any) => (
                                <tr key={note._id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white group-hover:text-primary transition-colors">{note.title}</p>
                                                <p className="text-xs text-text-secondary">{(note.description || '').substring(0, 40)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1 text-xs text-text-secondary">
                                            <p className="px-2 py-1 rounded-md bg-white/5 text-[11px] uppercase w-fit">{note.course}</p>
                                            <p>{note.branch} · Sem {note.semester}</p>
                                            <p className="text-white font-semibold">{note.category}</p>
                                            <p>{note.unit}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4 text-xs text-text-secondary">
                                            <span className="flex items-center gap-1"><Eye size={14} /> {note.viewCount}</span>
                                            <span className="flex items-center gap-1"><Download size={14} /> {note.downloadCount}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-secondary">
                                        {new Date(note.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link to={`/note/${note._id}`} className="p-2 hover:bg-white/10 rounded-lg text-text-secondary hover:text-white transition-all">
                                                <Eye size={18} />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this note?')) {
                                                        deleteMutation.mutate(note._id);
                                                    }
                                                }}
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-text-secondary hover:text-red-400 transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-text-secondary">
                                    You haven't uploaded any notes yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
