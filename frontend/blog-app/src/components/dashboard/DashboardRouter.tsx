import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserDashboard } from './UserDashboard';
import { AdminDashboard } from './AdminDashboard';
import { LIVBlogLayout } from '../ui';

export const DashboardRouter: React.FC = () => {
  const { isAdmin, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <LIVBlogLayout.Container>
        <div className="aws-flex aws-items-center aws-justify-center" style={{ minHeight: '400px' }}>
          <div className="aws-spinner" style={{
            width: '32px',
            height: '32px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      </LIVBlogLayout.Container>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return isAdmin ? <AdminDashboard /> : <UserDashboard />;
};

// Add spinner animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);