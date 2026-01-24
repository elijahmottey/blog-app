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
} from "lucide-react";
import BackendApi from '../../service/BackendApi';
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

// Type definitions
interface StepConfig {
    title: string;
    description: string;
    placeholder: string;
    type: 'email' | 'password';
    validation: () => boolean;
}

export const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

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
            validation: () => email.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        },
        {
            title: "Password",
            description: "Enter your secure password",
            placeholder: "Your password",
            type: 'password',
            validation: () => password.trim() !== "",
        },
    ];

    useEffect(() => {
        const currentRef = inputRefs[currentStep]?.current;
        if (currentRef) {
            setTimeout(() => currentRef.focus(), 100);
        }
    }, [currentStep]);

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
        const currentValidation = steps[currentStep].validation;
        if (!currentValidation()) {
            let errorMessage = "";
            switch (currentStep) {
                case 0:
                    errorMessage = "Please enter a valid email address";
                    break;
                case 1:
                    errorMessage = "Password cannot be empty";
                    break;
                default:
                    errorMessage = "Please complete the required field";
            }
            setError(errorMessage);
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
            await handleLogin();
        } else {
            handleNext();
        }
    };

    const handleLogin = async () => {
        if (!validateCurrentStep()) {
            setTimeout(() => setError(""), 5000);
            return;
        }

        try {
            setLoading(true);
            // Replace this with your actual login API call
            // await BackendApi.login({ email, password });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success("Welcome back! 🎉");
            setTimeout(() => {
                const from = location.state?.from?.pathname || '/dashboard';
                navigate(from, { replace: true });
            }, 100);
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || err.message || "Login failed. Please check your credentials.";
            toast.error(errorMessage);
            setError(errorMessage);
            setTimeout(() => setError(""), 5000);
        } finally {
            setLoading(false);
        }
    };

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
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={currentStepConfig.placeholder}
                            variant="outlined"
                            error={!!error && currentStep === 0}
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
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={currentStepConfig.placeholder}
                            variant="outlined"
                            error={!!error && currentStep === 1}
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
                                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
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

                            {/* Form */}
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
                                            disabled={currentStep === 0}
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
                                            disabled={loading}
                                            endIcon={loading ? <CircularProgress size={20} /> : currentStep === steps.length - 1 ? null : <ArrowRight />}
                                            size="large"
                                        >
                                            {loading ? "Signing In..." : currentStep === steps.length - 1 ? "Sign In" : "Next"}
                                        </Button>
                                    </div>
                                </div>
                            </Box>

                            {/* Divider & Create Account */}
                            <Divider sx={{ my: 3 }}>
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
                                    endIcon={<ArrowRight />}
                                    size="large"
                                    sx={{ mb: 2 }}
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