// components/unauthorized.tsx
import React from 'react';
import { Link } from 'react-router-dom';

export const Unauthorized: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Unauthorized Access</h2>
                <p className="text-gray-600 mb-6">
                    You don't have permission to access this page.
                </p>
                <div className="space-x-4">
                    <Link
                        to="/dashboard"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go to Dashboard
                    </Link>
                    <Link
                        to="/home"
                        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Go to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};