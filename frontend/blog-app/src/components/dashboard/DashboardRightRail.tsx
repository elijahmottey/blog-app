import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Badge, Avatar, Menu as MuiMenu, MenuItem, Divider, Typography, Chip, ListItemIcon } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Home, FileText, MessageSquare, Users, Bell, Shield, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeModeContext';
import { useNotifications } from '../../hooks/useNotifications';

export const DashboardRightRail: React.FC<{ isDesktop?: boolean }> = ({ isDesktop = false }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const { newPostsCount, markAsRead } = useNotifications();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
    handleClose();
  };

  const quickActions = [
    { label: 'Home', icon: <Home size={16} />, to: '/home' },
    { label: 'Posts', icon: <FileText size={16} />, to: '/dashboard/posts' },
    { label: 'Comments', icon: <MessageSquare size={16} />, to: '/dashboard/comments' },
    ...(isAdmin ? [{ label: 'Users', icon: <Users size={16} />, to: '/dashboard/admin/users' }] : []),
  ];

  if (!isDesktop) return null;

  return (
    <Box
      sx={{
        width: 72,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        py: 2,
        borderLeft: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        height: '100vh',
        position: 'sticky',
        top: 0,
        fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Quick actions */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
        {quickActions.map((a) => (
          <Tooltip key={a.label} title={a.label} placement="left">
            <IconButton 
              component={Link} 
              to={a.to} 
              size="small" 
              className="aws-button aws-button-icon hover-subtle"
              sx={{ 
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main
                }
              }}
            >
              {a.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Box>

      <Divider sx={{ width: '60%', my: 1 }} />

      {/* Theme toggle */}
      <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} placement="left">
        <IconButton 
          size="small" 
          onClick={toggleMode} 
          className="aws-button aws-button-icon hover-subtle"
          sx={{ 
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              color: theme.palette.primary.main
            }
          }}
        >
          {mode === 'dark' ? 
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor"/>
            </svg> : 
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        </IconButton>
      </Tooltip>

      {/* Notifications */}
      <Tooltip title="Notifications" placement="left">
        <IconButton 
          size="small" 
          className="aws-button aws-button-icon hover-subtle"
          onClick={(e) => {
            e.preventDefault();
            console.log('Right rail notification clicked, count:', newPostsCount);
            markAsRead();
            navigate('/dashboard/posts');
          }}
          sx={{ 
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              color: theme.palette.primary.main
            }
          }}
        >
          <Badge badgeContent={newPostsCount} color="error" overlap="circular">
            <Bell size={16} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Box sx={{ flex: 1 }} />

      {/* Profile avatar */}
      <Box>
        <IconButton onClick={handleOpen} sx={{ p: 0.5 }} className="hover-scale">
          <div
            style={{
              width: 36,
              height: 36,
              backgroundColor: user?.avatar ? 'transparent' : theme.palette.primary.main,
              color: 'white',
              fontWeight: 600,
              fontSize: '0.875rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'User'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              user?.name?.charAt(0)?.toUpperCase() || 'U'
            )}
          </div>
        </IconButton>
        <MuiMenu 
          anchorEl={anchorEl} 
          open={open} 
          onClose={handleClose} 
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }} 
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }
          }}
        >
          <Box sx={{ p: 2, minWidth: 220 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: user?.avatar ? 'transparent' : theme.palette.primary.main,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1.125rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <Box>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  {user?.name || 'User'}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                >
                  {user?.email}
                </Typography>
                {isAdmin && (
                  <Chip 
                    label="Admin" 
                    size="small" 
                    color="error" 
                    sx={{ 
                      mt: 0.5,
                      fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      fontSize: '0.75rem'
                    }} 
                    icon={<Shield size={12} />} 
                  />
                )}
              </Box>
            </Box>
          </Box>
          <Divider />
          <MenuItem 
            component={Link} 
            to="/dashboard/profile"
            sx={{ fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
          >
            Profile
          </MenuItem>
          <MenuItem 
            component={Link} 
            to="/dashboard/help"
            sx={{ fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
          >
            Help & Support
          </MenuItem>
          {isAdmin && (
            <MenuItem 
              component={Link} 
              to="/dashboard/admin/users"
              sx={{ fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              Manage Users
            </MenuItem>
          )}
          <Divider />
          <MenuItem 
            onClick={handleLogout} 
            sx={{ 
              color: 'error.main',
              fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            <ListItemIcon><LogOut size={16} /></ListItemIcon>
            Logout
          </MenuItem>
        </MuiMenu>
      </Box>
    </Box>
  );
};