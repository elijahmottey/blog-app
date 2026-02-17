import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  Shield,
  MessageCircle
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
import BackendApi, { type PostDto } from '../../service/BackendApi';

interface DashboardNavbarProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
  isMobile: boolean;
  isDesktop?: boolean;
}

const SearchWrapper = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '2px',
  backgroundColor: '#ffffff',
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  border: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
    minWidth: '400px',
  },
  '&:focus-within': {
    border: `1px solid ${theme.palette.primary.main}`,
    boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 1.5),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.text.primary,
  width: '100%',
  '& .MuiInputBase-input': {
    padding: '8px 8px 8px 0',
    paddingLeft: `calc(1em + ${theme.spacing(3)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    fontSize: '0.875rem',
    height: '16px',
  },
}));

interface SearchResult {
  type: string;
  id: number;
  title: string;
  content: string;
  url: string;
}

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ onMenuClick, isSidebarOpen, isMobile, isDesktop }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const { mode, toggleMode } = useThemeMode();
  const searchRef = React.useRef<HTMLDivElement | null>(null);

  // debounce
  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedTerm(searchTerm.trim()), 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // fetch & filter when debounced term changes
  React.useEffect(() => {
    let active = true;
    if (debouncedTerm.length === 0) {
      setSearchResults([]);
      return;
    }
    (async () => {
      try {
        const [posts, users, comments] = await Promise.all([
          BackendApi.getAllPost(0, 50),
          BackendApi.getAllUsers(),
          BackendApi.getAllPostComment(0, 50)
        ]);
        
        const q = debouncedTerm.toLowerCase();
        const results = [];
        
        // Search posts
        const filteredPosts = posts.data?.content?.filter((p: any) => 
          (p.title || '').toLowerCase().includes(q) || 
          (p.content || '').toLowerCase().includes(q)
        ) || [];
        
        results.push(...filteredPosts.slice(0, 5).map((p: any) => ({
          type: 'post',
          id: p.id,
          title: p.title,
          content: (p.content || '').slice(0, 120) + ((p.content || '').length > 120 ? '...' : ''),
          url: `/dashboard/posts/${p.id}`
        })));
        
        // Search users
        const filteredUsers = Array.isArray(users) ? users.filter((u: any) => 
          (u.name || '').toLowerCase().includes(q) || 
          (u.email || '').toLowerCase().includes(q)
        ) : [];
        
        results.push(...filteredUsers.slice(0, 3).map((u: any) => ({
          type: 'user',
          id: u.id,
          title: u.name,
          content: u.email,
          url: `/dashboard/admin/users`
        })));
        
        // Search comments
        const filteredComments = comments.data?.content?.filter((c: any) => 
          (c.content || '').toLowerCase().includes(q)
        ) || [];
        
        results.push(...filteredComments.slice(0, 3).map((c: any) => ({
          type: 'comment',
          id: c.id,
          title: 'Comment',
          content: (c.content || '').slice(0, 100) + ((c.content || '').length > 100 ? '...' : ''),
          url: `/dashboard/comments`
        })));
        
        if (active) setSearchResults(results);
      } catch (e) {
        if (active) setSearchResults([]);
      }
    })();
    return () => { active = false; };
  }, [debouncedTerm]);

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
            elevation={0}
            sx={{
              bgcolor: 'background.paper',
              color: 'text.primary',
              borderBottom: 1,
              borderColor: 'divider',
              zIndex: theme.zIndex.drawer + 1,
              height: '50px',
            }}
         >
           <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 }, minHeight: '50px !important', height: '50px' }}>
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
             </Box>

             {/* Center Section - Search (desktop & tablet) */}
             {(!isMobile) && (
                 <SearchWrapper>
                   <SearchIconWrapper>
                     <Search size={16} />
                   </SearchIconWrapper>
                   <div style={{ position: 'relative' }} ref={searchRef}>
                     <StyledInputBase
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         placeholder="Search"
                         inputProps={{ 'aria-label': 'search' }}
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                             // navigate to home with query
                             navigate(`/?q=${encodeURIComponent(searchTerm)}`);
                             setSearchResults([]);
                             setSearchOpen(false);
                           }
                         }}
                     />

                     {/* Dropdown results */}
                     {searchResults.length > 0 && (
                       <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, boxShadow: theme.shadows[8], zIndex: 1600, maxHeight: 360, overflow: 'auto', borderRadius: 4, marginTop: 4 }}>
                         {searchResults.map((r) => (
                           <div key={`${r.type}-${r.id}`} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: `1px solid ${theme.palette.divider}` }} onClick={() => { navigate(r.url); setSearchTerm(''); setSearchResults([]); }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                               <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.contrastText, textTransform: 'uppercase' }}>{r.type}</span>
                               <div style={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '0.875rem' }}>{r.title}</div>
                             </div>
                             <div style={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>{r.content}</div>
                           </div>
                         ))}
                         <div style={{ padding: 8, textAlign: 'center' }}>
                           <button onClick={() => { navigate(`/?q=${encodeURIComponent(searchTerm)}`); setSearchResults([]); }} style={{ background: 'transparent', border: 'none', color: theme.palette.primary.main, cursor: 'pointer', fontSize: '0.875rem' }}>See all results</button>
                         </div>
                       </div>
                     )}
                   </div>
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

               {/* AI Chat Icon */}
               <Tooltip title="AI Chat">
                 <IconButton
                     component={Link}
                     to="/dashboard/ai-chat"
                     color="inherit"
                     sx={{ 
                       '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } 
                     }}
                 >
                   <MessageCircle size={20} />
                 </IconButton>
               </Tooltip>

               {/* Theme Mode Toggle (top bar) - show on mobile and tablet; desktop uses right rail */}
               { (isMobile || (!isDesktop && !isMobile)) && (
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
               )}

               {/* Notifications (top bar) - visible on mobile & tablet; desktop uses right rail */}
               {(isMobile || (!isDesktop && !isMobile)) && (
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
               )}


               {/* Profile Section - show on mobile & tablet; desktop profile moved to right rail */}
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                   <IconButton
                       onClick={handleProfileClick}
                       sx={{
                         p: 0.5,
                         '&:hover': {
                           bgcolor: 'rgba(0,0,0,0.04)',
                         },
                       }}
                   >
                     <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1 }}>
                       <div
                         style={{
                           width: 24,
                           height: 24,
                           backgroundColor: user?.avatar ? 'transparent' : theme.palette.primary.main,
                           color: 'white',
                           fontWeight: 'bold',
                           fontSize: '0.75rem',
                           borderRadius: '50%',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           overflow: 'hidden'
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
                     {!isMobile && (
                       <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                         {user?.name || 'User'}
                       </Typography>
                     )}
                     <ChevronDown size={14} color={theme.palette.text.secondary} />
                   </Box>
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
                 mt: 0.5,
                 minWidth: 200,
                 borderRadius: 0,
                 overflow: 'visible',
                 filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
               },
             }}
             transformOrigin={{ horizontal: 'right', vertical: 'top' }}
             anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
         >
           {/* User Info Section */}
           <Box sx={{ p: 2 }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
               <div
                 style={{
                   width: 48,
                   height: 48,
                   backgroundColor: user?.avatar ? 'transparent' : theme.palette.primary.main,
                   color: 'white',
                   fontWeight: 'bold',
                   fontSize: '1rem',
                   borderRadius: '50%',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   overflow: 'hidden'
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
               <Box>
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
               </Box>
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
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="Search posts, users, comments..."
                   autoFocus
                   sx={{ fontSize: '1rem' }}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                       navigate(`/?q=${encodeURIComponent(searchTerm)}`);
                       setSearchOpen(false);
                     }
                   }}
               />
             </Box>
             {/* show results */}
             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
               {searchResults.map((r) => (
                 <Button key={`${r.type}-${r.id}`} startIcon={<Search size={14} />} sx={{ justifyContent: 'flex-start' }} component={Link} to={r.url} onClick={() => setSearchOpen(false)}>
                   <div style={{ textAlign: 'left' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                       <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, backgroundColor: theme.palette.primary.light, color: theme.palette.primary.contrastText, textTransform: 'uppercase' }}>{r.type}</span>
                       <div style={{ fontWeight: 600 }}>{r.title}</div>
                     </div>
                     <div style={{ fontSize: 12, color: theme.palette.text.secondary }}>{r.content}</div>
                   </div>
                 </Button>
               ))}
               <Button onClick={() => { navigate(`/?q=${encodeURIComponent(searchTerm)}`); setSearchOpen(false); }}>
                 See all results
               </Button>
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