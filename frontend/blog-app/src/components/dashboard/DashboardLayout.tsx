import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Outlet } from 'react-router-dom';
import { DashboardNavbar } from './DashboardNavbar';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardRightRail } from './DashboardRightRail';
import { LIVBlogLayout } from '../ui';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { AIChat } from './AIChat';

export const DashboardLayout: React.FC = () => {
  useDocumentTitle('LIVBlog - Dashboard');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isPersistent = useMediaQuery(theme.breakpoints.up('lg'));
  const isWide = useMediaQuery(theme.breakpoints.up('lg'));

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  useEffect(() => {
    // Don't auto-open sidebar based on screen size
  }, [isPersistent]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleAiChat = () => {
    setIsAiChatOpen(!isAiChatOpen);
  };

  const closeSidebar = () => {
    if (!isPersistent) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div
      className="aws-font"
      style={{
        height: '100vh',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden' // Ensure the entire viewport is used and scrolling is handled internally
      }}
    >
      {isPersistent ? (
        isSidebarOpen && (
          <div style={{ flex: '0 0 ' + (isWide ? '200px' : '176px') }}>
            <DashboardSidebar isOpen={isSidebarOpen} onClose={closeSidebar} isMobile={false} />
          </div>
        )
      ) : (
        <DashboardSidebar isOpen={isSidebarOpen} onClose={closeSidebar} isMobile={true} />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, transition: 'all 0.3s ease', height: '100%' }}>
        <DashboardNavbar onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} isMobile={!isPersistent} isDesktop={isWide} />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            <div className="aws-spacing-y-lg">
              <LIVBlogLayout.Container>
                <Outlet />
              </LIVBlogLayout.Container>
            </div>
          </main>

          {/* AI Chat Side Panel */}
          {/* We only render this container if it's open or transitioning, but using width/opacity for transition */}
          <div style={{
            width: isAiChatOpen ? (isWide ? '400px' : '350px') : '0px',
            opacity: isAiChatOpen ? 1 : 0,
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            borderLeft: isAiChatOpen ? `1px solid ${theme.palette.divider}` : 'none',
            backgroundColor: theme.palette.background.paper,
            display: 'flex',
            flexDirection: 'column',
            height: '100%', // Full height of the parent container
            position: 'relative' // Ensure it's positioned correctly within the flex container
          }}>
            {/* Render AIChat only when width is significant to avoid layout thrashing, or keep mounted for state preservation */}
            <AIChat variant="sidebar" onClose={() => setIsAiChatOpen(false)} />
          </div>
        </div>
      </div>

      <div style={{ flex: isWide ? '0 0 72px' : '0 0 0', display: isWide ? 'block' : 'none', height: '100%' }}>
        <DashboardRightRail isDesktop={isWide} onToggleAiChat={toggleAiChat} isAiChatOpen={isAiChatOpen} />
      </div>
    </div>
  );
};