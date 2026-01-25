// components/unauthorized.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

export const Unauthorized: React.FC = () => {
    const theme = useTheme();
    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.palette.background.default }}>
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4" style={{ color: theme.palette.error.main }}>403</h1>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: theme.palette.text.primary }}>Unauthorized Access</h2>
                <p style={{ color: theme.palette.text.secondary }} className="mb-6">
                    You don't have permission to access this page.
                </p>
                <div className="space-x-4">
                    <Link
                        to="/dashboard"
                        className="px-6 py-3 rounded-lg transition-colors"
                        style={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}
                    >
                        Go to Dashboard
                    </Link>
                    <Link
                        to="/home"
                        className="px-6 py-3 rounded-lg transition-colors"
                        style={{ backgroundColor: (theme.palette as any).custom?.chipBg ?? theme.palette.action.selected, color: theme.palette.text.primary }}
                    >
                        Go to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};