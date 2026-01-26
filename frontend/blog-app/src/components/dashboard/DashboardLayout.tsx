import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Outlet } from 'react-router-dom';
import { DashboardNavbar } from './DashboardNavbar';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardRightRail } from './DashboardRightRail';

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const theme = useTheme();

  // Check if mobile on initial render and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true); // Keep sidebar open on desktop
      } else {
        setIsSidebarOpen(false); // Close sidebar on mobile by default
      }
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.palette.background.default, display: 'flex' }}>
      {/* Left Sidebar - always present on desktop, overlay on mobile */}
      <div style={{ flex: '0 0 256px' }}>
        <DashboardSidebar isOpen={isSidebarOpen} onClose={closeSidebar} isMobile={isMobile} />
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Navbar (top) */}
        <DashboardNavbar onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} isMobile={isMobile} />

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
        <DashboardRightRail isMobile={isMobile} />
      </div>
    </div>
  );
};