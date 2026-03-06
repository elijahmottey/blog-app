import React, { useState } from 'react';
import { Badge, IconButton, Menu, MenuItem, Typography, Box, Button, Divider, useTheme, alpha } from '@mui/material';
import { Bell, FileText, UserPlus, MessageSquare, CheckCircle2 } from 'lucide-react';
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

  const getNotificationIcon = (type: string, overrideColor?: string) => {
    switch (type) {
      case 'NEW_POST':
        return <FileText size={22} color={overrideColor || theme.palette.primary.main} strokeWidth={2.5} />;
      case 'NEW_USER':
        return <UserPlus size={22} color={overrideColor || theme.palette.success.main} strokeWidth={2.5} />;
      case 'NEW_COMMENT':
        return <MessageSquare size={22} color={overrideColor || theme.palette.secondary.main} strokeWidth={2.5} />;
      default:
        return <Bell size={22} color={overrideColor || 'currentColor'} strokeWidth={2.5} />;
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
          elevation: 0,
          sx: {
            mt: 1.5,
            minWidth: 400,
            maxWidth: 450,
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0px 12px 48px -12px rgba(0,0,0,0.2)',
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            '& .MuiList-root': {
              p: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{
          p: 2.5,
          pb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: alpha(theme.palette.background.default, 0.8),
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          zIndex: 1,
          position: 'relative'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center' }}>
            Notifications
            {unreadCount > 0 && (
              <Badge
                badgeContent={unreadCount}
                color="primary"
                sx={{ ml: 2, '& .MuiBadge-badge': { position: 'static', transform: 'none', ml: 1, fontWeight: 700 } }}
              />
            )}
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
              startIcon={<CheckCircle2 size={16} />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                px: 1.5,
                color: theme.palette.text.secondary,
                '&:hover': { color: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.08) }
              }}
            >
              Mark all read
            </Button>
          )}
        </Box>
        <Box sx={{ maxHeight: '450px', overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <Box sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: `linear-gradient(180deg, transparent 0%, ${alpha(theme.palette.background.default, 0.5)} 100%)`
            }}>
              <Box sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.1)}`
              }}>
                <Bell size={36} style={{ color: theme.palette.primary.main, opacity: 0.6 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
                You're all caught up!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No new notifications at the moment.
              </Typography>
            </Box>
          ) : (
            notifications.map((notification: any) => (
              <MenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  py: 2,
                  px: 2.5,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  backgroundColor: notification.isRead ? 'transparent' : alpha(theme.palette.primary.main, 0.03),
                  '&:hover': {
                    backgroundColor: notification.isRead
                      ? alpha(theme.palette.action.hover, 0.5)
                      : alpha(theme.palette.primary.main, 0.06)
                  },
                }}
              >
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  bgcolor: notification.isRead
                    ? alpha(theme.palette.text.secondary, 0.08)
                    : alpha(theme.palette.primary.main, 0.12),
                  color: notification.isRead
                    ? theme.palette.text.secondary
                    : theme.palette.primary.main,
                }}>
                  {getNotificationIcon(notification.type, notification.isRead ? theme.palette.text.secondary : undefined)}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0, mt: 0.25 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5, gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: notification.isRead ? 500 : 600,
                        color: notification.isRead ? 'text.secondary' : 'text.primary',
                        lineHeight: 1.4,
                      }}
                    >
                      {notification.message}
                    </Typography>
                    {!notification.isRead && (
                      <Box sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        flexShrink: 0,
                        mt: 0.5,
                      }} />
                    )}
                  </Box>
                  <Typography variant="caption" sx={{
                    color: 'text.disabled',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}>
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
        </Box>
      </Menu>
    </>
  );
};