import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Shield, UserMinus, Trash2, Loader2, Mail, Search } from 'lucide-react';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

export const UserManagement = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');

    const { data: users, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await apiClient.get('/user/all-users');
            return res.data.data;
        }
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ email, action }: { email: string, action: 'make-admin' | 'demote-admin' }) => {
            const endpoint = action === 'make-admin' ? '/user/make-admin' : '/user/demote-admin';
            return apiClient.post(endpoint, { email });
        },
        onSuccess: (res: any) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success(res.data.message || 'User role updated');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    });

    const filteredUsers = users?.filter((u: any) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={48} />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Users className="text-primary" /> User Management
                    </h1>
                    <p className="text-text-secondary">Manage user roles and platform accessibility.</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">User</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Role</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary">Joined</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers?.map((user: any) => (
                                <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                                                user.role === 'super-admin' ? "bg-accent/20 text-accent" :
                                                    user.role === 'admin' ? "bg-primary/20 text-primary" : "bg-white/10 text-text-secondary"
                                            )}>
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">{user.name}</p>
                                                <p className="text-xs text-text-secondary flex items-center gap-1">
                                                    <Mail size={12} /> {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                            user.role === 'super-admin' ? "bg-accent/20 text-accent" :
                                                user.role === 'admin' ? "bg-primary/20 text-primary" : "bg-white/10 text-text-secondary"
                                        )}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-secondary">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {user.role !== 'super-admin' && (
                                            <div className="flex items-center justify-end gap-2">
                                                {user.role === 'user' ? (
                                                    <button
                                                        onClick={() => updateRoleMutation.mutate({ email: user.email, action: 'make-admin' })}
                                                        className="p-2 hover:bg-primary/10 rounded-lg text-text-secondary hover:text-primary transition-all flex items-center gap-2 text-xs font-medium"
                                                        title="Promote to Admin"
                                                    >
                                                        <Shield size={18} /> <span className="hidden sm:inline">Make Admin</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => updateRoleMutation.mutate({ email: user.email, action: 'demote-admin' })}
                                                        className="p-2 hover:bg-yellow-500/10 rounded-lg text-text-secondary hover:text-yellow-400 transition-all flex items-center gap-2 text-xs font-medium"
                                                        title="Demote to User"
                                                    >
                                                        <UserMinus size={18} /> <span className="hidden sm:inline">Demote</span>
                                                    </button>
                                                )}
                                                <button className="p-2 hover:bg-red-500/10 rounded-lg text-text-secondary hover:text-red-400 transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
