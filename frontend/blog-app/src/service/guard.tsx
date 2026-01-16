import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ element: Component }: { element: any }) => {
    const location = useLocation();
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        // You can return a loading spinner here
        return <div>Loading...</div>;
    }

    return isAuthenticated ? (
        Component
    ) : (
        <Navigate to="/auth/login" replace state={{ from: location }} />
    );
};

export const AdminRoute = ({ element: Component }: { element: any }) => {
    const location = useLocation();
    const { isAdmin, loading, isAuthenticated } = useAuth();

    if (loading) {
        // You can return a loading spinner here
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace state={{ from: location }} />;
    }

    return isAdmin ? (
        Component
    ) : (
        <Navigate to="/unauthorized" replace /> // Or a dedicated "unauthorized" page
    );
}
