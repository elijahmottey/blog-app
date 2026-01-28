import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import BackendApi, { type UserDto } from '../../service/BackendApi';
import { UserActivityModal } from './UserActivityModal';

export const UserActivityPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      if (!id) throw new Error('User ID is required');
      const response = await BackendApi.getAllUsers(0, 1000);
      // Handle the API response structure properly - data is nested under data property
      const usersData = response?.data?.content || [];
      const foundUser = usersData.find((u: UserDto) => u.id?.toString() === id);
      if (!foundUser) throw new Error('User not found');
      return foundUser;
    },
    enabled: !!id,
  });

  const handleClose = () => {
    navigate('/dashboard/admin/users');
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: `3px solid ${theme.palette.divider}`,
          borderTop: `3px solid ${theme.palette.primary.main}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <p style={{ color: theme.palette.text.secondary }}>Loading user data...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: 16,
      }}>
        <p style={{ color: theme.palette.error.main, fontSize: '1.125rem', fontWeight: 600 }}>
          User not found
        </p>
        <button
          onClick={handleClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} />
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <UserActivityModal user={user} onClose={handleClose} />
  );
};