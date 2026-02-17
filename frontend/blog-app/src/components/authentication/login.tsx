import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import OAuth2LoginButtons from "../OAuth2LoginButtons";
import {
    Button,
    TextField,
    Box,
    Typography,
    InputAdornment,
    IconButton,
    Alert,
    useTheme,
    Link as MuiLink,
    CircularProgress,
    Divider,
} from '@mui/material';
import { LIVBlogCard, LIVBlogHeader, LIVBlogLayout } from '../ui';
import { useAuth } from "../../context/AuthContext";

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

interface LoginCredentials {
    email: string;
    password: string;
}

export const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    //@ts-ignore
    const { login, isAuthenticated } = useAuth();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    const validateForm = () => {
        if (!email.trim()) {
            setError("Enter your email");
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Enter a valid email address");
            return false;
        }
        if (!password.trim()) {
            setError("Enter your password");
            return false;
        }
        setError("");
        return true;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setLoading(true);
            setError("");

            const credentials: LoginCredentials = { email, password };
            await login(credentials);

            toast.success("Sign-in successful");
            setTimeout(() => {
                const from = location.state?.from?.pathname || '/dashboard';
                navigate(from, { replace: true });
            }, 500);

        } catch (err: any) {
            console.error("Login error:", err);
            let errorMessage = "Your email or password is incorrect";

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }

            toast.error(errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AWSBackground />
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-around' }}>
                {/* Left Half - Logo */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Box
                            component={Link}
                            to="/home"
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
                                    maxWidth: '300px',
                                    height: 'auto',
                                    display: 'block'
                                }}
                            />
                        </Box>
                    </motion.div>
                </Box>

                {/* Right Half - Form */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 4
                    }}
                >
                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{ width: '100%', maxWidth: 400 }}
                    >
                        <LIVBlogCard
                            variant="elevated"
                            padding="large"
                            style={{
                                width: '100%',
                            }}
                        >
                            <LIVBlogHeader
                                title="Welcome Back"
                                subtitle="Sign in to your LIV Blog account"
                                size="medium"
                            />

                            {/* OAuth2 Login */}
                            <Box sx={{ mb: 3 }}>
                                <OAuth2LoginButtons />
                                <Divider sx={{ my: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        OR CONTINUE WITH
                                    </Typography>
                                </Divider>
                            </Box>

                            {/* Error Alert */}
                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            {/* Form */}
                            <Box component="form" onSubmit={handleSubmit}>
                                <Box sx={{ mb: 2 }}>
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
                                        placeholder="Enter your email"
                                        variant="outlined"
                                        size="small"
                                        disabled={loading}
                                    />
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
                                        Password
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError("");
                                        }}
                                        placeholder="Enter your password"
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
                                    
                                    {/* Forgot Password Link */}
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                        <MuiLink
                                            component={Link}
                                            to="/auth/forgot-password"
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                                textDecoration: 'none',
                                                '&:hover': { textDecoration: 'underline' },
                                                cursor: loading ? 'not-allowed' : 'pointer'
                                            }}
                                            onClick={(e) => loading && e.preventDefault()}
                                        >
                                            Forgot your password?
                                        </MuiLink>
                                    </Box>
                                </Box>

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={loading}
                                    sx={{ mb: 2 }}
                                >
                                    {loading ? <CircularProgress size={20} /> : 'Sign In'}
                                </Button>
                            </Box>

                            {/* Create Account Link */}
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                                    New to LIV Blog?
                                </Typography>
                                <Button
                                    component={Link}
                                    to="/auth/signup"
                                    variant="outlined"
                                    fullWidth
                                    disabled={loading}
                                >
                                    Create your LIV Blog account
                                </Button>
                            </Box>
                        </LIVBlogCard>
                    </motion.div>
                </Box>
                </Box>
                
                {/* Footer */}
                <Box
                    sx={{
                        textAlign: 'center',
                        padding: 2,
                        fontSize:9
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