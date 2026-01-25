import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Outlet } from 'react-router-dom';
import { DashboardNavbar } from './DashboardNavbar';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardRightRail } from './DashboardRightRail';

export const DashboardLayout: React.FC = () => {
  const theme = useTheme();
  const mdDown = useMediaQuery(theme.breakpoints.down('lg'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(!mdDown);

  useEffect(() => {
    // When breakpoint changes, adjust sidebar open state
    setIsSidebarOpen(!mdDown);
  }, [mdDown]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    if (mdDown) setIsSidebarOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.palette.background.default, display: 'flex' }}>
      {/* Left Sidebar - always present on desktop, overlay on mobile */}
      <div style={{ flex: '0 0 256px' }}>
        <DashboardSidebar isOpen={isSidebarOpen} onClose={closeSidebar} isMobile={mdDown} />
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Navbar (top) */}
        <DashboardNavbar onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} isMobile={mdDown} />

        {/* Page content */}
        <main style={{ flex: 1, overflowX: 'hidden' }}>
          <div style={{ paddingTop: 24, paddingBottom: 24 }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', paddingLeft: 16, paddingRight: 16 }}>
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Right rail - visible only on desktop */}
      <div style={{ flex: '0 0 72px' }}>
        <DashboardRightRail isMobile={mdDown} />
      </div>
    </div>
  );
};