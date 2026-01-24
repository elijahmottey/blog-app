import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    ArrowRight,
    ArrowLeft,
    Shield,
    XCircle,
    Check,
    Smartphone,
    Monitor,
    Tablet,
    LogIn,
} from "lucide-react";
import { toast } from "sonner";

// Material UI imports
import {
    Button,
    TextField,
    Box,
    Container,
    Typography,
    Paper,
    Stepper,
    Step,
    StepLabel,
    InputAdornment,
    IconButton,
    Alert,
    Card,
    CardContent,
    useTheme,
    useMediaQuery,
    Divider,
    Link as MuiLink,
    CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Import your AuthContext
import { useAuth } from "../../context/AuthContext";

// Custom styled components
const GradientPaper = styled(Paper)(({ theme }) => ({
    background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
}));

const StepIconContainer = styled('div')<{ completed: boolean; active: boolean }>(
    ({ theme, completed, active }) => ({
        width: 32,
        height: 32,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: completed
            ? theme.palette.success.main
            : active
                ? theme.palette.primary.main
                : theme.palette.grey[300],
        color: completed || active ? theme.palette.common.white : theme.palette.grey[600],
        fontWeight: 600,
        fontSize: '0.875rem',
        transition: 'all 0.3s ease',
    })
);

// Google Sign-In Button
const GoogleButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#ffffff',
    color: '#3c4043',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    padding: '10px 16px',
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '14px',
    width: '100%',
    '&:hover': {
        backgroundColor: '#f8f9fa',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    '&:active': {
        backgroundColor: '#f1f3f4',
    },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '16px',
}));

const GoogleIcon = () => (
    <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);

// Type definitions
interface StepConfig {
    title: string;
    description: string;
    placeholder: string;
    type: 'email' | 'password';
    validation: () => boolean;
}

// Login credentials interface
interface LoginCredentials {
    email: string;
    password: string;
}

