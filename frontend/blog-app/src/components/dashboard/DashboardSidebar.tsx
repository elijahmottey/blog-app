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
  ChevronRight,
  Bot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Typography } from "@mui/material";
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
    { name: 'Dashboard', href: '/dashboard', icon: Home },
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
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Comments', href: '/dashboard/comments', icon: MessageSquare },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'AI Assistant', href: '/dashboard/ai-chat', icon: Bot },
  ];

  const adminMenuItems: SidebarItem[] = [
    { name: 'User Management', href: '/dashboard/admin/users', icon: Users },
    { name: 'Admin Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
  ];

  const menuItems = isAdmin ? [...userMenuItems, ...adminMenuItems] : userMenuItems;

  const renderMenuItem = (item: SidebarItem, level = 0, onClose?: () => void) => {
    const isActive = location.pathname === item.href;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.name);
    const Icon = item.icon as React.ElementType;

    return (
        <div key={`${item.href}-${level}`}>
          {hasChildren ? (
              <button
                  onClick={() => toggleExpanded(item.name)}
                  className="aws-button w-full flex items-center aws-spacing-sm transition-colors hover-subtle"
                  style={{
                    borderRadius: 8,
                    marginLeft: level > 0 ? 16 : 0,
                    minHeight: 44,
                    backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                    color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSize: '0.875rem',
                    border: 'none'
                  }}
              >
                <Icon size={20} style={{ marginRight: 12, flexShrink: 0, color: isActive ? theme.palette.primary.main : theme.palette.text.secondary }} />
                <span style={{ flex: 1, textAlign: 'left' }}>{item.name}</span>
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
          ) : (
              <Link
                  to={item.href}
                  onClick={onClose}
                  className="aws-button flex items-center aws-spacing-sm transition-colors hover-subtle"
                  style={{
                    borderRadius: 8,
                    marginLeft: level > 0 ? 16 : 0,
                    minHeight: 44,
                    backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                    color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                    textDecoration: 'none',
                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSize: '0.875rem'
                  }}
              >
                <Icon size={20} style={{ marginRight: 12, flexShrink: 0, color: isActive ? theme.palette.primary.main : theme.palette.text.secondary }} />
                {item.name}
              </Link>
          )}

          {hasChildren && isExpanded && (
              <div className="aws-spacing-y-xs" style={{ marginTop: 8 }}>
                {item.children!.map((child) => renderMenuItem(child, level + 1, onClose))}
              </div>
          )}
        </div>
    );
  };

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
        {isMobile && isOpen && (
            <div
                style={{ 
                  position: 'fixed', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0, 
                  zIndex: 1300, 
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)' 
                }}
                onClick={onClose}
            />
        )}

        <div
            className="aws-font"
            style={{
                position: isMobile ? 'fixed' : 'sticky',
                top: 0,
                height: '100vh',
                zIndex: isMobile ? 1400 : undefined,
                // Increased widths: desktop => 220px, mobile max => 320px
                width: isMobile ? 'min(80vw, 320px)' : 200,
                backgroundColor: theme.palette.background.paper,
                boxShadow: isMobile ? '0 10px 30px rgba(0,0,0,0.25)' : 'none',
                transform: isMobile ? (isOpen ? 'translateX(0)' : 'translateX(-110%)') : undefined,
                transition: isMobile ? 'transform 300ms ease-in-out' : undefined,
                overflow: 'auto',
                left: isMobile ? 0 : undefined,
                borderRight: `1px solid ${theme.palette.divider}`,
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
        >
          <div className="flex flex-col h-full">
            <Link to="/dashboard" className="aws-spacing-lg hover-scale" style={{ textDecoration: 'none' }}>
              <div className="flex items-center gap-2">
                <div
                    className="flex items-center justify-center"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText
                    }}
                >
                  <Typography className="aws-font" style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                    LIV
                  </Typography>
                </div>
                <Typography
                    className="aws-font aws-header-sm"
                    style={{
                      fontWeight: 'bold',
                      color: theme.palette.primary.main,
                      margin: 0
                    }}
                >
                  Blog
                </Typography>
              </div>
            </Link>

            <nav className="flex-1 aws-spacing-md" style={{ overflowY: 'auto' }}>
              <div className="space-y-1">
                {menuItems.map((item) => renderMenuItem(item, 0, onClose))}
              </div>
            </nav>

            <div className="aws-spacing-md" style={{ borderTop: `1px solid ${theme.palette.divider}` }}>
              <div className="aws-text-body text-center" style={{ color: theme.palette.text.secondary, fontSize: '0.75rem' }}>
                © {new Date().getFullYear()} LIVBlog
              </div>
            </div>
          </div>
        </div>
      </>
  );
 };
