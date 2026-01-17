import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardNavbar } from './DashboardNavbar';
import { DashboardSidebar } from './DashboardSidebar';
import { AIChatWidget } from './AIChatWidget';

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        isMobile={isMobile}
      />

      {/* Main content area */}
      <div className={`flex-1 flex flex-col min-w-0 ${isMobile ? '' : 'lg:ml-64'}`}>
        {/* Navbar */}
        <DashboardNavbar
          onMenuClick={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          isMobile={isMobile}
        />

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* AI Chat Widget - Fixed position */}
      <div className="fixed bottom-4 right-4 z-50">
        <AIChatWidget floating={true} />
      </div>
    </div>
  );
};