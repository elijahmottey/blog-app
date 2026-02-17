import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import BackendApi, { type UserRegistration } from '../../service/BackendApi';
import { toast } from 'sonner';
import OAuth2LoginButtons from "../OAuth2LoginButtons";
import {
    Button,
    TextField,
    Box,
    Typography,
    Checkbox,
    FormControlLabel,
    IconButton,
    InputAdornment,
    Alert,
    useTheme,
    Link as MuiLink,
    CircularProgress,
    LinearProgress,
    Chip,
    Divider,
} from '@mui/material';
import { LIVBlogCard, LIVBlogHeader, LIVBlogLayout } from '../ui';
import { styled } from '@mui/material/styles';

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

interface PasswordStrength {
    hasMinLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
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

    const navigate = useNavigate();
    const theme = useTheme();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
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

    const validateForm = (): boolean => {
        if (!registrationData.name.trim()) {
            setError("Username is required");
            return false;
        }
        if (!registrationData.email.trim()) {
            setError("Email is required");
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registrationData.email)) {
            setError("Enter a valid email address");
            return false;
        }
        if (!registrationData.password) {
            setError("Password is required");
            return false;
        }
        const isStrongPassword = Object.values(passwordStrength).every(Boolean);
        if (!isStrongPassword) {
            setError("Password must meet all requirements");
            return false;
        }
        if (!acceptedPolicy) {
            setError("You must accept the terms and conditions");
            return false;
        }
        setError("");
        return true;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setLoading(true);
            const response = await BackendApi.registerUser(registrationData);
            toast.success(response.message || "Account created successfully!");
            setTimeout(() => navigate("/auth/login"), 1500);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Signup failed";
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
                            className="hover-card"
                            style={{
                                width: '100%',
                            }}
                        >
                            <LIVBlogHeader
                                title="Create Account"
                                subtitle="Join LIV Blog today"
                                size="medium"
                            />

                            {/* OAuth2 Login */}
                            <Box sx={{ mb: 3 }}>
                                <OAuth2LoginButtons />
                                <Divider sx={{ my: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        OR
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
                                        Username
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="name"
                                        value={registrationData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter your username"
                                        variant="outlined"
                                        size="small"
                                        disabled={loading}
                                    />
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
                                        Email
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="email"
                                        type="email"
                                        value={registrationData.email}
                                        onChange={handleInputChange}
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
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={registrationData.password}
                                        onChange={handleInputChange}
                                        placeholder="Create a secure password"
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
                                                    >
                                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    {/* Password Strength Indicator */}
                                    {registrationData.password && (
                                        <LIVBlogCard variant="outlined" padding="small" style={{ marginTop: '12px' }}>
                                            <Box sx={{ mb: 1 }}>
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
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                <PasswordRequirement met={passwordStrength.hasMinLength} text="8+ chars" />
                                                <PasswordRequirement met={passwordStrength.hasUpperCase} text="Uppercase" />
                                                <PasswordRequirement met={passwordStrength.hasLowerCase} text="Lowercase" />
                                                <PasswordRequirement met={passwordStrength.hasNumber} text="Number" />
                                                <PasswordRequirement met={passwordStrength.hasSpecialChar} text="Special" />
                                            </Box>
                                        </LIVBlogCard>
                                    )}
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={acceptedPolicy}
                                                onChange={(e) => setAcceptedPolicy(e.target.checked)}
                                                size="small"
                                            />
                                        }
                                        label={
                                            <Typography variant="body2" sx={{ fontSize: '13px' }}>
                                                I agree to the{' '}
                                                <MuiLink component={Link} to="/terms-of-service" color="primary">
                                                    Terms of Service
                                                </MuiLink>{' '}
                                                and{' '}
                                                <MuiLink component={Link} to="/privacy-policy" color="primary">
                                                    Privacy Policy
                                                </MuiLink>
                                            </Typography>
                                        }
                                    />
                                </Box>

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    className="hover-button"
                                    disabled={loading}
                                    sx={{ mb: 2 }}
                                >
                                    {loading ? <CircularProgress size={20} /> : 'Create Account'}
                                </Button>
                            </Box>

                            {/* Sign In Link */}
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2">
                                    Already have an account?{' '}
                                    <MuiLink component={Link} to="/auth/login" color="primary">
                                        Sign in
                                    </MuiLink>
                                </Typography>
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