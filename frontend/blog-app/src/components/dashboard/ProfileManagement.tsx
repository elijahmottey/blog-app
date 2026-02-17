import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Edit, Save, X, Key, Shield, FileText, MessageSquare, Trash2, AlertTriangle } from 'lucide-react';
import BackendApi from '../../service/BackendApi';
import { Roles } from '../../enums/Roles';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useTheme } from '@mui/material/styles';
import {LIVBlogCard, LIVBlogHeader, LIVBlogLayout} from '../ui';
import { Button, TextField, Chip } from '@mui/material';

const profileSchema = yup.object({
    name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
    email: yup.string().required('Email is required').email('Invalid email format'),
    description: yup.string().max(500, 'Description must be less than 500 characters'),
});

export const ProfileManagement: React.FC = () => {
    const { user, logout, refreshUser } = useAuth();
    const theme = useTheme();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'account'>('profile');
    const [isEditing, setIsEditing] = useState(false);

    const { data: userStats } = useQuery({
        queryKey: ['user-stats'],
        queryFn: async () => {
            const [posts, comments] = await Promise.all([
                BackendApi.getAllPost(),
                BackendApi.getAllPostComment(),
            ]);
            const userPosts = posts.data?.content?.filter((post: any) => post.users === user?.name || post.users === user?.email) || [];
            const userComments = comments.data?.content?.filter((comment: any) => comment.users === user?.name || comment.users === user?.email) || [];
            return {
                totalPosts: userPosts.length,
                totalComments: userComments.length,
                publishedPosts: userPosts.filter((post: any) => post.content && post.content.length > 0).length,
                draftPosts: userPosts.filter((post: any) => !post.content || post.content.length === 0).length,
            };
        },
        enabled: !!user,
    });

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(profileSchema) as any,
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            description: user?.description || '',
        },
    });

    const updateProfileMutation = useMutation({
        mutationFn: (data: any) => BackendApi.updateUser(user?.id || 0, data),
        onSuccess: async () => {
            toast.success('Profile updated successfully!');
            await refreshUser();
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            setIsEditing(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        },
    });

    const onSubmit = (data: any) => {
        updateProfileMutation.mutate(data);
    };

    const handleCancelEdit = () => {
        reset({
            name: user?.name || '',
            email: user?.email || '',
            description: user?.description || '',
        });
        setIsEditing(false);
    };

    const stats = userStats || { totalPosts: 0, totalComments: 0, publishedPosts: 0, draftPosts: 0 };

    return (
        <div className="aws-spacing-y-lg">
            <LIVBlogHeader
                title="Profile Management"
                subtitle="Manage your account settings and information"
                size="large"
                actions={
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div
                                className="flex items-center justify-center rounded-full"
                                style={{
                                    width: 40,
                                    height: 40,
                                    backgroundColor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText,
                                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontSize: '1rem',
                                    fontWeight: 600
                                }}
                            >
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <div className="aws-text-body" style={{ fontWeight: 600, color: theme.palette.text.primary, margin: 0 }}>
                                    {user?.name || 'User'}
                                </div>
                                <div className="aws-text-body" style={{ color: theme.palette.text.secondary, margin: 0, fontSize: '0.75rem' }}>
                                    {user?.email}
                                </div>
                            </div>
                        </div>
                        {user?.roles?.includes(Roles.ADMIN) && (
                            <Chip
                                icon={<Shield size={12} />}
                                label="Admin"
                                size="small"
                                color="error"
                                variant="outlined"
                            />
                        )}
                    </div>
                }
            />

            <LIVBlogCard padding="none">
                <div className="flex border-b" style={{ borderColor: theme.palette.divider }}>
                    {['profile', 'stats', 'account'].map((tab) => {
                        const active = activeTab === tab;
                        const labels = { profile: 'Profile', stats: 'Statistics', account: 'Account' };
                        const icons = { profile: User, stats: FileText, account: Shield };
                        const Icon = icons[tab as keyof typeof icons];
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className="aws-spacing-md flex items-center justify-center aws-button"
                                style={{
                                    borderBottom: `2px solid ${active ? theme.palette.primary.main : 'transparent'}`,
                                    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
                                    background: 'transparent',
                                    minWidth: '120px'
                                }}
                            >
                                <Icon size={14} style={{ marginRight: '8px' }} />
                                {labels[tab as keyof typeof labels]}
                            </button>
                        );
                    })}
                </div>

                <div className="aws-spacing-lg">
                    {activeTab === 'profile' && (
                        <div>
                            <div className="flex items-center justify-between aws-margin-b-lg">
                                <h3 className="aws-header-md" style={{ margin: 0 }}>Profile Information</h3>
                                {!isEditing && (
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        variant="outlined"
                                        className="aws-button aws-button-secondary"
                                        startIcon={<Edit size={16} />}
                                    >
                                        Edit Profile
                                    </Button>
                                )}
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <LIVBlogLayout.Grid cols={2} gap="md">
                                    <div>
                                        <label className="aws-text-body" style={{ fontWeight: 600, color: theme.palette.text.primary, display: 'block', marginBottom: '8px' }}>
                                            Full Name
                                        </label>
                                        {isEditing ? (
                                            <TextField
                                                {...register('name')}
                                                fullWidth
                                                size="small"
                                                error={!!errors.name}
                                                helperText={errors.name?.message}
                                                className="aws-font"
                                            />
                                        ) : (
                                            <div className="aws-spacing-sm" style={{ backgroundColor: theme.palette.action.hover, borderRadius: '8px', border: `1px solid ${theme.palette.divider}` }}>
                                                <span className="aws-text-body" style={{ color: theme.palette.text.primary }}>{user?.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="aws-text-body" style={{ fontWeight: 600, color: theme.palette.text.primary, display: 'block', marginBottom: '8px' }}>
                                            Email Address
                                        </label>
                                        {isEditing ? (
                                            <TextField
                                                {...register('email')}
                                                type="email"
                                                fullWidth
                                                size="small"
                                                error={!!errors.email}
                                                helperText={errors.email?.message}
                                                className="aws-font"
                                            />
                                        ) : (
                                            <div className="aws-spacing-sm" style={{ backgroundColor: theme.palette.action.hover, borderRadius: '8px', border: `1px solid ${theme.palette.divider}` }}>
                                                <span className="aws-text-body" style={{ color: theme.palette.text.primary }}>{user?.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </LIVBlogLayout.Grid>

                                <div>
                                    <label className="aws-text-body" style={{ fontWeight: 600, color: theme.palette.text.primary, display: 'block', marginBottom: '8px' }}>
                                        Description
                                    </label>
                                    {isEditing ? (
                                        <TextField
                                            {...register('description')}
                                            multiline
                                            rows={3}
                                            fullWidth
                                            size="small"
                                            error={!!errors.description}
                                            helperText={errors.description?.message}
                                            className="aws-font"
                                            placeholder="Tell us about yourself..."
                                        />
                                    ) : (
                                        <div className="aws-spacing-sm" style={{ backgroundColor: theme.palette.action.hover, borderRadius: '8px', border: `1px solid ${theme.palette.divider}`, minHeight: '80px' }}>
                                            <span className="aws-text-body" style={{ color: theme.palette.text.primary }}>{user?.description || 'No description provided'}</span>
                                        </div>
                                    )}
                                </div>

                                {isEditing && (
                                    <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: theme.palette.divider }}>
                                        <Button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            variant="outlined"
                                            className="aws-button aws-button-secondary"
                                            startIcon={<X size={16} />}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting || updateProfileMutation.isPending}
                                            variant="contained"
                                            className="aws-button aws-button-primary"
                                            startIcon={<Save size={16} />}
                                        >
                                            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div>
                            <h3 className="aws-header-md aws-margin-b-lg" style={{ margin: '0 0 24px 0' }}>Account Statistics</h3>
                            <LIVBlogLayout.Grid cols={4} gap="md">
                                <LIVBlogCard title="Total Posts" padding="medium" className="text-center">
                                    <div className="aws-header-lg" style={{ color: theme.palette.primary.main, margin: 0 }}>{stats.totalPosts}</div>
                                </LIVBlogCard>
                                <LIVBlogCard title="Published" padding="medium" className="text-center">
                                    <div className="aws-header-lg" style={{ color: theme.palette.success.main, margin: 0 }}>{stats.publishedPosts}</div>
                                </LIVBlogCard>
                                <LIVBlogCard title="Drafts" padding="medium" className="text-center">
                                    <div className="aws-header-lg" style={{ color: theme.palette.warning.main, margin: 0 }}>{stats.draftPosts}</div>
                                </LIVBlogCard>
                                <LIVBlogCard title="Comments" padding="medium" className="text-center">
                                    <div className="aws-header-lg" style={{ color: theme.palette.secondary.main, margin: 0 }}>{stats.totalComments}</div>
                                </LIVBlogCard>
                            </LIVBlogLayout.Grid>
                        </div>
                    )}

                    {activeTab === 'account' && (
                        <div>
                            <h3 className="aws-header-md aws-margin-b-lg" style={{ margin: '0 0 24px 0' }}>Account Settings</h3>
                            <LIVBlogLayout.Grid cols={2} gap="md">
                                <div>
                                    <label className="aws-text-body" style={{ fontWeight: 600, color: theme.palette.text.primary, display: 'block', marginBottom: '8px' }}>
                                        Account ID
                                    </label>
                                    <div className="aws-spacing-sm" style={{ backgroundColor: theme.palette.action.hover, borderRadius: '8px', border: `1px solid ${theme.palette.divider}` }}>
                                        <span className="aws-text-body" style={{ color: theme.palette.text.primary }}>{user?.id || 'N/A'}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="aws-text-body" style={{ fontWeight: 600, color: theme.palette.text.primary, display: 'block', marginBottom: '8px' }}>
                                        Member Since
                                    </label>
                                    <div className="aws-spacing-sm" style={{ backgroundColor: theme.palette.action.hover, borderRadius: '8px', border: `1px solid ${theme.palette.divider}` }}>
                                        <span className="aws-text-body" style={{ color: theme.palette.text.primary }}>
                                            {user?.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            </LIVBlogLayout.Grid>
                        </div>
                    )}
                </div>
            </LIVBlogCard>
        </div>
    );
};