export const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    // Use the AuthContext
    const { login, isAuthenticated, googleLogin } = useAuth();

    // Refs for each input field
    const emailInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const inputRefs = [emailInputRef, passwordInputRef];

    const steps: StepConfig[] = [
        {
            title: "Email Address",
            description: "Enter the email address associated with your account",
            placeholder: "e.g., you@example.com",
            type: 'email',
            validation: () => {
                if (!email.trim()) {
                    setError("Please enter your email address");
                    return false;
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    setError("Please enter a valid email address");
                    return false;
                }
                return true;
            },
        },
        {
            title: "Password",
            description: "Enter your secure password",
            placeholder: "Your password",
            type: 'password',
            validation: () => {
                if (!password.trim()) {
                    setError("Please enter your password");
                    return false;
                }
                return true;
            },
        },
    ];

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    useEffect(() => {
        const currentRef = inputRefs[currentStep]?.current;
        if (currentRef) {
            setTimeout(() => currentRef.focus(), 100);
        }
    }, [currentStep]);

    // Initialize Google OAuth
    useEffect(() => {
        // Load Google OAuth script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleNext = () => {
        if (validateCurrentStep()) {
            if (!completedSteps.includes(currentStep)) {
                setCompletedSteps(prev => [...prev, currentStep]);
            }
            if (currentStep < steps.length - 1) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const validateCurrentStep = () => {
        const isValid = steps[currentStep].validation();
        if (!isValid) {
            setTimeout(() => setError(""), 5000);
            return false;
        }
        setError("");
        return true;
    };

    const CustomStepIcon = (props: any) => {
        const { active, completed, icon } = props;
        return (
            <StepIconContainer completed={completed} active={active}>
                {completed ? <Check fontSize="small" /> : icon}
            </StepIconContainer>
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (currentStep === steps.length - 1) {
            await handleEmailLogin();
        } else {
            handleNext();
        }
    };

    const handleEmailLogin = async () => {
        if (!validateCurrentStep()) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            const credentials: LoginCredentials = { email, password };

            // Call the login function from AuthContext
            await login(credentials);

            toast.success("Login successful! Welcome back 🎉");

            // Small delay before redirecting
            setTimeout(() => {
                const from = location.state?.from?.pathname || '/dashboard';
                navigate(from, { replace: true });
            }, 500);

        } catch (err: any) {
            console.error("Login error:", err);

            let errorMessage = "Login failed. Please check your credentials.";

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            } else if (err.status === 401) {
                errorMessage = "Invalid email or password";
            } else if (err.status === 404) {
                errorMessage = "Account not found";
            } else if (err.status === 500) {
                errorMessage = "Server error. Please try again later";
            }

            toast.error(errorMessage);
            setError(errorMessage);

            // Reset to first step on error
            setCurrentStep(0);
            setCompletedSteps([]);

        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setGoogleLoading(true);
            setError("");

            // Check if Google OAuth is available in AuthContext
            if (googleLogin) {
                await googleLogin();
                toast.success("Google login successful! 🎉");

                setTimeout(() => {
                    const from = location.state?.from?.pathname || '/dashboard';
                    navigate(from, { replace: true });
                }, 500);
            } else {
                // Fallback to direct Google OAuth flow
                await handleDirectGoogleAuth();
            }

        } catch (err: any) {
            console.error("Google login error:", err);
            const errorMessage = err.response?.data?.message || err.message || "Google login failed";
            toast.error(errorMessage);
            setError(errorMessage);
            setTimeout(() => setError(""), 5000);
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleDirectGoogleAuth = async () => {
        // This is a fallback implementation if AuthContext doesn't have googleLogin
        // In a real app, you would use Google's OAuth2 flow with your backend
        const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
        const redirectUri = `${window.location.origin}/auth/google/callback`;

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile&prompt=select_account`;

        // Redirect to Google OAuth
        window.location.href = authUrl;
    };

    // Render Google Sign-In Button
    const renderGoogleButton = () => (
        <GoogleButton
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            startIcon={<GoogleIcon />}
        >
            {googleLoading ? (
                <CircularProgress size={20} />
            ) : (
                "Continue with Google"
            )}
        </GoogleButton>
    );

    const renderCurrentStep = () => {
        const currentStepConfig = steps[currentStep];

        switch (currentStep) {
            case 0: // Email
                return (
                    <Box sx={{ mt: 3 }}>
                        <TextField
                            inputRef={emailInputRef}
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError(""); // Clear error on input
                            }}
                            placeholder={currentStepConfig.placeholder}
                            variant="outlined"
                            error={!!error && currentStep === 0}
                            disabled={loading || googleLoading}
                            InputProps={{
                                sx: { borderRadius: 2 },
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Mail size={20} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                );

            case 1: // Password
                return (
                    <Box sx={{ mt: 3 }}>
                        <TextField
                            inputRef={passwordInputRef}
                            fullWidth
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError(""); // Clear error on input
                            }}
                            placeholder={currentStepConfig.placeholder}
                            variant="outlined"
                            error={!!error && currentStep === 1}
                            disabled={loading || googleLoading}
                            InputProps={{
                                sx: { borderRadius: 2 },
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock size={20} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            size="small"
                                            disabled={loading || googleLoading}
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                                    cursor: (loading || googleLoading) ? 'not-allowed' : 'pointer'
                                }}
                                onClick={(e) => (loading || googleLoading) && e.preventDefault()}
                            >
                                Forgot your password?
                            </MuiLink>
                        </Box>
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <GradientPaper>
            <Container maxWidth="sm">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card
                        elevation={3}
                        sx={{
                            borderRadius: 3,
                            overflow: 'hidden',
                            position: 'relative',
                        }}
                    >
                        <Box
                            sx={{
                                height: 4,
                                background: theme.palette.mode === 'light'
                                    ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                                    : `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                            }}
                        />

                        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                            {/* Header */}
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                                    Welcome Back
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Sign in to your LIV Blog account
                                </Typography>
                            </Box>

                            {/* Social Login Section */}
                            <Box sx={{ mb: 4 }}>
                                {renderGoogleButton()}

                                {/* Divider */}
                                <Divider sx={{ my: 3 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        OR CONTINUE WITH
                                    </Typography>
                                </Divider>
                            </Box>

                            {/* Stepper */}
                            <Stepper
                                activeStep={currentStep}
                                alternativeLabel={isMobile}
                                sx={{ mb: 4 }}
                            >
                                {steps.map((step, index) => (
                                    <Step key={index} completed={completedSteps.includes(index)}>
                                        <StepLabel
                                            StepIconComponent={CustomStepIcon}
                                            sx={{
                                                '& .MuiStepLabel-label': {
                                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                },
                                            }}
                                        >
                                            {isMobile ? `Step ${index + 1}` : step.title}
                                        </StepLabel>
                                    </Step>
                                ))}
                            </Stepper>

                            {/* Error Alert */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <Alert
                                            severity="error"
                                            sx={{ mb: 3 }}
                                            onClose={() => setError('')}
                                            icon={<XCircle fontSize="small" />}
                                        >
                                            {error}
                                        </Alert>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Email/Password Form */}
                            <Box component="form" onSubmit={handleSubmit}>
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h6" gutterBottom>
                                        {steps[currentStep].title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {steps[currentStep].description}
                                    </Typography>
                                    {renderCurrentStep()}
                                </Box>

                                {/* Navigation Buttons */}
                                <div style={{
                                    display: 'flex',
                                    gap: '16px',
                                    width: '100%'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={handleBack}
                                            disabled={currentStep === 0 || loading || googleLoading}
                                            startIcon={<ArrowLeft />}
                                            size="large"
                                        >
                                            Back
                                        </Button>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            type="submit"
                                            disabled={loading || googleLoading}
                                            endIcon={loading ? <CircularProgress size={20} /> : currentStep === steps.length - 1 ? null : <ArrowRight />}
                                            size="large"
                                        >
                                            {loading ? "Signing In..." : currentStep === steps.length - 1 ? "Sign In" : "Next"}
                                        </Button>
                                    </div>
                                </div>
                            </Box>

                            {/* Divider & Create Account */}
                            <Divider sx={{ my: 4 }}>
                                <Typography variant="caption" color="text.secondary">
                                    NEW TO LIV BLOG?
                                </Typography>
                            </Divider>

                            <Box sx={{ textAlign: 'center' }}>
                                <Button
                                    component={Link}
                                    to="/auth/signup"
                                    variant="outlined"
                                    fullWidth
                                    endIcon={<LogIn size={18} />}
                                    size="large"
                                    sx={{ mb: 2 }}
                                    disabled={loading || googleLoading}
                                >
                                    Create New Account
                                </Button>
                            </Box>

                            {/* Security Notice */}
                            <Box sx={{
                                mt: 3,
                                pt: 3,
                                borderTop: 1,
                                borderColor: 'divider',
                                textAlign: 'center'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                    <Shield size={16} color={theme.palette.success.main} />
                                    <Typography variant="caption" color="text.secondary">
                                        Your login is secure and encrypted
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Responsive Indicator */}
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        bgcolor: 'background.paper',
                        px: 2,
                        py: 1,
                        borderRadius: 20,
                        boxShadow: 1,
                    }}
                >
                    {isMobile && <Smartphone size={16} />}
                    {isTablet && <Tablet size={16} />}
                    {!isMobile && !isTablet && <Monitor size={16} />}
                    <Typography variant="caption" color="text.secondary">
                        {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
                    </Typography>
                </Box>
            </Container>
        </GradientPaper>
    );
};