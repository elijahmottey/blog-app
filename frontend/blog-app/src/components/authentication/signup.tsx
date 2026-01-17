import {useState, useRef, useEffect, type JSX} from "react";
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
import { Button } from '@mui/material';
import BackendApi, { type UserRegistration } from '../../service/BackendApi';
import { toast } from 'sonner';

// Type definitions
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

interface StepIndicatorProps {
    steps: StepConfig[];
    currentStep: number;
    completedSteps: number[];
}

interface PasswordRequirementProps {
    met: boolean;
    text: string;
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

    // Refs for each input field
    const nameInputRef = useRef<HTMLInputElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const policyInputRef = useRef<HTMLInputElement>(null);

    // Map refs to steps
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
            currentRef.focus();
        }
    }, [currentStep]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;

        // Handle checkbox for policy
        if (name === 'policy') {
            setAcceptedPolicy((e.target as HTMLInputElement).checked);
            setError("");
            return;
        }

        // Handle text inputs
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

    const getPasswordStrengthColor = (): string => {
        const score = getPasswordStrengthScore();
        if (score >= 80) return "bg-green-500";
        if (score >= 60) return "bg-yellow-500";
        if (score >= 40) return "bg-orange-500";
        return "bg-red-500";
    };

    const getPasswordStrengthText = (): string => {
        const score = getPasswordStrengthScore();
        if (score >= 80) return "Strong";
        if (score >= 60) return "Good";
        if (score >= 40) return "Fair";
        return "Weak";
    };

    const PasswordRequirement: React.FC<PasswordRequirementProps> = ({ met, text }) => (
        <motion.div
            className="flex items-center gap-2 text-xs"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
        >
            {met ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
                <XCircle className="w-3 h-3 text-gray-400" />
            )}
            <span className={met ? "text-green-600" : "text-gray-500"}>{text}</span>
        </motion.div>
    );

    const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep, completedSteps }) => (
        <div className="flex items-center justify-center mb-4 sm:mb-6 md:mb-8">
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                {steps.map((_step, index) => (
                    <div key={index} className="flex items-center">
                        <div className={`flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border-2 ${
                            completedSteps.includes(index)
                                ? "bg-green-500 border-green-500 text-primary-foreground"
                                : currentStep === index
                                    ? "border-amber-500 bg-amber-500 text-primary-foreground"
                                    : "border-gray-300 text-gray-500"
                        }`}>
                            {completedSteps.includes(index) ? (
                                <Check size={12} className="sm:w-3 sm:h-3 md:w-4 md:h-4" />
                            ) : (
                                <span className="text-xs sm:text-sm font-medium">{index + 1}</span>
                            )}
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`w-6 sm:w-8 md:w-12 h-0.5 ${
                                completedSteps.includes(index + 1) ? "bg-green-500" : "bg-gray-300"
                            }`} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderCurrentStep = (): JSX.Element | null => {
        const currentStepConfig = steps[currentStep];

        switch (currentStep) {
            case 0: // Username
                return (
                    <div className="space-y-3 sm:space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {currentStepConfig.title}
                            </label>
                            <input
                                ref={nameInputRef}
                                type="text"
                                name="name"
                                value={registrationData.name}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg px-3 py-3 sm:py-2.5 text-sm transition-colors"
                                placeholder={currentStepConfig.placeholder}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Don't use spaces in your username
                            </p>
                        </div>
                    </div>
                );

            case 1: // Email
                return (
                    <div className="space-y-3 sm:space-y-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {currentStepConfig.title}
                        </label>
                        <input
                            ref={emailInputRef}
                            type="email"
                            name="email"
                            value={registrationData.email}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg px-3 py-3 sm:py-2.5 text-sm transition-colors"
                            placeholder={currentStepConfig.placeholder}
                            required
                        />
                    </div>
                );

            case 2: // Password
                return (
                    <div className="space-y-3 sm:space-y-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {currentStepConfig.title}
                        </label>
                        <div className="relative">
                            <input
                                ref={passwordInputRef}
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={registrationData.password}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg px-3 py-3 sm:py-2.5 text-sm pr-10 transition-colors"
                                placeholder={currentStepConfig.placeholder}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {registrationData.password && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <div className="flex justify-between items-center text-xs mb-2">
                                    <span>Password Strength</span>
                                    <span>{getPasswordStrengthText()}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                                    <div
                                        className={`h-1.5 rounded-full ${getPasswordStrengthColor()}`}
                                        style={{ width: `${getPasswordStrengthScore()}%` }}
                                    />
                                </div>
                                <div className="grid grid-cols-1 xs:grid-cols-2 gap-1 text-xs">
                                    <PasswordRequirement met={passwordStrength.hasMinLength} text="8+ characters" />
                                    <PasswordRequirement met={passwordStrength.hasUpperCase} text="Uppercase letter" />
                                    <PasswordRequirement met={passwordStrength.hasLowerCase} text="Lowercase letter" />
                                    <PasswordRequirement met={passwordStrength.hasNumber} text="Number" />
                                    <PasswordRequirement met={passwordStrength.hasSpecialChar} text="Special character" />
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 3: // Policy
                return (
                    <div className="space-y-3 sm:space-y-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {currentStepConfig.title}
                        </label>
                        <div className="flex items-start gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <input
                                ref={policyInputRef}
                                type="checkbox"
                                name="policy"
                                checked={acceptedPolicy}
                                onChange={handleInputChange}
                                className="mt-0.5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                            />
                            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                I agree to the{" "}
                                <Link to="/terms" className="text-amber-600 underline font-medium hover:text-amber-700">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link to="/privacy" className="text-amber-600 underline font-medium hover:text-amber-700">
                                    Privacy Policy
                                </Link>
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen gap-5 bg-gradient-to-br from-slate-50 via-white to-amber-50 flex flex-col lg:flex-row-reverse items-center justify-center p-3 sm:p-4 md:p-6">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-sm p-3 sm:p-6 md:p-8 rounded-xl sm:rounded-lg shadow-lg sm:shadow-sm relative order-2 lg:order-1 lg:mr-4"
                style={{
                    border: '1px solid #d1d5db',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                }}
            >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-t-xl sm:rounded-t-lg"></div>

                {/* Logo Section */}
                <div className="flex flex-col items-center mb-2 sm:mb-6">
                    <div className="relative mb-2 sm:mb-2">
                        LIV Blog
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-1 sm:mb-2">Create Account</h2>
                    <p className="text-xs text-center text-gray-600 mb-3 sm:mb-3">Join LIV Blog today</p>
                </div>

                {/* Step Indicator */}
                <StepIndicator steps={steps} currentStep={currentStep} completedSteps={completedSteps} />

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3 mb-3 sm:mb-4 flex items-center gap-2"
                        >
                            <XCircle className="w-3 h-3 text-red-600 flex-shrink-0" />
                            <span className="flex-1">{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={currentStep === steps.length - 1 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
                    {/* Current Step Content */}
                    <div className="mb-2 sm:mb-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">
                            {steps[currentStep].title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-2">
                            {steps[currentStep].description}
                        </p>
                        {renderCurrentStep()}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center gap-2">
                        <Button
                            type="button"
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            variant="contained"
                            startIcon={<ArrowLeft />}
                            fullWidth
                        >
                            Back
                        </Button>

                        {currentStep === steps.length - 1 ? (
                            <Button
                                type="submit"
                                variant="contained"
                                endIcon={<Check />}
                                fullWidth
                                disabled={loading || !acceptedPolicy}
                            >
                                {loading ? "Creating Account..." : "Create Account"}
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                variant="contained"
                                endIcon={<ArrowRight />}
                                fullWidth
                            >
                                Next
                            </Button>
                        )}
                    </div>
                </form>

                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                    <p className="text-xs text-center text-gray-600">
                        Already have an account?{" "}
                        <Link to="/auth/login" className="text-amber-600 underline font-semibold hover:text-amber-700">
                            Login
                        </Link>
                    </p>
                </div>
            </motion.div>

            {/* Responsive Device Indicators (for demo purposes) */}
            <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-black/80 text-primary-foreground px-3 py-2 rounded-full text-xs">
                <Smartphone className="w-3 h-3 xs:hidden" />
                <Tablet className="w-3 h-3 hidden xs:flex sm:hidden" />
                <Monitor className="w-3 h-3 hidden sm:flex" />
                <span className="hidden xs:inline">Responsive Design</span>
            </div>
        </div>
    );
};