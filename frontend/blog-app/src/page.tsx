import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"


//import { ProtectedRoute, AdminRoute } from "./service/guard.tsx";
import Navbar from "./components/navigation.tsx";
import Footer from "./components/footer.tsx";
import Home from "./components/home.tsx";
import {Login} from "./components/authentication/login.tsx";
import {Signup} from "./components/authentication/signup.tsx";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { DashboardRouter } from "./components/dashboard/DashboardRouter";
import { CreatePost } from "./components/dashboard/CreatePost";
import { PostsManagement } from "./components/dashboard/PostsManagement";
import { PostDetail } from "./components/dashboard/PostDetail";
import { EditPost } from "./components/dashboard/EditPost";
import { ProfileManagement } from "./components/dashboard/ProfileManagement";
import { CommentsManagement } from "./components/dashboard/CommentsManagement";
import About from "./components/About";
import Blog from "./components/Blog";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";
import { AIChatPage } from "./components/dashboard/AIChatPage";
import {AdminUsers} from "./components/dashboard/AdminUsers.tsx";



export const PagesRoute = () => {

    // @ts-ignore
    return (
        <BrowserRouter>
            <div >
                <main >
                    <Routes>
                        {/* Default redirect */}
                        <Route path="/" element={<>     <Navigate to="/home" replace /></>} />

                        {/* Guest routes */}
                        <Route path="/home" element={<>
                            <Navbar />
                            <Home />
                            <Footer/>
                        </>} />
                        <Route path="auth/login" element={<><Login /> <Footer/></>} />
                        <Route path="auth/signup" element={<><Signup /> <Footer/></>} />

                        {/* Public pages */}
                        <Route path="/about" element={<><Navbar /><About /><Footer/></>} />
                        <Route path="/blog" element={<><Navbar /><Blog /><Footer/></>} />
                        <Route path="/privacy-policy" element={<><Navbar /><PrivacyPolicy /><Footer/></>} />
                        <Route path="/terms-of-service" element={<><Navbar /><TermsOfService /><Footer/></>} />



                        {/* Dashboard routes */}
                        <Route path="/dashboard" element={<DashboardLayout />}>
                            <Route index element={<DashboardRouter />} />
                            {/* User routes */}
                            <Route path="posts" element={<PostsManagement />} />
                            <Route path="posts/create" element={<CreatePost />} />
                            <Route path="posts/:id" element={<PostDetail />} />
                            <Route path="posts/:id/edit" element={<EditPost />} />
                            <Route path="comments" element={<CommentsManagement/>} />
                            <Route path="profile" element={<ProfileManagement />} />
                            <Route path="ai-chat" element={<AIChatPage />} />
                            {/* Admin routes */}
                            <Route path="admin/users" element={<AdminUsers/>} />
                            <Route path="admin/content" element={<div>Content Moderation</div>} />
                            <Route path="admin/analytics" element={<div>Analytics</div>} />
                            <Route path="admin/settings" element={<div>System Settings</div>} />
                        </Route>

                    </Routes>
                </main>

            </div>
        </BrowserRouter>
    );
};
