import React, { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { Button, Box, TextField, InputAdornment, IconButton } from '@mui/material';
import { useAuth } from "../../context/AuthContext.tsx";
import { toast } from "sonner";



export const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    const navigate = useNavigate();
    const { login } = useAuth();
    const location = useLocation();
    const from = (location.state as any)?.from?.pathname || "/dashboard";

    const inputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];

    const steps = [
        {
            title: "Email Address",
            description: "Enter your registered email",
            field: "email",
            placeholder: "Enter your email address",
            type: "email"
        },
        {
            title: "Password",
            description: "Enter your secure password",
            field: "password",
            placeholder: "Enter your password",
            type: "password"
        }
    ];

    useEffect(() => {
        if (inputRefs[currentStep]?.current) {
            inputRefs[currentStep].current?.focus();
        }
    }, [currentStep]);

    const validateCurrentStep = (): boolean => {
        switch (currentStep) {
            case 0: // Email
                if (!email.trim()) {
                    setError("Please enter your email address");
                    return false;
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    setError("Please enter a valid email address");
                    return false;
                }
                break;

            case 1: // Password
                if (!password) {
                    setError("Please enter your password");
                    return false;
                }
                if (password.length < 6) {
                    setError("Password must be at least 6 characters");
                    return false;
                }
                break;

            default:
                return false;
        }

        setError("");
        return true;
    };

    const handleNext = () => {
        if (validateCurrentStep()) {
            if (!completedSteps.includes(currentStep)) {
                setCompletedSteps(prev => [...prev, currentStep]);
            }
            if (currentStep < steps.length - 1) {
                setCurrentStep(currentStep + 1);
            } else {
                handleLogin();
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleLogin = async () => {
        if (!validateCurrentStep()) {
            setTimeout(() => setError(""), 5000);
            return;
        }

        try {
            setLoading(true);
            const response = await login({ email, password });
            toast.success(response.message || "Welcome back! 🎉");
            navigate(from, { replace: true });
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || err.message || "Login failed";
            toast.error(errorMessage);
            setError(errorMessage);
            setTimeout(() => setError(""), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleNext();
    };

    const StepIndicator = () => (
        <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-4">
                {steps.map((_step, index) => (
                    <div key={index} className="flex items-center">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                            completedSteps.includes(index)
                                ? "bg-green-500 border-green-500 text-primary-foreground"
                                : currentStep === index
                                    ? "border-amber-500 bg-amber-500 text-primary-foreground"
                                    : "border-gray-300 text-gray-500"
                        }`}>
                            {completedSteps.includes(index) ? (
                                <Check size={16} />
                            ) : (
                                <span className="text-sm font-medium">{index + 1}</span>
                            )}
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`w-12 h-0.5 ${
                                completedSteps.includes(index + 1) ? "bg-green-500" : "bg-gray-300"
                            }`} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderCurrentStep = () => {
        const currentStepConfig = steps[currentStep];

        switch (currentStep) {
            case 0: // Email
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label={currentStepConfig.title}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={currentStepConfig.placeholder}
                            autoComplete="email"
                            required
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Mail />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                );

            case 1: // Password
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label={currentStepConfig.title}
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={currentStepConfig.placeholder}
                            autoComplete="current-password"
                            required
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <EyeOff /> : <Eye />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Forgot Password */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                component={Link}
                                to="/forget-password"
                                size="small"
                                sx={{ textTransform: 'none', color: 'text.secondary' }}
                            >
                                Forgot your password?
                            </Button>
                        </Box>
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen gap-5 bg-gradient-to-br from-slate-50 via-white to-amber-50 flex flex-col lg:flex-row-reverse items-center justify-center p-4 sm:p-6">

            <motion.div
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="w-full max-w-md bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm relative"
                style={{
                    border: '1px solid #d1d5db',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                }}
            >
                {/*  Header Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-t-lg"></div>

                {/* Logo Section */}
                <div className="flex flex-col items-center mb-2">
                    <div className="relative mb-2">
                        LIV Blog
                    </div>
                    <h2 className="text-2xl font-bold text-center text-gray-800 ">Welcome Back</h2>
                    <p className="text-sm text-center text-gray-600">Sign in to your LIV Hotel account</p>
                </div>

                {/* Step Indicator */}
                <StepIndicator />

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6 flex items-center gap-2"
                        >
                            <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                            <span className="flex-1">{error}</span>
                            <button
                                onClick={() => setError("")}
                                className="text-red-600 hover:text-red-800 transition-colors"
                            >
                                <XCircle className="w-3 h-3" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit}>
                    {/* Current Step Content */}
                    <div className="mb-5">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {steps[currentStep].title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            {steps[currentStep].description}
                        </p>
                        {renderCurrentStep()}
                    </div>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button
                            type="button"
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            startIcon={<ArrowLeft />}
                            variant="outlined"
                        >
                            Back
                        </Button>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                type="submit"
                                disabled={loading}
                                variant="contained"
                                endIcon={<ArrowRight />}
                                sx={{
                                    bgcolor: 'primary.main',
                                    '&:hover': { bgcolor: 'primary.dark' },
                                    textTransform: 'none'
                                }}
                            >
                                {loading ? 'Signing In...' : currentStep === steps.length - 1 ? 'Sign In' : 'Next'}
                            </Button>
                        </motion.div>
                    </Box>
                </form>

                {/* Divider */}
                <div className="my-4 flex items-center">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-3 text-gray-500 text-xs">New to LIV Hotel?</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Create Account Link */}
                <Box sx={{ textAlign: 'center' }}>
                    <Button
                        component={Link}
                        to="/signup"
                        variant="contained"
                        endIcon={<ArrowRight />}
                        sx={{ textTransform: 'none' }}
                    >
                        Create New Account
                    </Button>
                </Box>

                {/* Security Notice */}
                <div className="mt-5 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
                        <Shield className="w-3 h-3 text-green-500" />
                        <span>Your login is secure and encrypted</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};