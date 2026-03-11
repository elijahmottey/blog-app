import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { LIVBlogCard, LIVBlogHeader } from '../ui';
import BackendApi from "../../service/BackendApi";

const AWSBackground = () => (
    <Box
        sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `
                    radial-gradient(circle at 20% 80%, rgba(255, 153, 0, 0.08) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255, 153, 0, 0.06) 0%, transparent 50%),
                    radial-gradient(circle at 40% 40%, rgba(255, 153, 0, 0.04) 0%, transparent 50%)
                `,
            },
            '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `
                    linear-gradient(90deg, transparent 0%, rgba(255, 153, 0, 0.03) 50%, transparent 100%),
                    linear-gradient(0deg, transparent 0%, rgba(255, 153, 0, 0.03) 50%, transparent 100%)
                `,
            }
        }}
    />
);

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

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
            <AWSBackground />
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: { xs: 2, md: 4 }
                    }}
                >
                    <div style={{ width: '100%', maxWidth: '400px' }}>
                        <LIVBlogCard
                            variant="elevated"
                            padding="large"
                            className="hover-card"
                            style={{ width: '100%' }}
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
                                    >
                                        Return to Login
                                    </Button>
                                </Box>
                            ) : (
                                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
                                            Email
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setError("");
                                            }}
                                            placeholder="name@example.com"
                                            variant="outlined"
                                            size="small"
                                            disabled={loading}
                                        />
                                    </Box>

                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        className="hover-button"
                                        disabled={loading}
                                        sx={{ mb: 3 }}
                                    >
                                        {loading ? <CircularProgress size={20} /> : 'Send Reset Link'}
                                    </Button>

                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            Remembered your password?{' '}
                                            <MuiLink
                                                component={Link}
                                                to="/auth/login"
                                                color="primary"
                                                sx={{ textDecoration: 'none', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
                                            >
                                                Log in
                                            </MuiLink>
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </LIVBlogCard>
                    </div>
                </Box>
            </Box>
        </>
    );
};

export default ForgotPassword;
