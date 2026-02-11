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
    AlertTriangle,
    Type
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
    description: string;
}

interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const profileSchema = yup.object({
    name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
    email: yup.string().required('Email is required').email('Invalid email format'),
    description: yup.string().max(500, 'Description must be less than 500 characters'),
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
        resolver: yupResolver(profileSchema) as any,
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            description: user?.description || '',
        },
    });

    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        reset: resetPassword,
        formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    } = useForm<PasswordFormData>({
        resolver: yupResolver(passwordSchema) as any,
    });

    const updateProfileMutation = useMutation({
        mutationFn: (data: ProfileFormData) =>
            BackendApi.updateUser(user?.id || 0, data),
        onSuccess: () => {
            toast.success('Profile updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            queryClient.invalidateQueries({ queryKey: ['auth-user'] });
            setIsEditing(false);
            // Force page reload to refresh auth context
            window.location.reload();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        },
    });

    const changePasswordMutation = useMutation({
        mutationFn: async (_data: PasswordFormData) => {
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
            description: user?.description || '',
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
        <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.5rem', gap: '0.5rem' }}>
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
            </div>

            {/* Navigation Tabs */}
            <div style={{ backgroundColor: theme.palette.background.paper, borderRadius: 12, border: `1px solid ${theme.palette.divider}`, boxShadow: theme.shadows[1] }}>
                <div style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {['profile', 'password', 'stats', 'account'].map((tab) => {
                            const active = activeTab === tab;
                            const labelMap: any = { profile: 'Profile', password: 'Password', stats: 'Statistics', account: 'Account' };
                            const IconMap: any = { profile: User, password: Key, stats: FileText, account: Shield };
                            const Icon = IconMap[tab];
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    style={{
                                        padding: '12px 16px',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        borderTop: 'none',
                                        borderLeft: 'none',
                                        borderRight: 'none',
                                        borderBottom: `2px solid ${active ? theme.palette.primary.main : 'transparent'}`,
                                        color: active ? theme.palette.primary.main : theme.palette.text.secondary,
                                        background: 'transparent',
                                        minWidth: '100px',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Icon style={{ width: 14, height: 14, marginRight: 8, color: active ? theme.palette.primary.main : theme.palette.text.secondary }} />
                                    {labelMap[tab]}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div style={{ padding: 24 }}>
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: theme.palette.text.primary }}>
                                    Profile Information
                                </h2>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            padding: '8px 16px',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            color: theme.palette.primary.main,
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            borderRadius: 8,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <Edit style={{ height: 16, width: 16, marginRight: 8 }} />
                                        Edit Profile
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSubmitProfile(onSubmitProfile)} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 24, [theme.breakpoints.up('md')]: { gridTemplateColumns: 'repeat(2, 1fr)' } }}>
                                    {/* Name */}
                                    <div>
                                        <label htmlFor="name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: theme.palette.text.primary, marginBottom: 8 }}>
                                            Full Name
                                        </label>
                                        {isEditing ? (
                                            <div style={{ position: 'relative' }}>
                                                <User style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', height: 16, width: 16, color: theme.palette.text.secondary }} />
                                                <input
                                                    {...registerProfile('name')}
                                                    type="text"
                                                    id="name"
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 8px 8px 40px',
                                                        border: `1px solid ${theme.palette.divider}`,
                                                        borderRadius: 8,
                                                        fontSize: '0.875rem',
                                                        color: theme.palette.text.primary,
                                                        backgroundColor: theme.palette.background.paper,
                                                    }}
                                                    placeholder="Enter your full name"
                                                />
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', padding: 12, borderRadius: 8, backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.default, 0.04) : alpha(theme.palette.background.paper, 0.6), border: `1px solid ${theme.palette.divider}` }}>
                                                <User style={{ width: 16, height: 16, color: theme.palette.text.secondary, marginRight: 12 }} />
                                                <span style={{ color: theme.palette.text.primary }}>{user?.name}</span>
                                            </div>
                                        )}
                                        {profileErrors.name && (
                                            <p style={{ marginTop: 4, fontSize: '0.75rem', color: theme.palette.error.main }}>{profileErrors.name.message}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: theme.palette.text.primary, marginBottom: 8 }}>
                                            Email Address
                                        </label>
                                        {isEditing ? (
                                            <div style={{ position: 'relative' }}>
                                                <Mail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', height: 16, width: 16, color: theme.palette.text.secondary }} />
                                                <input
                                                    {...registerProfile('email')}
                                                    type="email"
                                                    id="email"
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 8px 8px 40px',
                                                        border: `1px solid ${theme.palette.divider}`,
                                                        borderRadius: 8,
                                                        fontSize: '0.875rem',
                                                        color: theme.palette.text.primary,
                                                        backgroundColor: theme.palette.background.paper,
                                                    }}
                                                    placeholder="Enter your email"
                                                />
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', padding: 12, borderRadius: 8, backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.default, 0.04) : alpha(theme.palette.background.paper, 0.6), border: `1px solid ${theme.palette.divider}` }}>
                                                <Mail style={{ width: 16, height: 16, color: theme.palette.text.secondary, marginRight: 12 }} />
                                                <span style={{ color: theme.palette.text.primary }}>{user?.email}</span>
                                            </div>
                                        )}
                                        {profileErrors.email && (
                                            <p style={{ marginTop: 4, fontSize: '0.75rem', color: theme.palette.error.main }}>{profileErrors.email.message}</p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label htmlFor="description" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: theme.palette.text.primary, marginBottom: 8 }}>
                                            Description
                                        </label>
                                        {isEditing ? (
                                            <textarea
                                                {...registerProfile('description')}
                                                id="description"
                                                rows={3}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    borderRadius: 8,
                                                    fontSize: '0.875rem',
                                                    color: theme.palette.text.primary,
                                                    backgroundColor: theme.palette.background.paper,
                                                    resize: 'vertical',
                                                    minHeight: '80px',
                                                }}
                                                placeholder="Tell us about yourself..."
                                            />
                                        ) : (
                                            <div style={{ padding: 12, borderRadius: 8, backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.default, 0.04) : alpha(theme.palette.background.paper, 0.6), border: `1px solid ${theme.palette.divider}`, minHeight: '80px' }}>
                                                <span style={{ color: theme.palette.text.primary }}>{user?.description || 'No description provided'}</span>
                                            </div>
                                        )}
                                        {profileErrors.description && (
                                            <p style={{ marginTop: 4, fontSize: '0.75rem', color: theme.palette.error.main }}>{profileErrors.description.message}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Account Info (Read-only) */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 24, paddingTop: 24, borderTop: `1px solid ${theme.palette.divider}`, [theme.breakpoints.up('md')]: { gridTemplateColumns: 'repeat(2, 1fr)' } }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: theme.palette.text.primary, marginBottom: 8 }}>
                                            Account Created
                                        </label>
                                        <div style={{ display: 'flex', alignItems: 'center', padding: 12, borderRadius: 8, backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.default, 0.04) : alpha(theme.palette.background.paper, 0.6), border: `1px solid ${theme.palette.divider}` }}>
                                            <Calendar style={{ width: 16, height: 16, color: theme.palette.text.secondary, marginRight: 12 }} />
                                            <span style={{ color: theme.palette.text.primary }}>
                                                {user?.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'Unknown'}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: theme.palette.text.primary, marginBottom: 8 }}>
                                            Last Updated
                                        </label>
                                        <div style={{ display: 'flex', alignItems: 'center', padding: 12, borderRadius: 8, backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.default, 0.04) : alpha(theme.palette.background.paper, 0.6), border: `1px solid ${theme.palette.divider}` }}>
                                            <Calendar style={{ width: 16, height: 16, color: theme.palette.text.secondary, marginRight: 12 }} />
                                            <span style={{ color: theme.palette.text.primary }}>
                                                {user?.updatedAt ? format(new Date(user.updatedAt), 'MMM dd, yyyy') : 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {isEditing && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 24, borderTop: `1px solid ${theme.palette.divider}` }}>
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                padding: '8px 16px',
                                                fontSize: '0.875rem',
                                                fontWeight: 500,
                                                color: theme.palette.text.primary,
                                                backgroundColor: theme.palette.background.paper,
                                                border: `1px solid ${theme.palette.divider}`,
                                                borderRadius: 8,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <X style={{ height: 16, width: 16, marginRight: 8 }} />
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isProfileSubmitting || updateProfileMutation.isPending}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                padding: '8px 16px',
                                                fontSize: '0.875rem',
                                                fontWeight: 500,
                                                color: theme.palette.primary.contrastText,
                                                backgroundColor: theme.palette.primary.main,
                                                border: 'none',
                                                borderRadius: 8,
                                                cursor: 'pointer',
                                                opacity: (isProfileSubmitting || updateProfileMutation.isPending) ? 0.5 : 1,
                                            }}
                                        >
                                            {updateProfileMutation.isPending ? (
                                                <>
                                                    <div style={{ animation: 'spin 1s linear infinite', borderRadius: '50%', height: 16, width: 16, border: `2px solid ${theme.palette.primary.contrastText}`, borderTopColor: 'transparent', marginRight: 8 }}></div>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save style={{ height: 16, width: 16, marginRight: 8 }} />
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div>
                                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: theme.palette.text.primary, marginBottom: 8 }}>
                                    Change Password
                                </h2>
                                <p style={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                                    Ensure your account is using a strong password to keep your account secure.
                                </p>
                            </div>

                            <form onSubmit={handleSubmitPassword(onSubmitPassword)} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                {/* Current Password */}
                                <div>
                                    <label htmlFor="currentPassword" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: theme.palette.text.primary, marginBottom: 8 }}>
                                        Current Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', height: 16, width: 16, color: theme.palette.text.secondary }} />
                                        <input
                                            {...registerPassword('currentPassword')}
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            id="currentPassword"
                                            style={{
                                                width: '100%',
                                                padding: '8px 8px 8px 40px',
                                                border: `1px solid ${theme.palette.divider}`,
                                                borderRadius: 8,
                                                fontSize: '0.875rem',
                                                color: theme.palette.text.primary,
                                                backgroundColor: theme.palette.background.paper,
                                            }}
                                            placeholder="Enter your current password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: 12,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: theme.palette.text.secondary,
                                            }}
                                        >
                                            {showCurrentPassword ? <EyeOff style={{ height: 16, width: 16 }} /> : <Eye style={{ height: 16, width: 16 }} />}
                                        </button>
                                    </div>
                                    {passwordErrors.currentPassword && (
                                        <p style={{ marginTop: 4, fontSize: '0.75rem', color: theme.palette.error.main }}>{passwordErrors.currentPassword.message}</p>
                                    )}
                                </div>

                                {/* New Password */}
                                <div>
                                    <label htmlFor="newPassword" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: theme.palette.text.primary, marginBottom: 8 }}>
                                        New Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', height: 16, width: 16, color: theme.palette.text.secondary }} />
                                        <input
                                            {...registerPassword('newPassword')}
                                            type={showNewPassword ? 'text' : 'password'}
                                            id="newPassword"
                                            style={{
                                                width: '100%',
                                                padding: '8px 8px 8px 40px',
                                                border: `1px solid ${theme.palette.divider}`,
                                                borderRadius: 8,
                                                fontSize: '0.875rem',
                                                color: theme.palette.text.primary,
                                                backgroundColor: theme.palette.background.paper,
                                            }}
                                            placeholder="Enter your new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: 12,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: theme.palette.text.secondary,
                                            }}
                                        >
                                            {showNewPassword ? <EyeOff style={{ height: 16, width: 16 }} /> : <Eye style={{ height: 16, width: 16 }} />}
                                        </button>
                                    </div>
                                    {passwordErrors.newPassword && (
                                        <p style={{ marginTop: 4, fontSize: '0.75rem', color: theme.palette.error.main }}>{passwordErrors.newPassword.message}</p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: theme.palette.text.primary, marginBottom: 8 }}>
                                        Confirm New Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', height: 16, width: 16, color: theme.palette.text.secondary }} />
                                        <input
                                            {...registerPassword('confirmPassword')}
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            id="confirmPassword"
                                            style={{
                                                width: '100%',
                                                padding: '8px 8px 8px 40px',
                                                border: `1px solid ${theme.palette.divider}`,
                                                borderRadius: 8,
                                                fontSize: '0.875rem',
                                                color: theme.palette.text.primary,
                                                backgroundColor: theme.palette.background.paper,
                                            }}
                                            placeholder="Confirm your new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: 12,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: theme.palette.text.secondary,
                                            }}
                                        >
                                            {showConfirmPassword ? <EyeOff style={{ height: 16, width: 16 }} /> : <Eye style={{ height: 16, width: 16 }} />}
                                        </button>
                                    </div>
                                    {passwordErrors.confirmPassword && (
                                        <p style={{ marginTop: 4, fontSize: '0.75rem', color: theme.palette.error.main }}>{passwordErrors.confirmPassword.message}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 24, borderTop: `1px solid ${theme.palette.divider}` }}>
                                    <button
                                        type="submit"
                                        disabled={isPasswordSubmitting || changePasswordMutation.isPending}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            padding: '12px 24px',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            color: theme.palette.primary.contrastText,
                                            backgroundColor: theme.palette.primary.main,
                                            border: 'none',
                                            borderRadius: 8,
                                            cursor: 'pointer',
                                            opacity: (isPasswordSubmitting || changePasswordMutation.isPending) ? 0.5 : 1,
                                        }}
                                    >
                                        {changePasswordMutation.isPending ? (
                                            <>
                                                <div style={{ animation: 'spin 1s linear infinite', borderRadius: '50%', height: 16, width: 16, border: `2px solid ${theme.palette.primary.contrastText}`, borderTopColor: 'transparent', marginRight: 8 }}></div>
                                                Changing Password...
                                            </>
                                        ) : (
                                            <>
                                                <Key style={{ height: 16, width: 16, marginRight: 8 }} />
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div>
                                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: theme.palette.text.primary, marginBottom: 8 }}>
                                    Account Statistics
                                </h2>
                                <p style={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                                    Overview of your activity on the platform.
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 24, [theme.breakpoints.up('md')]: { gridTemplateColumns: 'repeat(2, 1fr)' }, [theme.breakpoints.up('lg')]: { gridTemplateColumns: 'repeat(4, 1fr)' } }}>
                                <div style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.2))', padding: 24, borderRadius: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <FileText style={{ height: 32, width: 32, color: theme.palette.primary.main }} />
                                        <div style={{ marginLeft: 16 }}>
                                            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: theme.palette.primary.main }}>Total Posts</p>
                                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.palette.primary.dark }}>{stats.totalPosts}</p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.2))', padding: 24, borderRadius: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <FileText style={{ height: 32, width: 32, color: theme.palette.success.main }} />
                                        <div style={{ marginLeft: 16 }}>
                                            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: theme.palette.success.main }}>Published</p>
                                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.palette.success.dark }}>{stats.publishedPosts}</p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(249, 115, 22, 0.2))', padding: 24, borderRadius: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <FileText style={{ height: 32, width: 32, color: theme.palette.warning.main }} />
                                        <div style={{ marginLeft: 16 }}>
                                            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: theme.palette.warning.main }}>Drafts</p>
                                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.palette.warning.dark }}>{stats.draftPosts}</p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.2))', padding: 24, borderRadius: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <MessageSquare style={{ height: 32, width: 32, color: theme.palette.secondary.main }} />
                                        <div style={{ marginLeft: 16 }}>
                                            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: theme.palette.secondary.main }}>Comments</p>
                                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.palette.secondary.dark }}>{stats.totalComments}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div style={{ backgroundColor: alpha(theme.palette.grey[100], 0.5), borderRadius: 12, padding: 24 }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: theme.palette.text.primary, marginBottom: 16 }}>Recent Activity</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', padding: 12, backgroundColor: theme.palette.background.paper, borderRadius: 8 }}>
                                        <FileText style={{ height: 20, width: 20, color: theme.palette.primary.main, marginRight: 12 }} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: theme.palette.text.primary }}>Account created</p>
                                            <p style={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                                                {user?.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy \'at\' h:mm a') : 'Unknown'}
                                            </p>
                                        </div>
                                    </div>

                                    {stats.totalPosts > 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', padding: 12, backgroundColor: theme.palette.background.paper, borderRadius: 8 }}>
                                            <FileText style={{ height: 20, width: 20, color: theme.palette.success.main, marginRight: 12 }} />
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: theme.palette.text.primary }}>First post created</p>
                                                <p style={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>Started your blogging journey</p>
                                            </div>
                                        </div>
                                    )}

                                    {stats.totalComments > 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', padding: 12, backgroundColor: theme.palette.background.paper, borderRadius: 8 }}>
                                            <MessageSquare style={{ height: 20, width: 20, color: theme.palette.secondary.main, marginRight: 12 }} />
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: theme.palette.text.primary }}>First comment posted</p>
                                                <p style={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>Joined the community discussion</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Account Tab */}
                    {activeTab === 'account' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div>
                                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: theme.palette.text.primary, marginBottom: 8 }}>
                                    Account Settings
                                </h2>
                                <p style={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                                    Manage your account settings and data.
                                </p>
                            </div>

                            {/* Account Information */}
                            <div style={{ backgroundColor: alpha(theme.palette.grey[100], 0.5), borderRadius: 12, padding: 24 }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: theme.palette.text.primary, marginBottom: 16 }}>Account Information</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 16, [theme.breakpoints.up('md')]: { gridTemplateColumns: 'repeat(2, 1fr)' } }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: theme.palette.text.primary, marginBottom: 4 }}>
                                            Account ID
                                        </label>
                                        <p style={{ fontSize: '0.875rem', color: theme.palette.text.primary, backgroundColor: theme.palette.background.paper, padding: '8px 12px', borderRadius: 6, border: `1px solid ${theme.palette.divider}` }}>
                                            {user?.id || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: theme.palette.text.primary, marginBottom: 4 }}>
                                            Account Type
                                        </label>
                                        <p style={{ fontSize: '0.875rem', color: theme.palette.text.primary, backgroundColor: theme.palette.background.paper, padding: '8px 12px', borderRadius: 6, border: `1px solid ${theme.palette.divider}` }}>
                                            {user?.roles?.includes(Roles.ADMIN) ? 'Administrator' : 'User'}
                                        </p>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: theme.palette.text.primary, marginBottom: 4 }}>
                                            Member Since
                                        </label>
                                        <p style={{ fontSize: '0.875rem', color: theme.palette.text.primary, backgroundColor: theme.palette.background.paper, padding: '8px 12px', borderRadius: 6, border: `1px solid ${theme.palette.divider}` }}>
                                            {user?.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'Unknown'}
                                        </p>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: theme.palette.text.primary, marginBottom: 4 }}>
                                            Last Updated
                                        </label>
                                        <p style={{ fontSize: '0.875rem', color: theme.palette.text.primary, backgroundColor: theme.palette.background.paper, padding: '8px 12px', borderRadius: 6, border: `1px solid ${theme.palette.divider}` }}>
                                            {user?.updatedAt ? format(new Date(user.updatedAt), 'MMM dd, yyyy') : 'Unknown'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div style={{ backgroundColor: alpha(theme.palette.error.main, 0.04), border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`, borderRadius: 12, padding: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 24 }}>
                                    <AlertTriangle style={{ height: 24, width: 24, color: theme.palette.error.main, marginRight: 12, flexShrink: 0 }} />
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: theme.palette.error.dark, marginBottom: 8 }}>Danger Zone</h3>
                                        <p style={{ fontSize: '0.875rem', color: theme.palette.error.main }}>
                                            Once you delete your account, there is no going back. This action will permanently:
                                        </p>
                                        <ul style={{ marginTop: 8, fontSize: '0.875rem', color: theme.palette.error.main, listStyleType: 'disc', paddingLeft: 20 }}>
                                            <li style={{ marginBottom: 4 }}>Delete all your posts and comments</li>
                                            <li style={{ marginBottom: 4 }}>Remove your profile and account data</li>
                                            <li style={{ marginBottom: 4 }}>Cancel any active subscriptions</li>
                                            <li>This action cannot be undone</li>
                                        </ul>
                                    </div>
                                </div>

                                {!isDeleting ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: theme.palette.error.dark }}>Delete Account</h4>
                                            <p style={{ fontSize: '0.875rem', color: theme.palette.error.main }}>
                                                Permanently delete your account and all associated data.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setIsDeleting(true)}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                padding: '8px 16px',
                                                fontSize: '0.875rem',
                                                fontWeight: 500,
                                                color: theme.palette.error.contrastText,
                                                backgroundColor: theme.palette.error.main,
                                                border: 'none',
                                                borderRadius: 8,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <Trash2 style={{ height: 16, width: 16, marginRight: 8 }} />
                                            Delete Account
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div>
                                            <label htmlFor="deleteConfirmation" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: theme.palette.error.dark, marginBottom: 8 }}>
                                                Type "DELETE" to confirm account deletion
                                            </label>
                                            <input
                                                type="text"
                                                id="deleteConfirmation"
                                                value={deleteConfirmation}
                                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    border: `1px solid ${theme.palette.error.main}`,
                                                    borderRadius: 8,
                                                    fontSize: '0.875rem',
                                                    color: theme.palette.text.primary,
                                                    backgroundColor: theme.palette.background.paper,
                                                }}
                                                placeholder="Type DELETE to confirm"
                                            />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                            <button
                                                onClick={() => {
                                                    setIsDeleting(false);
                                                    setDeleteConfirmation('');
                                                }}
                                                style={{
                                                    padding: '8px 16px',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
                                                    color: theme.palette.text.primary,
                                                    backgroundColor: theme.palette.background.paper,
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    borderRadius: 8,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleDeleteAccount}
                                                disabled={deleteUserMutation.isPending || deleteConfirmation !== 'DELETE'}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    padding: '8px 16px',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
                                                    color: theme.palette.error.contrastText,
                                                    backgroundColor: theme.palette.error.main,
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    cursor: 'pointer',
                                                    opacity: (deleteUserMutation.isPending || deleteConfirmation !== 'DELETE') ? 0.5 : 1,
                                                }}
                                            >
                                                {deleteUserMutation.isPending ? (
                                                    <>
                                                        <div style={{ animation: 'spin 1s linear infinite', borderRadius: '50%', height: 16, width: 16, border: `2px solid ${theme.palette.error.contrastText}`, borderTopColor: 'transparent', marginRight: 8 }}></div>
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Trash2 style={{ height: 16, width: 16, marginRight: 8 }} />
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