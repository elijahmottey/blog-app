import React, { useState } from 'react';
import { Badge, IconButton, Menu, MenuItem, Typography, Box, Button, Divider, useTheme, alpha } from '@mui/material';
import { Bell, FileText, UserPlus, MessageSquare } from 'lucide-react';
import { useNotificationSystem } from '../../hooks/useNotificationSystem';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

export const NotificationPanel: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationSystem(user?.id);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.referenceId) {
      if (notification.type === 'NEW_USER') {
        navigate(`/dashboard/admin/user/${notification.referenceId}/view`);
      } else {
        navigate(`/dashboard/posts/${notification.referenceId}`);
      }
    }
    handleClose();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_POST':
        return <FileText size={20} color={theme.palette.primary.main} />;
      case 'NEW_USER':
        return <UserPlus size={20} color={theme.palette.success.main} />;
      case 'NEW_COMMENT':
        return <MessageSquare size={20} color={theme.palette.secondary.main} />;
      default:
        return <Bell size={20} />;
    }
  };

  return (
    <>
      <IconButton onClick={handleClick} color="inherit">
        <Badge badgeContent={unreadCount} color="error">
          <Bell size={24} />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        disableScrollLock={true}
        slotProps={{
          backdrop: {
            sx: {
              opacity: '0 !important', // Force opacity to 0 to remove dimming
              backgroundColor: 'transparent', // Ensure background is transparent
            },
          },
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 0.5,
            minWidth: 380,
            maxWidth: 400,
            borderRadius: 2,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={() => markAllAsRead()} sx={{ textTransform: 'none', fontWeight: 'normal' }}>
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
            <Bell size={48} style={{ color: theme.palette.text.disabled, marginBottom: 16 }} />
            <Typography variant="body2" color="text.secondary">
              You're all caught up!
            </Typography>
          </Box>
        ) : (
          notifications.map((notification: any) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                py: 1.5,
                px: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                '&:last-child': { borderBottom: 'none' },
                position: 'relative',
                backgroundColor: notification.isRead ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
              }}
            >
              {!notification.isRead && (
                <Box sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                }} />
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pl: !notification.isRead ? 2 : 0 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                }}>
                  {getNotificationIcon(notification.type)}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: notification.isRead ? 400 : 600, mb: 0.5 }}>
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};