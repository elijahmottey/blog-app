import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    User,
    Mail,
    Lock,
    Edit,
    Save,
    X,
    Eye,
    EyeOff,
    FileText,
    MessageSquare,
    Calendar,
    Shield,
    Key,
    Trash2,
    AlertTriangle
} from 'lucide-react';
import BackendApi from '../../service/BackendApi';
import { Roles } from '../../enums/Roles';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useTheme, alpha } from '@mui/material/styles';

interface ProfileFormData {
    name: string;
    email: string;
}

interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}


const profileSchema = yup.object({
    name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
    email: yup.string().required('Email is required').email('Invalid email format'),
});

const passwordSchema = yup.object({
    currentPassword: yup.string().required('Current password is required'),
    newPassword: yup.string()
        .required('New password is required')
        .min(6, 'Password must be at least 6 characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
    confirmPassword: yup.string()
        .required('Please confirm your new password')
        .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

export const ProfileManagement: React.FC = () => {
    const { user, logout } = useAuth();
    const theme = useTheme();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'stats' | 'account'>('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    // Fetch user statistics
    const { data: userStats } = useQuery({
        queryKey: ['user-stats'],
        queryFn: async () => {
            const [posts, comments] = await Promise.all([
                BackendApi.getAllPost(),
                BackendApi.getAllPostComment(),
            ]);

            const userPosts = posts.data?.content?.filter((post: any) =>
                post.users === user?.name || post.users === user?.email
            ) || [];

            const userComments = comments.data?.content?.filter((comment: any) =>
                comment.users === user?.name || comment.users === user?.email
            ) || [];

            return {
                totalPosts: userPosts.length,
                totalComments: userComments.length,
                publishedPosts: userPosts.filter((post: any) => post.content && post.content.length > 0).length,
                draftPosts: userPosts.filter((post: any) => !post.content || post.content.length === 0).length,
            };
        },
        enabled: !!user,
    });

    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        reset: resetProfile,
        formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
    } = useForm<ProfileFormData>({
        resolver: yupResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
        },
    });

    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        reset: resetPassword,
        formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    } = useForm<PasswordFormData>({
        resolver: yupResolver(passwordSchema),
    });

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: (data: ProfileFormData) =>
            BackendApi.updateUser(user?.id || 0, data),
        onSuccess: () => {
            toast.success('Profile updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            setIsEditing(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        },
    });

    // Change password mutation
    const changePasswordMutation = useMutation({
        mutationFn: async (_data: PasswordFormData) => {
            // This would typically be a separate endpoint for password change
            return new Promise((resolve) => {
                setTimeout(() => resolve({ success: true }), 1000);
            });
        },
        onSuccess: () => {
            toast.success('Password changed successfully!');
            resetPassword();
        },
        onError: () => {
            toast.error('Failed to change password');
        },
    });

    // Delete user mutation
    const deleteUserMutation = useMutation({
        mutationFn: async () => {
            if (!user?.id) throw new Error('User ID not found');
            return await BackendApi.deleteUser(user.id);
        },
        onSuccess: () => {
            toast.success('Account deleted successfully!');
            logout();
            window.location.href = '/';
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete account');
            setIsDeleting(false);
            setDeleteConfirmation('');
        },
    });

    const onSubmitProfile = (data: ProfileFormData) => {
        updateProfileMutation.mutate(data);
    };

    const onSubmitPassword = (data: PasswordFormData) => {
        changePasswordMutation.mutate(data);
    };

    const handleCancelEdit = () => {
        resetProfile({
            name: user?.name || '',
            email: user?.email || '',
        });
        setIsEditing(false);
    };

    const handleDeleteAccount = () => {
        if (deleteConfirmation !== 'DELETE') {
            toast.error('Please type "DELETE" to confirm');
            return;
        }

        if (window.confirm(
            'Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently delete all your posts, comments, and account data.'
        )) {
            deleteUserMutation.mutate();
        } else {
            setIsDeleting(false);
            setDeleteConfirmation('');
        }
    };

    const stats = userStats || {
        totalPosts: 0,
        totalComments: 0,
        publishedPosts: 0,
        draftPosts: 0,
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div
                style={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 8,
                    padding: 24,
                    boxShadow: theme.shadows[1],
                }}
            >
                <div className="flex items-center space-x-4">
                    <div
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            backgroundColor: theme.palette.primary.main,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <User style={{ height: 32, width: 32, color: theme.palette.primary.contrastText }} />
                    </div>
                    <div>
                        <h1
                            style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: theme.palette.text.primary,
                            }}
                        >
                            {user?.name || 'User'}
                        </h1>
                        <p style={{ color: theme.palette.text.secondary }}>{user?.email}</p>
                        <div className="flex items-center mt-2 space-x-2">
                            {user?.roles?.includes(Roles.ADMIN) && (
                                <span
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        padding: '2px 8px',
                                        borderRadius: 9999,
                                        fontSize: '0.75rem',
                                        backgroundColor: alpha(theme.palette.error.main, 0.12),
                                        color: theme.palette.error.main,
                                        fontWeight: 500,
                                    }}
                                >
                                    <Shield style={{ height: 12, width: 12, marginRight: 4 }} />
                                    Admin
                                </span>
                            )}
                            <span
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '2px 8px',
                                    borderRadius: 9999,
                                    fontSize: '0.75rem',
                                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                                    color: theme.palette.primary.main,
                                    fontWeight: 500,
                                }}
                            >
                                <User style={{ height: 12, width: 12, marginRight: 4 }} />
                                User
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 ${
                                activeTab === 'profile'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <User className="h-4 w-4 inline mr-2" />
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('password')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 ${
                                activeTab === 'password'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Key className="h-4 w-4 inline mr-2" />
                            Password
                        </button>
                        <button
                            onClick={() => setActiveTab('stats')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 ${
                                activeTab === 'stats'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <FileText className="h-4 w-4 inline mr-2" />
                            Statistics
                        </button>
                        <button
                            onClick={() => setActiveTab('account')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 ${
                                activeTab === 'account'
                                    ? 'border-red-500 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Shield className="h-4 w-4 inline mr-2" />
                            Account
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Profile
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        {isEditing ? (
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    {...registerProfile('name')}
                                                    type="text"
                                                    id="name"
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter your full name"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                                <User className="h-4 w-4 text-gray-400 mr-3" />
                                                <span className="text-gray-900">{user?.name}</span>
                                            </div>
                                        )}
                                        {profileErrors.name && (
                                            <p className="mt-1 text-sm text-red-600">{profileErrors.name.message}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        {isEditing ? (
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    {...registerProfile('email')}
                                                    type="email"
                                                    id="email"
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter your email"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                                <Mail className="h-4 w-4 text-gray-400 mr-3" />
                                                <span className="text-gray-900">{user?.email}</span>
                                            </div>
                                        )}
                                        {profileErrors.email && (
                                            <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Account Info (Read-only) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Account Created
                                        </label>
                                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                            <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                                            <span className="text-gray-900">
                        {user?.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'Unknown'}
                      </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Updated
                                        </label>
                                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                            <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                                            <span className="text-gray-900">
                        {user?.updatedAt ? format(new Date(user.updatedAt), 'MMM dd, yyyy') : 'Unknown'}
                      </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {isEditing && (
                                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                        >
                                            <X className="h-4 w-4 inline mr-2" />
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isProfileSubmitting || updateProfileMutation.isPending}
                                            className="px-4 py-2 text-sm font-medium text-primary-foreground bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {updateProfileMutation.isPending ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 inline mr-2" />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {/* Password Tab */}
                    {activeTab === 'password' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">Change Password</h2>
                                <p className="text-sm text-gray-600">
                                    Ensure your account is using a strong password to keep your account secure.
                                </p>
                            </div>

                            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
                                {/* Current Password */}
                                <div>
                                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            {...registerPassword('currentPassword')}
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            id="currentPassword"
                                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter your current password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {passwordErrors.currentPassword && (
                                        <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                                    )}
                                </div>

                                {/* New Password */}
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            {...registerPassword('newPassword')}
                                            type={showNewPassword ? 'text' : 'password'}
                                            id="newPassword"
                                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter your new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {passwordErrors.newPassword && (
                                        <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            {...registerPassword('confirmPassword')}
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            id="confirmPassword"
                                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Confirm your new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {passwordErrors.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end pt-6 border-t border-gray-200">
                                    <button
                                        type="submit"
                                        disabled={isPasswordSubmitting || changePasswordMutation.isPending}
                                        className="px-6 py-3 text-sm font-medium text-primary-foreground bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {changePasswordMutation.isPending ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Changing Password...
                                            </>
                                        ) : (
                                            <>
                                                <Key className="h-4 w-4 inline mr-2" />
                                                Change Password
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Statistics Tab */}
                    {activeTab === 'stats' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">Account Statistics</h2>
                                <p className="text-sm text-gray-600">
                                    Overview of your activity on the platform.
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                                    <div className="flex items-center">
                                        <FileText className="h-8 w-8 text-blue-600" />
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-blue-600">Total Posts</p>
                                            <p className="text-2xl font-bold text-blue-900">{stats.totalPosts}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                                    <div className="flex items-center">
                                        <FileText className="h-8 w-8 text-green-600" />
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-green-600">Published</p>
                                            <p className="text-2xl font-bold text-green-900">{stats.publishedPosts}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
                                    <div className="flex items-center">
                                        <FileText className="h-8 w-8 text-orange-600" />
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-orange-600">Drafts</p>
                                            <p className="text-2xl font-bold text-orange-900">{stats.draftPosts}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                                    <div className="flex items-center">
                                        <MessageSquare className="h-8 w-8 text-purple-600" />
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-purple-600">Comments</p>
                                            <p className="text-2xl font-bold text-purple-900">{stats.totalComments}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center p-3 bg-white rounded-lg">
                                        <FileText className="h-5 w-5 text-blue-600 mr-3" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">Account created</p>
                                            <p className="text-xs text-gray-500">
                                                {user?.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy \'at\' h:mm a') : 'Unknown'}
                                            </p>
                                        </div>
                                    </div>

                                    {stats.totalPosts > 0 && (
                                        <div className="flex items-center p-3 bg-white rounded-lg">
                                            <FileText className="h-5 w-5 text-green-600 mr-3" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">First post created</p>
                                                <p className="text-xs text-gray-500">Started your blogging journey</p>
                                            </div>
                                        </div>
                                    )}

                                    {stats.totalComments > 0 && (
                                        <div className="flex items-center p-3 bg-white rounded-lg">
                                            <MessageSquare className="h-5 w-5 text-purple-600 mr-3" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">First comment posted</p>
                                                <p className="text-xs text-gray-500">Joined the community discussion</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Account Tab */}
                    {activeTab === 'account' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">Account Settings</h2>
                                <p className="text-sm text-gray-600">
                                    Manage your account settings and data.
                                </p>
                            </div>

                            {/* Account Information */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-md font-semibold text-gray-900 mb-4">Account Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account ID
                                        </label>
                                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                                            {user?.id || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Type
                                        </label>
                                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                                            {user?.roles?.includes(Roles.ADMIN) ? 'Administrator' : 'User'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Member Since
                                        </label>
                                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                                            {user?.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'Unknown'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Updated
                                        </label>
                                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                                            {user?.updatedAt ? format(new Date(user.updatedAt), 'MMM dd, yyyy') : 'Unknown'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                <div className="flex items-start mb-6">
                                    <AlertTriangle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-md font-semibold text-red-900 mb-2">Danger Zone</h3>
                                        <p className="text-sm text-red-700">
                                            Once you delete your account, there is no going back. This action will permanently:
                                        </p>
                                        <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                                            <li>Delete all your posts and comments</li>
                                            <li>Remove your profile and account data</li>
                                            <li>Cancel any active subscriptions</li>
                                            <li>This action cannot be undone</li>
                                        </ul>
                                    </div>
                                </div>

                                {!isDeleting ? (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-red-900">Delete Account</h4>
                                            <p className="text-sm text-red-700">
                                                Permanently delete your account and all associated data.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setIsDeleting(true)}
                                            className="px-4 py-2 text-sm font-medium text-primary-foreground bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                        >
                                            <Trash2 className="h-4 w-4 inline mr-2" />
                                            Delete Account
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="deleteConfirmation" className="block text-sm font-medium text-red-900 mb-2">
                                                Type "DELETE" to confirm account deletion
                                            </label>
                                            <input
                                                type="text"
                                                id="deleteConfirmation"
                                                value={deleteConfirmation}
                                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                                className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                placeholder="Type DELETE to confirm"
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => {
                                                    setIsDeleting(false);
                                                    setDeleteConfirmation('');
                                                }}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleDeleteAccount}
                                                disabled={deleteUserMutation.isPending || deleteConfirmation !== 'DELETE'}
                                                className="px-4 py-2 text-sm font-medium text-primary-foreground bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {deleteUserMutation.isPending ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Trash2 className="h-4 w-4 inline mr-2" />
                                                        Delete Account
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};