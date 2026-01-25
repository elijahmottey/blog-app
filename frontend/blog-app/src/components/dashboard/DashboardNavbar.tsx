import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Search,
  Bell,
  User,
  LogOut,
  Home,
  MessageSquare,
  FileText,
  Users,
  ChevronDown,
  HelpCircle,
  Moon,
  Sun,
  Shield
} from 'lucide-react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Badge,
  Typography,
  Box,
  InputBase,
  Menu as MuiMenu,
  MenuItem,
  Divider,
  Chip,
  Button,
  Tooltip,
  Switch,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  styled,
  Drawer,
  List,
  ListItem,
  ListItemButton
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { useThemeMode } from '../../context/ThemeModeContext';

interface DashboardNavbarProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
  isMobile: boolean;
}

const SearchWrapper = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ onMenuClick, isSidebarOpen, isMobile }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();


  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const { mode, toggleMode } = useThemeMode();

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/auth/login');
    handleProfileClose();
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.info(`${darkMode ? 'Light' : 'Dark'} mode ${darkMode ? 'disabled' : 'enabled'}`);
  };

  const quickActions = [
    { label: 'Dashboard', icon: <Home size={16} />, path: '/home' },
    { label: 'Posts', icon: <FileText size={16} />, path: '/dashboard/posts' },
    { label: 'Comments', icon: <MessageSquare size={16} />, path: '/dashboard/comments' },
    ...(isAdmin ? [{ label: 'Users', icon: <Users size={16} />, path: '/dashboard/admin/users' }] : []),
  ];


  return (
      <>
        <AppBar
            position="sticky"
            elevation={1}
            sx={{
              bgcolor: 'background.paper',
              color: 'text.primary',
              borderBottom: 1,
              borderColor: 'divider',
              zIndex: theme.zIndex.drawer + 1,
            }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
            {/* Left Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isMobile && (
                  <IconButton
                      edge="start"
                      color="inherit"
                      aria-label="menu"
                      onClick={onMenuClick}
                      sx={{ mr: 1 }}
                  >
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                  </IconButton>
              )}



              {/* Quick Actions Menu (Desktop) */}
              {!isMobile && (
                  <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                    {quickActions.map((action) => (
                        <Tooltip key={action.label} title={action.label}>
                          <IconButton
                              component={Link}
                              to={action.path}
                              size="small"
                              sx={{
                                color: 'text.secondary',
                                '&:hover': {
                                  color: 'primary.main',
                                  bgcolor: 'primary.light',
                                },
                              }}
                          >
                            {action.icon}
                          </IconButton>
                        </Tooltip>
                    ))}
                  </Box>
              )}
            </Box>

            {/* Center Section - Search (Desktop) */}
            {!isMobile && (
                <SearchWrapper>
                  <SearchIconWrapper>
                    <Search size={20} />
                  </SearchIconWrapper>
                  <StyledInputBase
                      placeholder="Search posts, users, comments..."
                      inputProps={{ 'aria-label': 'search' }}
                      sx={{ color: 'text.primary' }}
                  />
                </SearchWrapper>
            )}

            {/* Right Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
              {/* Search Button (Mobile) */}
              {isMobile && (
                  <Tooltip title="Search">
                    <IconButton
                        color="inherit"
                        onClick={() => setSearchOpen(true)}
                        sx={{ display: { xs: 'flex', md: 'none' } }}
                    >
                      <Search size={20} />
                    </IconButton>
                  </Tooltip>
              )}

              {/* Theme Mode Toggle */}
              <Tooltip title={`${mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}`}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {mode === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                  <Switch
                      size="small"
                      checked={mode === 'dark'}
                      onChange={toggleMode}
                      color="primary"
                      inputProps={{ 'aria-label': 'toggle color mode' }}
                  />
                </Box>
              </Tooltip>

              {/* Notifications */}
              <Tooltip title="Notifications">
                <IconButton color="inherit" sx={{ position: 'relative' }}>
                  <Badge
                      badgeContent={3}
                      color="error"
                      variant="dot"
                      overlap="circular"
                  >
                    <Bell size={20} />
                  </Badge>
                </IconButton>
              </Tooltip>



              {/* Profile Section */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                    onClick={handleProfileClick}
                    sx={{
                      p: 0.5,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: 'primary.main',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                        }}
                    >
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                    {isAdmin && (
                        <Box
                            sx={{
                              position: 'absolute',
                              bottom: -2,
                              right: -2,
                              bgcolor: 'error.main',
                              borderRadius: '50%',
                              width: 16,
                              height: 16,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '2px solid white',
                            }}
                        >
                          <Shield size={8} color="white" />
                        </Box>
                    )}
                  </Box>
                </IconButton>

                {!isMobile && (
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', lineHeight: 1 }}>
                        {user?.name || 'User'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user?.email || 'user@example.com'}
                      </Typography>
                    </Box>
                )}

                <IconButton
                    size="small"
                    onClick={handleProfileClick}
                    sx={{ display: { xs: 'none', sm: 'flex' } }}
                >
                  <ChevronDown size={16} />
                </IconButton>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Profile Menu */}
        <MuiMenu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileClose}
            onClick={handleProfileClose}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                minWidth: 280,
                borderRadius: 2,
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {/* User Info Section */}
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: 'primary.main',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                  }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {user?.name || 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email || 'user@example.com'}
                </Typography>
                {isAdmin && (
                    <Chip
                        label="Admin"
                        size="small"
                        color="error"
                        variant="outlined"
                        sx={{ mt: 0.5, height: 20 }}
                        icon={<Shield size={12} />}
                    />
                )}
              </Box>
            </Box>

          </Box>

          <Divider />

          {/* Menu Items */}
          <MenuItem component={Link} to="/dashboard/profile">
            <ListItemIcon>
              <User size={18} />
            </ListItemIcon>
            <ListItemText primary="My Profile" />
          </MenuItem>


          <MenuItem component={Link} to="/dashboard/help">
            <ListItemIcon>
              <HelpCircle size={18} />
            </ListItemIcon>
            <ListItemText primary="Help & Support" />
          </MenuItem>

          <Divider />

          {/* Admin Section */}
          {isAdmin && (
              <>
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                    ADMIN PANEL
                  </Typography>
                </Box>
                <MenuItem component={Link} to="/dashboard/admin/users">
                  <ListItemIcon>
                    <Users size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Manage Users" />
                </MenuItem>

                <Divider />
              </>
          )}

          {/* Logout */}
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <LogOut size={18} />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </MenuItem>
        </MuiMenu>

        {/* Mobile Search Drawer */}
        <Drawer
            anchor="top"
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
            PaperProps={{
              sx: {
                height: 'auto',
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
              },
            }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Search size={20} />
              <InputBase
                  fullWidth
                  placeholder="Search posts, users, comments..."
                  autoFocus
                  sx={{ fontSize: '1rem' }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                Recent Searches
              </Typography>
              {['React Tutorial', 'User Management', 'Blog Analytics'].map((search) => (
                  <Button
                      key={search}
                      size="small"
                      startIcon={<Search size={14} />}
                      sx={{ justifyContent: 'flex-start' }}
                  >
                    {search}
                  </Button>
              ))}
            </Box>
          </Box>
        </Drawer>

        {/* Quick Actions Drawer for Mobile */}
        <Drawer
            anchor="bottom"
            open={quickActionsOpen}
            onClose={() => setQuickActionsOpen(false)}
            PaperProps={{
              sx: {
                height: 'auto',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
              },
            }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
              Quick Actions
            </Typography>
            <List>
              {quickActions.map((action) => (
                  <ListItem key={action.label} disablePadding>
                    <ListItemButton
                        component={Link}
                        to={action.path}
                        onClick={() => setQuickActionsOpen(false)}
                    >
                      <ListItemIcon>{action.icon}</ListItemIcon>
                      <ListItemText primary={action.label} />
                    </ListItemButton>
                  </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      </>
  );
};