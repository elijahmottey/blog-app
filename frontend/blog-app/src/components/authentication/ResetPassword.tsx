import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress, Link as MuiLink, InputAdornment, IconButton } from '@mui/material';
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) {
            toast.error("Invalid or missing password reset token.");
            navigate('/auth/login');
        }
    }, [token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        try {
            setLoading(true);
            setError("");
            const response = await BackendApi.resetPassword({ token: token!, newPassword: password });
            toast.success(response.message || "Password reset successfully! You can now log in.");
            navigate('/auth/login');
        } catch (err: any) {
            setError(err.message || "Failed to reset password. The link might be expired.");
            toast.error(err.message || "Failed to reset password. The link might be expired.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) return null;

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
                                title="Reset Password"
                                subtitle="Enter your new password below."
                                size="medium"
                            />

                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
                                        New Password
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError("");
                                        }}
                                        placeholder="Enter your new password"
                                        variant="outlined"
                                        size="small"
                                        disabled={loading}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                        size="small"
                                                        disabled={loading}
                                                    >
                                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
                                        Confirm Password
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            setError("");
                                        }}
                                        placeholder="Confirm your new password"
                                        variant="outlined"
                                        size="small"
                                        disabled={loading}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        edge="end"
                                                        size="small"
                                                        disabled={loading}
                                                    >
                                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
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
                                    {loading ? <CircularProgress size={20} /> : 'Reset Password'}
                                </Button>

                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        <MuiLink
                                            component={Link}
                                            to="/auth/login"
                                            color="primary"
                                            sx={{ textDecoration: 'none', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
                                        >
                                            Cancel and return to login
                                        </MuiLink>
                                    </Typography>
                                </Box>
                            </Box>
                        </LIVBlogCard>
                    </div>
                </Box>
            </Box>
        </>
    );
};

export default ResetPassword;
