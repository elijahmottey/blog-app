import BackendApi from "./BackendApi.ts";
import { useLocation, Navigate } from "react-router-dom";



export const ProtectedRoute = ({ element:Component}:{element:any}) => {
    const location = useLocation();

    return BackendApi.isAuthenticated() ? (
        Component
    ) : (
        <Navigate to="/login" replace state={{ from: location }} />
    );
};

export const AdminRoute = ({ element:Component}:{element:any}) => {
    const location = useLocation();
    return BackendApi.isAdmin() ? (Component)
        :(<Navigate to="/login" replace state={{ from: location }} />);
}


