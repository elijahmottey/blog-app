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
            <Box sx={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                p: 2
            }}>
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: '420px'
                    }}
                >
                    <LIVBlogCard
                        variant="outlined"
                        padding="large"
                        style={{
                            backgroundColor: alpha(theme.palette.background.paper, 0.85),
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                            borderRadius: theme.shape.borderRadius * 3,
                            boxShadow: theme.shadows[12]
                        }}
                    >
                        <LIVBlogHeader
                            title="Forgot Password"
                            subtitle="Enter your email address and we'll send you a link to reset your password."
                            size="medium"
                            sx={{ textAlign: 'center', mb: 3 }}
                        />

                        {error && (
                            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {success ? (
                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                                    We've sent a password reset link to <strong>{email}</strong>. Please check your inbox.
                                </Alert>
                                <Button
                                    component={Link}
                                    to="/auth/login"
                                    variant="outlined"
                                    fullWidth
                                    size="large"
                                    sx={{ borderRadius: 2 }}
                                >
                                    Return to Login
                                </Button>
                            </Box>
                        ) : (
                            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
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
                                        size="medium"
                                        disabled={loading}
                                        sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                                    />
                                </Box>

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={loading}
                                    sx={{ mb: 3, py: 1.5, borderRadius: 2, boxShadow: theme.shadows[4] }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
                                </Button>

                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Remembered your password?{' '}
                                        <MuiLink
                                            component={Link}
                                            to="/auth/login"
                                            variant="body2"
                                            fontWeight="bold"
                                            color="primary.main"
                                            sx={{
                                                textDecoration: 'none',
                                                '&:hover': { textDecoration: 'underline' },
                                            }}
                                        >
                                            Sign In
                                        </MuiLink>
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </LIVBlogCard>
                </Box>
            </Box>
        </>
    );
};

export default ForgotPassword;