import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress, Link as MuiLink, InputAdornment, IconButton, alpha, useTheme } from '@mui/material';
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const theme = useTheme();

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
                            title="Reset Password"
                            subtitle="Enter your new password below."
                            size="medium"
                            sx={{ textAlign: 'center', mb: 3 }}
                        />

                        {error && (
                            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
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
                                    size="medium"
                                    disabled={loading}
                                    sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    size="small"
                                                    disabled={loading}
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
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
                                    size="medium"
                                    disabled={loading}
                                    sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    edge="end"
                                                    size="small"
                                                    disabled={loading}
                                                >
                                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                                size="large"
                                disabled={loading}
                                sx={{ mb: 3, py: 1.5, borderRadius: 2, boxShadow: theme.shadows[4] }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                            </Button>

                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    <MuiLink
                                        component={Link}
                                        to="/auth/login"
                                        variant="body2"
                                        fontWeight="bold"
                                        color="primary.main"
                                        sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                                    >
                                        Cancel and return to login
                                    </MuiLink>
                                </Typography>
                            </Box>
                        </Box>
                    </LIVBlogCard>
                </Box>
            </Box>
        </>
    );
};

export default ResetPassword;