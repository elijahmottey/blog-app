import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Outlet } from 'react-router-dom';
import { DashboardNavbar } from './DashboardNavbar';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardRightRail } from './DashboardRightRail';

export const DashboardLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isPersistent = useMediaQuery(theme.breakpoints.up('md')); // md and up show persistent sidebar
  const isWide = useMediaQuery(theme.breakpoints.up('lg')); // lg and up use wider sidebar

  // Sidebar open by default on persistent layouts, closed on overlay layouts
  const [isSidebarOpen, setIsSidebarOpen] = useState(isPersistent);

  useEffect(() => {
    setIsSidebarOpen(isPersistent);
  }, [isPersistent]);

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
      {/* Left Sidebar - render as a column only on desktop; on tablet/mobile render overlay (no reserved width) */}
      {isPersistent ? (
        // Persistent left column on md+ (narrower on md, wider on lg)
        <div style={{ flex: '0 0 ' + (isWide ? '256px' : '220px') }}>
          <DashboardSidebar isOpen={isSidebarOpen} onClose={closeSidebar} isMobile={false} />
        </div>
      ) : (
        // Overlay sidebar on small tablets and mobile (no reserved layout space)
        <DashboardSidebar isOpen={isSidebarOpen} onClose={closeSidebar} isMobile={true} />
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Navbar (top) */}
        <DashboardNavbar onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} isMobile={!isPersistent} isDesktop={isWide} />

        {/* Page content */}
        <main style={{ flex: 1, overflowX: 'hidden' }}>
          <div style={{ paddingTop: 16, paddingBottom: 24 }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', paddingLeft: 12, paddingRight: 12 }}>
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Right rail - visible only on desktop */}
      <div style={{ flex: isWide ? '0 0 72px' : '0 0 0', display: isWide ? 'block' : 'none' }}>
        <DashboardRightRail isDesktop={isWide} />
      </div>
    </div>
  );
};