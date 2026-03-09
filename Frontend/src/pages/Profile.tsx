import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import {
    User as UserIcon,
    Mail,
    Lock,
    Shield,
    Trash2,
    Save,
    Loader2,
    ShieldAlert,
    KeyRound,
    AtSign
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
});

const passwordSchema = z.object({
    oldPassword: z.string().min(6, 'Password must be at least 6 characters'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export const Profile = () => {
    const { user, setAuth, clearAuth } = useAuthStore();
    const [loading, setLoading] = React.useState(false);
    const [passwordLoading, setPasswordLoading] = React.useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        formState: { errors: profileErrors },
    } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            username: user?.username || '',
            email: user?.email || '',
        }
    });

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        reset: resetPasswordForm,
        formState: { errors: passwordErrors },
    } = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
    });

    const onUpdateProfile = async (data: ProfileForm) => {
        setLoading(true);
        try {
            const response = await apiClient.put('/user/update-profile', data);
            setAuth(response.data.data);
            toast.success('Profile updated successfully!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const onResetPassword = async (data: PasswordForm) => {
        setPasswordLoading(true);
        try {
            await apiClient.put('/user/reset-password', {
                oldPassword: data.oldPassword,
                newPassword: data.newPassword
            });
            toast.success('Password changed successfully!');
            resetPasswordForm();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Password reset failed');
        } finally {
            setPasswordLoading(false);
        }
    };

    const onDeleteAccount = async () => {
        try {
            await apiClient.delete('/user/delete-account');
            toast.success('Account deleted successfuly');
            clearAuth();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Delete failed');
        }
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
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white">Your Profile</h1>
                <p className="text-text-secondary">Manage your settings and security.</p>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
                {/* Left Column: Avatar & Quick Info */}
                <motion.div variants={item} className="space-y-6">
                    <div className="glass-card p-8 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-4xl font-bold border-4 border-primary/30 mb-4">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">{user?.name}</h2>
                        <p className="text-text-secondary text-sm mb-4">@{user?.username}</p>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                            <Shield size={12} />
                            {user?.role}
                        </div>
                    </div>

                    <div className="glass-card p-6 space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest opacity-50">Quick Stats</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-secondary">Joined</span>
                                <span className="text-white font-medium">
                                    {(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString() : 'Long ago'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-secondary">Status</span>
                                <span className="text-green-400 font-medium">Active</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Forms */}
                <motion.div variants={item} className="md:col-span-2 space-y-8">
                    {/* General Settings */}
                    <div className="glass-card p-8 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-primary/20 text-primary">
                                <UserIcon size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-white">General Information</h3>
                        </div>

                        <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary ml-1">Full Name</label>
                                    <div className="relative group">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={18} />
                                        <input
                                            {...registerProfile('name')}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all"
                                        />
                                    </div>
                                    {profileErrors.name && <p className="text-xs text-red-400 ml-1">{profileErrors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary ml-1">Username</label>
                                    <div className="relative group">
                                        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={18} />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">@</span>
                                        <input
                                            {...registerProfile('username')}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all"
                                        />
                                    </div>
                                    {profileErrors.username && <p className="text-xs text-red-400 ml-1">{profileErrors.username.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        {...registerProfile('email')}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all"
                                    />
                                </div>
                                {profileErrors.email && <p className="text-xs text-red-400 ml-1">{profileErrors.email.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                Save Changes
                            </button>
                        </form>
                    </div>

                    {/* Security Settings */}
                    <div className="glass-card p-8 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-accent/20 text-accent">
                                <KeyRound size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-white">Security & Password</h3>
                        </div>

                        <form onSubmit={handlePasswordSubmit(onResetPassword)} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary ml-1">Old Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" size={18} />
                                    <input
                                        {...registerPassword('oldPassword')}
                                        type="password"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:bg-white/10 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                                {passwordErrors.oldPassword && <p className="text-xs text-red-400 ml-1">{passwordErrors.oldPassword.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary ml-1">New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" size={18} />
                                        <input
                                            {...registerPassword('newPassword')}
                                            type="password"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:bg-white/10 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {passwordErrors.newPassword && <p className="text-xs text-red-400 ml-1">{passwordErrors.newPassword.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary ml-1">Confirm Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" size={18} />
                                        <input
                                            {...registerPassword('confirmPassword')}
                                            type="password"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:bg-white/10 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {passwordErrors.confirmPassword && <p className="text-xs text-red-400 ml-1">{passwordErrors.confirmPassword.message}</p>}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={passwordLoading}
                                className="bg-accent hover:bg-accent/80 text-white rounded-xl px-8 py-3 flex items-center justify-center gap-2 transition-all shadow-lg shadow-accent/20 font-semibold"
                            >
                                {passwordLoading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                                Update Password
                            </button>
                        </form>
                    </div>

                    {/* Danger Zone */}
                    <div className="glass-card border-red-500/20 bg-red-500/5 p-8 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                                <ShieldAlert size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-white">Danger Zone</h3>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <p className="text-white font-semibold">Delete Account</p>
                                <p className="text-text-secondary text-sm">Once you delete your account, there is no going back. Please be certain.</p>
                            </div>

                            {!showDeleteConfirm ? (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white px-6 py-3 rounded-xl transition-all font-semibold flex items-center gap-2"
                                >
                                    <Trash2 size={18} />
                                    Delete Account
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={onDeleteAccount}
                                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl transition-all font-bold"
                                    >
                                        Yes, Delete
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl transition-all font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};
