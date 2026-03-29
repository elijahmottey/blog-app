import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress, Link as MuiLink, alpha, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { LIVBlogCard, LIVBlogHeader } from '../ui';
import BackendApi from "../../service/BackendApi";

const LoginBackground = () => (
    <Box
        sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            backgroundImage: `url(/elibg.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.4)', // Subtle dark overlay to ensure text readability
            }
        }}
    />
);

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const theme = useTheme();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        try {
            setLoading(true);
            setError("");
            const response = await BackendApi.forgotPassword(email);
            setSuccess(true);
            toast.success(response.message || "Reset link sent!");
        } catch (err: any) {
            setError(err.message || "Failed to send reset link");
            toast.error(err.message || "Failed to send reset link");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <LoginBackground />
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-around' 
                }}>
                {/* Left Half - Logo */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(5px)', // Added slight blur to the logo area for a glass effect
                        minHeight: { xs: '200px', md: 'auto' },
                        order: { xs: 2, md: 1 }
                    }}
                >
                    <Box
                        component={Link}
                        to="/home"
                        className="hover-scale"
                        sx={{
                            display: 'block',
                            textDecoration: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <img
                            src="/LIV Blog logo design.png"
                            alt="LIV Blog"
                            style={{
                                maxWidth: '250px',
                                width: '100%',
                                height: 'auto',
                                display: 'block'
                            }}
                        />
                    </Box>
                </Box>

                {/* Right Half - Form */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: { xs: 2, md: 4 },
                        order: { xs: 1, md: 2 }
                    }}
                >
                    <Box style={{ width: '100%', maxWidth: '400px' }}>
                        <LIVBlogCard
                            variant="elevated"
                            padding="large"
                            className="hover-card"
                            style={{
                                width: '100%',
                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.95)', // Semi-transparent paper color based on theme
                                backdropFilter: 'blur(10px)', // Glassmorphism effect
                                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`
                            }}
                        >
                            <LIVBlogHeader
                                title="Forgot Password"
                                subtitle="Enter your email address and we'll send you a link to reset your password."
                                size="medium"
                            />

                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            {success ? (
                                <Box sx={{ textAlign: 'center', mt: 2 }}>
                                    <Alert severity="success" sx={{ mb: 3 }}>
                                        We've sent a password reset link to <strong>{email}</strong>. Please check your inbox.
                                    </Alert>
                                    <Button
                                        component={Link}
                                        to="/auth/login"
                                        variant="outlined"
                                        fullWidth
                                        className="hover-button"
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Return to Login
                                    </Button>
                                </Box>
                            ) : (
                                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
                                            Email Address
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setError("");
                                            }}
                                            placeholder="you@example.com"
                                            variant="outlined"
                                            size="small"
                                            disabled={loading}
                                            sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                                        />
                                    </Box>

                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        className="hover-button"
                                        disabled={loading}
                                        sx={{ mb: 3, borderRadius: 2 }}
                                    >
                                        {loading ? <CircularProgress size={20} /> : 'Send Reset Link'}
                                    </Button>

                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            Remembered your password?{' '}
                                            <MuiLink
                                                component={Link}
                                                to="/auth/login"
                                                variant="body2"
                                                color="primary"
                                                sx={{ textDecoration: 'none', fontWeight: 'bold', '&:hover': { textDecoration: 'underline' } }}
                                            >
                                                Log in
                                            </MuiLink>
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </LIVBlogCard>
                    </Box>
                </Box>
                </Box>
                
                {/* Footer */}
                <Box
                    sx={{
                        textAlign: 'center',
                        padding: 2,
                        fontSize:9,
                        color: 'white',
                        textShadow: '0px 1px 2px rgba(0,0,0,0.8)'
                    }}
                >
                    <p   >
                        By continuing, you agree to LIVBlog Customer Agreement or other agreement for LIVBlog services, and the Privacy Notice. This site uses essential cookies. See our Cookie Notice for more information.
                        <br />
                        LIVBlog Marketing
                        <br />
                        © 2026 LIVBlog, Inc. or its affiliates. All rights reserved.
                    </p>
                </Box>
            </Box>
        </>
    );
};

export default ForgotPassword;