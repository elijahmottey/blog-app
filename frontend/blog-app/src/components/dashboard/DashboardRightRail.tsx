import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Badge, Avatar, Menu as MuiMenu, MenuItem, Divider, Typography, Chip, ListItemIcon } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Home, FileText, MessageSquare, Users, Bell, Shield, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeModeContext';

export const DashboardRightRail: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { mode, toggleMode } = useThemeMode();

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

  if (isMobile) return null; // hide on mobile (use top navbar instead)

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
      }}
    >
      {/* quick actions */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
        {quickActions.map((a) => (
          <Tooltip key={a.label} title={a.label} placement="left">
            <IconButton component={Link} to={a.to} size="small" sx={{ color: 'text.secondary' }}>
              {a.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Box>

      <Divider sx={{ width: '60%', my: 1 }} />

      {/* Theme toggle */}
      <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} placement="left">
        <IconButton size="small" onClick={toggleMode} sx={{ color: 'text.secondary' }}>
          {mode === 'dark' ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </IconButton>
      </Tooltip>

      {/* notifications */}
      <Tooltip title="Notifications" placement="left">
        <IconButton size="small" sx={{ color: 'text.secondary' }}>
          <Badge badgeContent={3} color="error" variant="dot">
            <Bell size={16} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Box sx={{ flex: 1 }} />

      {/* profile avatar */}
      <Box>
        <IconButton onClick={handleOpen} sx={{ p: 0.5 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
        </IconButton>
        <MuiMenu anchorEl={anchorEl} open={open} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'left' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <Box sx={{ p: 2, minWidth: 220 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{user?.name || 'User'}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                {isAdmin && <Chip label="Admin" size="small" color="error" sx={{ mt: 0.5 }} icon={<Shield size={12} />} />}
              </Box>
            </Box>
          </Box>
          <Divider />
          <MenuItem component={Link} to="/dashboard/profile">Profile</MenuItem>
          <MenuItem component={Link} to="/dashboard/help">Help & Support</MenuItem>
          {isAdmin && <MenuItem component={Link} to="/dashboard/admin/users">Manage Users</MenuItem>}
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon><LogOut size={16} /></ListItemIcon>
            Logout
          </MenuItem>
        </MuiMenu>
      </Box>

    </Box>
  );
};
