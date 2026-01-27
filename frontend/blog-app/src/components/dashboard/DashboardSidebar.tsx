import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  MessageSquare,
  User,
  BarChart3,
  Users,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {Box, Typography} from "@mui/material";
import { useTheme, alpha } from '@mui/material/styles';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
  children?: SidebarItem[];
}

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, onClose, isMobile }) => {
   const { isAdmin } = useAuth();
   const location = useLocation();
   const theme = useTheme();
   const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  const toggleExpanded = (itemName: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemName)) {
      newExpanded.delete(itemName);
    } else {
      newExpanded.add(itemName);
    }
    setExpandedItems(newExpanded);
  };

  const userMenuItems: SidebarItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'Posts',
      href: '/dashboard/posts',
      icon: FileText,
      children: [
        { name: 'All Posts', href: '/dashboard/posts', icon: FileText },
        { name: 'Create Post', href: '/dashboard/posts/create', icon: FileText },
        { name: 'Drafts', href: '/dashboard/drafts', icon: FileText },
      ],
    },
    {
      name: 'Comments',
      href: '/dashboard/comments',
      icon: MessageSquare,
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: User,
    },
    {
      name: 'AI Chat',
      href: '/dashboard/ai-chat',
      icon: MessageSquare,
    },
  ];

  const adminMenuItems: SidebarItem[] = [
    {
      name: 'User Management',
      href: '/dashboard/admin/users',
      icon: Users,
    },

    {
      name: 'Analytics',
      href: '/dashboard/admin/analytics',
      icon: BarChart3,
    },

  ];

  const menuItems = isAdmin ? [...userMenuItems, ...adminMenuItems] : userMenuItems;

  const renderMenuItem = (item: SidebarItem, level = 0, onClose?: () => void) => {
    const isActive = location.pathname === item.href;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.name);

    const Icon = item.icon as React.ElementType;

    return (
        <div key={item.name}>
          {hasChildren ? (
              <button
                  onClick={() => toggleExpanded(item.name)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    borderRadius: 8,
                    transition: 'background-color 150ms',
                    marginLeft: level > 0 ? 16 : 0,
                    minHeight: 44,
                    backgroundColor: isActive ? (theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.primary.main, 0.12)) : 'transparent',
                    color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                  }}
              >
                <Icon style={{ marginRight: 12, width: 20, height: 20, flexShrink: 0, color: isActive ? theme.palette.primary.main : (theme.palette as any).custom?.icon ?? theme.palette.text.secondary }} />
                <span style={{ flex: 1, textAlign: 'left' }}>{item.name}</span>
                {isExpanded ? (
                    <ChevronDown style={{ width: 16, height: 16 }} />
                ) : (
                    <ChevronRight style={{ width: 16, height: 16 }} />
                )}
              </button>
          ) : (
              <Link
                  to={item.href}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    borderRadius: 8,
                    transition: 'background-color 150ms',
                    marginLeft: level > 0 ? 16 : 0,
                    minHeight: 44,
                    backgroundColor: isActive ? (theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.primary.main, 0.12)) : 'transparent',
                    color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                    textDecoration: 'none',
                  }}
              >
                <Icon style={{ marginRight: 12, width: 20, height: 20, flexShrink: 0, color: isActive ? theme.palette.primary.main : (theme.palette as any).custom?.icon ?? theme.palette.text.secondary }} />
                {item.name}
              </Link>
          )}

          {hasChildren && isExpanded && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {item.children!.map((child) => renderMenuItem(child, level + 1, onClose))}
              </div>
          )}
        </div>
    );
  };

  // Prevent body scroll when overlay sidebar is open on mobile
  React.useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobile, isOpen]);

  return (
      <>
        {/* Mobile overlay - only show when sidebar is open on mobile */}
        {isMobile && isOpen && (
            <div
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1300, backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)' }}
                onClick={onClose}
            />
        )}

        {/* Sidebar */}
        <div
            style={{
                position: isMobile ? 'fixed' : 'sticky',
                top: 0,
                height: '100vh',
                zIndex: isMobile ? 1400 : undefined,
                width: isMobile ? 'min(80vw, 320px)' : 256,
                boxSizing: 'border-box',
                backgroundColor: theme.palette.background.paper,
                boxShadow: isMobile ? '0 10px 30px rgba(0,0,0,0.25)' : 'none',
                transform: isMobile ? (isOpen ? 'translateX(0)' : 'translateX(-110%)') : undefined,
                transition: isMobile ? 'transform 300ms ease-in-out' : undefined,
                overflow: 'auto',
                left: isMobile ? 0 : undefined,
            }}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <Link to="/dashboard" style={{ textDecoration: 'none',paddingLeft:"2rem" }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 ,paddingTop:'1.5rem' ,paddingLeft:"2rem"}}>
                <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                >
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                    LIV
                  </Typography>
                </Box>
                <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      color: 'primary.main',
                      display: { xs: 'none', sm: 'block' },
                    }}
                >
                  Blog
                </Typography>
              </Box>
            </Link>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '1.5rem 1rem', gap: 8, overflowY: 'auto' }}>
              {menuItems.map((item) => renderMenuItem(item, 0, onClose))}
            </nav>

            {/* Footer */}
            <div style={{ padding: 16, borderTop: `1px solid ${theme.palette.divider}` }}>
              <div style={{ fontSize: '0.75rem', color: theme.palette.text.secondary, textAlign: 'center' }}>
                © {new Date().getFullYear()} LIVBlog. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </>
  );
 };
