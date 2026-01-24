import { useState, useRef, useEffect, type JSX } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Eye,
    EyeOff,
    CheckCircle,
    XCircle,
    ArrowRight,
    ArrowLeft,
    Check,
    Smartphone,
    Monitor,
    Tablet,
} from "lucide-react";
import BackendApi, { type UserRegistration } from '../../service/BackendApi';
import { toast } from 'sonner';

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
    LinearProgress,
    Checkbox,
    FormControlLabel,
    IconButton,
    InputAdornment,
    Alert,
    Card,
    CardContent,
    useTheme,
    useMediaQuery,
    Chip,
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

const StrengthMeter = styled(LinearProgress)(({ theme, value }) => ({
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.palette.grey[200],
    '& .MuiLinearProgress-bar': {
        borderRadius: 3,
        backgroundColor:
            value! >= 80
                ? theme.palette.success.main
                : value! >= 60
                    ? theme.palette.warning.main
                    : value! >= 40
                        ? theme.palette.info.main
                        : theme.palette.error.main,
    },
}));

const RequirementChip = styled(Chip)<{ met: boolean }>(({ theme, met }) => ({
    height: 24,
    fontSize: '0.75rem',
    backgroundColor: met ? theme.palette.success.light : theme.palette.grey[100],
    color: met ? theme.palette.success.contrastText : theme.palette.text.secondary,
    border: `1px solid ${met ? theme.palette.success.main : theme.palette.grey[300]}`,
    '& .MuiChip-icon': {
        color: met ? theme.palette.success.main : theme.palette.grey[400],
        fontSize: '0.875rem',
    },
}));

// Type definitions (unchanged)
interface PasswordStrength {
    hasMinLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
}

interface StepConfig {
    title: string;
    description: string;
    field: keyof UserRegistration | 'policy';
    placeholder: string;
    type: 'text' | 'tel' | 'email' | 'password' | 'policy';
}

