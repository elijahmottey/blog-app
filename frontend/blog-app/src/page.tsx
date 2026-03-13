import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ProtectedRoute, AdminRoute, GuestRoute } from "./service/guard.tsx";
import Navbar from "./components/navigation.tsx";
import Footer from "./components/footer.tsx";
import Home from "./components/home.tsx";
import { Login } from "./components/authentication/login.tsx";
import { Signup } from "./components/authentication/signup.tsx";
import ForgotPassword from "./components/authentication/ForgotPassword.tsx";
import ResetPassword from "./components/authentication/ResetPassword.tsx";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { DashboardRouter } from "./components/dashboard/DashboardRouter";
import { CreatePost } from "./components/dashboard/CreatePost";
import { PostsManagement } from "./components/dashboard/PostsManagement";
import { PostDetail } from "./components/dashboard/PostDetail";
import { EditPost } from "./components/dashboard/EditPost";
import { ProfileManagement } from "./components/dashboard/ProfileManagement";
import { CommentsManagement } from "./components/dashboard/CommentsManagement";
import { DraftsManagement } from "./components/dashboard/DraftsManagement";
import { UserAnalytics } from "./components/dashboard/UserAnalytics";
import About from "./components/About";
import Blog from "./components/Blog";
import CategoryView from "./components/CategoryView";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";
import { AIChatPage } from "./components/dashboard/AIChatPage";
import { NotFound } from "./components/not-found.tsx";
import { AdminUsers } from "./components/dashboard/AdminUsers.tsx";
import { Unauthorized } from "./components/unauthorized.tsx";
import { AnalyticsView } from "./components/dashboard/AnalyticsView.tsx";
import { UserActivityPage } from "./components/dashboard/UserActivityPage.tsx";
import { AuthorProfile } from "./components/dashboard/AuthorProfile.tsx";
import OAuth2RedirectHandler from "./components/OAuth2RedirectHandler.tsx";
import { ReportedPosts } from "./components/dashboard/ReportedPosts.tsx";
import { HelpSupport } from "./components/dashboard/HelpSupport.tsx";
import { LIVSave } from "./components/dashboard/LIVSave";
import { MessagesManagement } from "./components/dashboard/MessagesManagement.tsx";

export const PagesRoute = () => {
    return (
        <BrowserRouter>
            <div>
                <main>
                    <Routes>
                        {/* Default redirect */}
                        <Route path="/" element={<Navigate to="/home" replace />} />

                        {/* OAuth2 redirect handler */}
                        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

                        {/* Guest routes - only accessible when NOT logged in */}
                        <Route element={<GuestRoute />}>
                            <Route
                                path="/home"
                                element={
                                    <>
                                        <Navbar />
                                        <Home />
                                        <Footer />
                                    </>
                                }
                            />
                            <Route
                                path="/auth/login"
                                element={
                                    <>
                                        <Login />

                                    </>
                                }
                            />
                            <Route
                                path="/auth/signup"
                                element={
                                    <>
                                        <Signup />

                                    </>
                                }
                            />
                            <Route
                                path="/auth/forgot-password"
                                element={
                                    <>
                                        <ForgotPassword />
                                    </>
                                }
                            />
                            <Route
                                path="/auth/reset-password"
                                element={
                                    <>
                                        <ResetPassword />
                                    </>
                                }
                            />
                        </Route>

                        {/* Public pages (accessible to everyone) */}
                        <Route
                            path="/about"
                            element={
                                <>
                                    <Navbar />
                                    <About />
                                    <Footer />
                                </>
                            }
                        />
                        <Route
                            path="/blog"
                            element={
                                <>
                                    <Navbar />
                                    <Blog />
                                    <Footer />
                                </>
                            }
                        />
                        <Route
                            path="/blog/category/:category"
                            element={
                                <>
                                    <Navbar />
                                    <CategoryView />
                                    <Footer />
                                </>
                            }
                        />
                        <Route
                            path="/privacy-policy"
                            element={
                                <>
                                    <Navbar />
                                    <PrivacyPolicy />
                                    <Footer />
                                </>
                            }
                        />
                        <Route
                            path="/terms-of-service"
                            element={
                                <>
                                    <Navbar />
                                    <TermsOfService />
                                    <Footer />
                                </>
                            }
                        />

                        {/* Protected routes - require authentication */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/dashboard" element={<DashboardLayout />}>
                                <Route index element={<DashboardRouter />} />
                                {/* User routes - accessible to all authenticated users */}
                                <Route path="posts" element={<PostsManagement />} />
                                <Route path="posts/create" element={<CreatePost />} />
                                <Route path="posts/:id" element={<PostDetail />} />
                                <Route path="posts/:id/edit" element={<EditPost />} />
                                <Route path="drafts" element={<DraftsManagement />} />
                                <Route path="analytics" element={<UserAnalytics />} />
                                <Route path="comments" element={<CommentsManagement />} />
                                <Route path="profile" element={<ProfileManagement />} />
                                <Route path="ai-chat" element={<AIChatPage />} />
                                <Route path="help" element={<HelpSupport />} />
                                <Route path="profile/:username" element={<AuthorProfile />} />
                                <Route path="livsave" element={<LIVSave />} />
                                <Route path="messages" element={<MessagesManagement />} />

                                {/* Admin-only routes - nested inside AdminRoute */}
                                <Route element={<AdminRoute />}>
                                    <Route path="admin/users" element={<AdminUsers />} />
                                    <Route path="admin/user/:id/view" element={<UserActivityPage />} />
                                    <Route path="admin/analytics" element={<> <AnalyticsView /></>} />
                                    <Route path="admin/reports" element={<ReportedPosts />} />
                                </Route>
                            </Route>
                        </Route>

                        {/* Unauthorized page */}
                        <Route path="/unauthorized" element={<Unauthorized />} />

                        {/* 404 route */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
};