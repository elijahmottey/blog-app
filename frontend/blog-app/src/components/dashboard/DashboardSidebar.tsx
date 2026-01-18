import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  MessageSquare,
  User,
  Settings,
  BarChart3,
  Users,
  Shield,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import {Box, Typography} from "@mui/material";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
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
        { name: 'Drafts', href: '/dashboard/posts/drafts', icon: FileText },
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

    return (
      <div key={item.name}>
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.name)}
            className={cn(
              'w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150',
              level > 0 && 'ml-4',
              isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            <span className="flex-1 text-left">{item.name}</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <Link
            to={item.href}
            onClick={onClose}
            className={cn(
              'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150',
              level > 0 && 'ml-4',
              isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {item.name}
          </Link>
        )}

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderMenuItem(child, level + 1, onClose))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay - only show when sidebar is open on mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isMobile
            ? 'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out'
            : 'lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 w-64 bg-white shadow-lg'
        } ${
          isMobile
            ? (isOpen ? 'translate-x-0' : '-translate-x-full')
            : ''
        }`}
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
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => renderMenuItem(item, 0, onClose))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              © {new Date().getFullYear()} LIVBlog. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};