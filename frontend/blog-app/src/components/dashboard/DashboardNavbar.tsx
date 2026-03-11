import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  User,
  LogOut,
  Home,
  MessageSquare,
  FileText,
  Users,
  ChevronDown,
  HelpCircle,
  Shield,
  PenSquare
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
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationPanel } from './NotificationPanel';

interface DashboardNavbarProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
  isMobile: boolean;
  isDesktop?: boolean;
}

const SearchWrapper = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '2px',
  backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
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
  type: 'post' | 'user' | 'comment';
  id: number;
  title: string;
  content: string;
  url: string;
  role?: string;
  date?: string;
}

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ onMenuClick, isSidebarOpen, isMobile, isDesktop }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const { newPosts, newUsers, totalNotifications, markPostAsRead, markUserAsRead } = useNotifications(isAdmin);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const { mode, toggleMode } = useThemeMode();
  const searchRef = useRef<HTMLDivElement | null>(null);

  // Debounce search term
  useEffect(() => {
    const id = setTimeout(() => setDebouncedTerm(searchTerm.trim()), 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // Fetch and filter search results
  useEffect(() => {
    let active = true;
    if (debouncedTerm.length === 0) {
      setSearchResults([]);
      return;
    }
    (async () => {
      try {
        const postsPromise = BackendApi.getAllPost(0, 100);
        const commentsPromise = BackendApi.getAllPostComment(0, 100);
        const usersPromise = isAdmin ? BackendApi.getAllUsers(0, 100) : Promise.resolve({ content: [] } as any);

        const [postsRes, usersRes, commentsRes] = await Promise.all([postsPromise, usersPromise, commentsPromise]);
        
        const q = debouncedTerm.toLowerCase();
        const results: SearchResult[] = [];
        
        // Posts
        const posts = postsRes.data?.content || [];
        results.push(...posts
          .filter((p: any) => (p.title || '').toLowerCase().includes(q) || (p.content || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q))
          .slice(0, 5)
          .map((p: any) => ({
            type: 'post' as 'post',
            id: p.id,
            title: p.title || 'Untitled',
            content: (p.content || '').slice(0, 120) + '...',
            url: `/dashboard/posts/${p.id}`,
            date: p.createdAt
          }))
        );
        
        // Users
        const users = (usersRes as any).content || (usersRes as any).data?.content || [];
        results.push(...users
          .filter((u: any) => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q))
          .slice(0, 3)
          .map((u: any) => ({
            type: 'user' as 'user',
            id: u.id,
            title: u.name || 'Unknown User',
            content: u.email || '',
            url: isAdmin ? `/dashboard/admin/user/${u.id}/view` : `/profile/${u.name}`,
            role: u.role || 'USER',
            date: u.createdAt
          }))
        );
        
        // Comments
        const comments = commentsRes.data?.content || [];
        results.push(...comments
          .filter((c: any) => {
            const contentMatch = (c.content || '').toLowerCase().includes(q);
            const authorName = typeof c.users === 'object' ? c.users?.name : c.users;
            const authorMatch = (authorName || '').toLowerCase().includes(q);
            return contentMatch || authorMatch;
          })
          .slice(0, 3)
          .map((c: any) => {
            const authorName = typeof c.users === 'object' ? c.users?.name : c.users;
            const postId = typeof c.posts === 'object' ? c.posts?.id : (typeof c.posts === 'string' ? c.posts.split(',')[0] : c.posts);
            return {
              type: 'comment' as 'comment',
              id: c.id,
              title: `Comment by ${authorName || 'Anonymous'}`,
              content: (c.content || '').slice(0, 100) + '...',
              url: `/dashboard/posts/${postId || ''}`,
              date: c.createdAt
            };
          })
        );
        
        if (active) setSearchResults(results);
      } catch (e) {
        console.error('Search error:', e);
        if (active) setSearchResults([]);
      }
    })();
    return () => { active = false; };
  }, [debouncedTerm, isAdmin]);

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults([]);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleProfileClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/auth/login');
    handleProfileClose();
  };

  const handleSearchNavigation = (url: string) => {
    navigate(url);
    setSearchTerm('');
    setSearchResults([]);
    setSearchOpen(false);
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
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
               <IconButton edge="start" color="inherit" aria-label="menu" onClick={onMenuClick} sx={{ mr: 1 }}>
                 <Menu size={20} />
               </IconButton>
             </Box>

             {(!isMobile) && (
                 <SearchWrapper ref={searchRef}>
                   <SearchIconWrapper>
                     <Search size={16} />
                   </SearchIconWrapper>
                   <StyledInputBase
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       placeholder="Search posts, users, comments..."
                       inputProps={{ 'aria-label': 'search' }}
                   />
                   {searchResults.length > 0 && (
                     <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, boxShadow: theme.shadows[8], zIndex: 1600, maxHeight: 400, overflow: 'auto', borderRadius: 4, marginTop: 4 }}>
                       {searchResults.map((r) => {
                         const typeColor = r.type === 'post' ? theme.palette.primary.main : r.type === 'user' ? theme.palette.success.main : theme.palette.warning.main;
                         const TypeIcon = r.type === 'post' ? FileText : r.type === 'user' ? User : MessageSquare;
                         return (
                           <div key={`${r.type}-${r.id}`} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: `1px solid ${theme.palette.divider}` }} onClick={() => handleSearchNavigation(r.url)} onMouseEnter={(e) => e.currentTarget.style.background = theme.palette.action.hover} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                               <TypeIcon size={16} style={{ color: typeColor }} />
                               <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 12, backgroundColor: alpha(typeColor, 0.1), color: typeColor, textTransform: 'uppercase', fontWeight: 700 }}>{r.type}</span>
                               <div style={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '0.9rem', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                               {r.role && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 12, backgroundColor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main, textTransform: 'uppercase', fontWeight: 700 }}>{r.role}</span>}
                             </div>
                             <div style={{ fontSize: '0.8rem', color: theme.palette.text.secondary, marginLeft: 26, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.content}</div>
                             {r.date && <div style={{ fontSize: '0.7rem', color: theme.palette.text.disabled, marginLeft: 26, marginTop: 4 }}>{new Date(r.date).toLocaleDateString()}</div>}
                           </div>
                         );
                       })}
                     </div>
                   )}
                 </SearchWrapper>
             )}

             <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
               {isMobile && (
                   <Tooltip title="Search">
                     <IconButton color="inherit" onClick={() => setSearchOpen(true)}>
                       <Search size={20} />
                     </IconButton>
                   </Tooltip>
               )}
               <Tooltip title="Create Post">
                 <IconButton component={Link} to="/dashboard/posts/create" color="inherit">
                   <PenSquare size={20} />
                 </IconButton>
               </Tooltip>
               { (isMobile || (!isDesktop && !isMobile)) && (
                 <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
                     <Switch size="small" checked={mode === 'dark'} onChange={toggleMode} />
                   </Box>
                 </Tooltip>
               )}
               {(isMobile || (!isDesktop && !isMobile)) && <NotificationPanel />}
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                   <IconButton onClick={handleProfileClick} sx={{ p: 0.5 }}>
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
                         {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                       </Avatar>
                       {!isMobile && <Typography variant="body2">{user?.name || 'User'}</Typography>}
                       <ChevronDown size={14} />
                     </Box>
                   </IconButton>
               </Box>
             </Box>
           </Toolbar>
         </AppBar>

         <MuiMenu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleProfileClose} PaperProps={{ sx: { mt: 0.5, minWidth: 200 } }}>
           <Box sx={{ p: 2 }}>
             <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{user?.name || 'User'}</Typography>
             <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
             {isAdmin && <Chip label="Admin" size="small" color="error" variant="outlined" sx={{ mt: 1 }} icon={<Shield size={12} />} />}
           </Box>
           <Divider />
           <MenuItem component={Link} to="/dashboard/profile" onClick={handleProfileClose}><ListItemIcon><User size={18} /></ListItemIcon>My Profile</MenuItem>
           <MenuItem component={Link} to="/dashboard/help" onClick={handleProfileClose}><ListItemIcon><HelpCircle size={18} /></ListItemIcon>Help & Support</MenuItem>
           {isAdmin && <Divider />}
           {isAdmin && <MenuItem component={Link} to="/dashboard/admin/users" onClick={handleProfileClose}><ListItemIcon><Users size={18} /></ListItemIcon>Manage Users</MenuItem>}
           <Divider />
           <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}><ListItemIcon sx={{ color: 'error.main' }}><LogOut size={18} /></ListItemIcon>Logout</MenuItem>
         </MuiMenu>

         <Drawer anchor="top" open={searchOpen} onClose={() => setSearchOpen(false)}>
           <Box sx={{ p: 2 }} ref={searchRef}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
               <Search size={20} />
               <InputBase fullWidth value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." autoFocus />
             </Box>
             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
               {searchResults.map((r) => (
                 <Button key={`${r.type}-${r.id}`} startIcon={r.type === 'post' ? <FileText size={14} /> : r.type === 'user' ? <User size={14} /> : <MessageSquare size={14} />} sx={{ justifyContent: 'flex-start', textAlign: 'left' }} onClick={() => handleSearchNavigation(r.url)}>
                   <Box>
                     <Typography variant="body1">{r.title}</Typography>
                     <Typography variant="body2" color="text.secondary">{r.content}</Typography>
                   </Box>
                 </Button>
               ))}
             </Box>
           </Box>
         </Drawer>
       </>
  );
};