export const Signup = () => {
    const [registrationData, setRegistrationData] = useState<UserRegistration>({
        name: "",
        email: "",
        password: ""
    });

    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [acceptedPolicy, setAcceptedPolicy] = useState<boolean>(false);
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
        hasMinLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
    });
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    // Refs for each input field
    const nameInputRef = useRef<HTMLInputElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const policyInputRef = useRef<HTMLInputElement>(null);

    const inputRefs = [
        nameInputRef,
        emailInputRef,
        passwordInputRef,
        policyInputRef
    ];

    const steps: StepConfig[] = [
        {
            title: "Username",
            description: "Choose your username",
            field: "name",
            placeholder: "e.g., kofi or Elijah_Mottey",
            type: "text"
        },
        {
            title: "Email Address",
            description: "Enter your email address",
            field: "email",
            placeholder: "Email address",
            type: "email"
        },
        {
            title: "Password",
            description: "Create a secure password",
            field: "password",
            placeholder: "Create password",
            type: "password"
        },
        {
            title: "Terms & Conditions",
            description: "Review and accept our policies",
            field: "policy",
            placeholder: "",
            type: "policy"
        }
    ];

    useEffect(() => {
        const currentRef = inputRefs[currentStep]?.current;
        if (currentRef) {
            setTimeout(() => currentRef.focus(), 100);
        }
    }, [currentStep]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;

        if (name === 'policy') {
            setAcceptedPolicy((e.target as HTMLInputElement).checked);
            setError("");
            return;
        }

        if (name === 'name' || name === 'email' || name === 'password') {
            setRegistrationData((prev: UserRegistration) => ({ ...prev, [name]: value }));
        }

        if (name === "password") {
            checkPasswordStrength(value);
        }
        setError("");
    };

    const checkPasswordStrength = (password: string): void => {
        setPasswordStrength({
            hasMinLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        });
    };

    const validateCurrentStep = (): boolean => {
        switch (currentStep) {
            case 0: // Username
                if (!registrationData.name.trim()) {
                    setError("Please enter a username");
                    return false;
                }
                if (registrationData.name.includes(' ')) {
                    setError("Username should not contain spaces");
                    return false;
                }
                break;

            case 1: // Email
                if (!registrationData.email.trim()) {
                    setError("Please enter an email address");
                    return false;
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(registrationData.email)) {
                    setError("Enter a valid email address");
                    return false;
                }
                break;

            case 2: // Password
                if (!registrationData.password) {
                    setError("Please create a password");
                    return false;
                }
                const isStrongPassword = Object.values(passwordStrength).every(Boolean);
                if (!isStrongPassword) {
                    setError("Password must meet all requirements");
                    return false;
                }
                break;

            case 3: // Policy
                if (!acceptedPolicy) {
                    setError("Please accept Terms & Privacy Policy");
                    return false;
                }
                break;

            default:
                return false;
        }

        setError("");
        return true;
    };

    const handleNext = (): void => {
        if (validateCurrentStep()) {
            if (!completedSteps.includes(currentStep)) {
                setCompletedSteps(prev => [...prev, currentStep]);
            }
            if (currentStep < steps.length - 1) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const handleBack = (): void => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!validateCurrentStep()) {
            setTimeout(() => setError(""), 5000);
            return;
        }

        try {
            setLoading(true);
            const payload: UserRegistration = {
                ...registrationData
            };
            const response = await BackendApi.registerUser(payload);
            toast.success(response.message || "Account created successfully! 🎉");
            setTimeout(() => navigate("/auth/login"), 1500);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Signup failed";
            toast.error(errorMessage);
            setError(errorMessage);
            setTimeout(() => setError(""), 5000);
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrengthScore = (): number => {
        const score = Object.values(passwordStrength).filter(Boolean).length;
        return (score / 5) * 100;
    };

    const getPasswordStrengthText = (): string => {
        const score = getPasswordStrengthScore();
        if (score >= 80) return "Strong";
        if (score >= 60) return "Good";
        if (score >= 40) return "Fair";
        return "Weak";
    };

    const PasswordRequirement: React.FC<{ met: boolean; text: string }> = ({ met, text }) => (
        <RequirementChip
            label={text}
            icon={met ? <CheckCircle fontSize="small" /> : <XCircle fontSize="small" />}
            met={met}
            size="small"
        />
    );

    const CustomStepIcon = (props: any) => {
        const { active, completed, icon } = props;
        return (
            <StepIconContainer completed={completed} active={active}>
                {completed ? <Check fontSize="small" /> : icon}
            </StepIconContainer>
        );
    };

    const renderCurrentStep = (): JSX.Element | null => {
        const currentStepConfig = steps[currentStep];

        switch (currentStep) {
            case 0: // Username
                return (
                    <Box sx={{ mt: 3 }}>
                        <TextField
                            inputRef={nameInputRef}
                            fullWidth
                            label="Username"
                            name="name"
                            value={registrationData.name}
                            onChange={handleInputChange}
                            placeholder={currentStepConfig.placeholder}
                            variant="outlined"
                            error={!!error && currentStep === 0}
                            helperText="Don't use spaces in your username"
                            InputProps={{
                                sx: { borderRadius: 2 }
                            }}
                        />
                    </Box>
                );

            case 1: // Email
                return (
                    <Box sx={{ mt: 3 }}>
                        <TextField
                            inputRef={emailInputRef}
                            fullWidth
                            label="Email Address"
                            name="email"
                            type="email"
                            value={registrationData.email}
                            onChange={handleInputChange}
                            placeholder={currentStepConfig.placeholder}
                            variant="outlined"
                            error={!!error && currentStep === 1}
                            InputProps={{
                                sx: { borderRadius: 2 }
                            }}
                        />
                    </Box>
                );

            case 2: // Password
                return (
                    <Box sx={{ mt: 3 }}>
                        <TextField
                            inputRef={passwordInputRef}
                            fullWidth
                            label="Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={registrationData.password}
                            onChange={handleInputChange}
                            placeholder={currentStepConfig.placeholder}
                            variant="outlined"
                            error={!!error && currentStep === 2}
                            InputProps={{
                                sx: { borderRadius: 2 },
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {registrationData.password && (
                            <Card variant="outlined" sx={{ mt: 3, borderRadius: 2 }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Password Strength
                                            </Typography>
                                            <Typography variant="caption" fontWeight="medium">
                                                {getPasswordStrengthText()}
                                            </Typography>
                                        </Box>
                                        <StrengthMeter variant="determinate" value={getPasswordStrengthScore()} />
                                    </Box>
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '8px',
                                        marginTop: '8px'
                                    }}>
                                        <PasswordRequirement met={passwordStrength.hasMinLength} text="8+ characters" />
                                        <PasswordRequirement met={passwordStrength.hasUpperCase} text="Uppercase letter" />
                                        <PasswordRequirement met={passwordStrength.hasLowerCase} text="Lowercase letter" />
                                        <PasswordRequirement met={passwordStrength.hasNumber} text="Number" />
                                        <PasswordRequirement met={passwordStrength.hasSpecialChar} text="Special character" />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </Box>
                );

            case 3: // Policy
                return (
                    <Box sx={{ mt: 3 }}>
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            inputRef={policyInputRef}
                                            checked={acceptedPolicy}
                                            onChange={(e) => setAcceptedPolicy(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Typography variant="body2">
                                            I agree to the{' '}
                                            <MuiLink component={Link} to="/terms" color="primary">
                                                Terms of Service
                                            </MuiLink>{' '}
                                            and{' '}
                                            <MuiLink component={Link} to="/privacy" color="primary">
                                                Privacy Policy
                                            </MuiLink>
                                        </Typography>
                                    }
                                />
                            </CardContent>
                        </Card>
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
                                    Create Account
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Join LIV Blog today
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
                                        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                                            {error}
                                        </Alert>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Form */}
                            <Box component="form" onSubmit={currentStep === steps.length - 1 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
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
                                        {currentStep === steps.length - 1 ? (
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                type="submit"
                                                disabled={loading || !acceptedPolicy}
                                                endIcon={loading ? <CircularProgress size={20} /> : <Check />}
                                                size="large"
                                            >
                                                {loading ? "Creating..." : "Create Account"}
                                            </Button>
                                        ) : (
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                type="submit"
                                                endIcon={<ArrowRight />}
                                                size="large"
                                            >
                                                Next
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Box>

                            {/* Login Link */}
                            <Divider sx={{ my: 3 }}>
                                <Typography variant="caption" color="text.secondary">
                                    OR
                                </Typography>
                            </Divider>

                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Already have an account?{' '}
                                    <MuiLink component={Link} to="/auth/login" fontWeight="medium">
                                        Login
                                    </MuiLink>
                                </Typography>
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