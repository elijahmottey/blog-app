import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Outlet } from 'react-router-dom';
import { DashboardNavbar } from './DashboardNavbar';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardRightRail } from './DashboardRightRail';
import { LIVBlogLayout } from '../ui';

export const DashboardLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isPersistent = useMediaQuery(theme.breakpoints.up('lg'));
  const isWide = useMediaQuery(theme.breakpoints.up('lg'));

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Don't auto-open sidebar based on screen size
  }, [isPersistent]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
        minHeight: '100vh', 
        backgroundColor: theme.palette.background.default, 
        display: 'flex',
        fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <DashboardNavbar onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} isMobile={!isPersistent} isDesktop={isWide} />

        <main style={{ flex: 1, overflowX: 'hidden' }}>
          <div className="aws-spacing-y-lg">
            <LIVBlogLayout.Container>
              <Outlet />
            </LIVBlogLayout.Container>
          </div>
        </main>
      </div>

      <div style={{ flex: isWide ? '0 0 72px' : '0 0 0', display: isWide ? 'block' : 'none' }}>
        <DashboardRightRail isDesktop={isWide} />
      </div>
    </div>
  );
};