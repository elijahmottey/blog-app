// service/guard.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ProtectedRoute - for authenticated users only (using Outlet pattern)
export const ProtectedRoute = () => {
    const location = useLocation();
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace state={{ from: location }} />;
    }

    return <Outlet />; // This will render the child routes
};

// AdminRoute - for admin users only (using Outlet pattern)
export const AdminRoute = () => {
    const location = useLocation();
    const { isAdmin, loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace state={{ from: location }} />;
    }

    if (!isAdmin) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />; // This will render the child admin routes
};

// GuestRoute - for non-authenticated users only (using Outlet pattern)
export const GuestRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};