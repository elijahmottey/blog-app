import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Button, useTheme, Typography, Box, IconButton, alpha } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Check, Sparkles, Home, FileText, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TOUR_STEPS = [
    {
        title: "Welcome to LIVBlog!",
        description: "We're absolutely thrilled to have you here. Let's take a quick look around to help you get the most out of your experience.",
        icon: Sparkles,
        color: '#A142F4' // Purplish brand color
    },
    {
        title: "Discover Content",
        description: "Your dashboard is the central hub. Use the sticky category and time filters to effortlessly find posts that match your interests.",
        icon: Home,
        color: '#1A73E8' // Blue
    },
    {
        title: "Share Your Voice",
        description: "Ready to write? Click the 'Pen' icon at the top to access our rich text editor and publish your thoughts to the world.",
        icon: FileText,
        color: '#34A853' // Green
    },
    {
        title: "Engage & Connect",
        description: "Join the conversation! Like, bookmark, and leave comments on articles to interact with other readers and authors.",
        icon: MessageSquare,
        color: '#EA4335' // Red
    },
    {
        title: "Manage Your Profile",
        description: "Head to the Profile Management page to upload a custom avatar, write a bio, and personalize your account settings.",
        icon: User,
        color: '#F9AB00' // Yellow/Orange
    }
];

export const WelcomeTour: React.FC = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        // Check local storage to see if they've already completed the tour
        const hasSeenTour = localStorage.getItem('livblog_tour_completed');
        
        // Show the tour for authenticated users who haven't seen it yet
        if (user && !hasSeenTour) {
            const timer = setTimeout(() => setIsOpen(true), 1200); // Slight delay for smooth entrance
            return () => clearTimeout(timer);
        }
    }, [user]);

    const handleClose = () => {
        setIsOpen(false);
        // Save completion status so it never shows again for this browser
        localStorage.setItem('livblog_tour_completed', 'true');
    };

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const currentStepData = TOUR_STEPS[currentStep];
    const CurrentIcon = currentStepData.icon;

    return (
        <Dialog 
            open={isOpen} 
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: theme.shadows[20],
                    backgroundImage: `linear-gradient(to bottom right, ${alpha(theme.palette.background.paper, 1)}, ${alpha(theme.palette.background.default, 1)})`
                }
            }}
        >
            <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                <IconButton onClick={handleClose} size="small" sx={{ color: theme.palette.text.secondary, bgcolor: alpha(theme.palette.background.paper, 0.5), '&:hover': { bgcolor: theme.palette.action.hover } }}>
                    <X size={18} />
                </IconButton>
            </div>

            <DialogContent sx={{ p: 0, minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            style={{ 
                                position: 'absolute', 
                                width: '100%', 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                padding: '40px 32px'
                            }}
                        >
                            <Box 
                                sx={{ 
                                    width: 100, 
                                    height: 100, 
                                    borderRadius: '50%', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    bgcolor: alpha(currentStepData.color, 0.1),
                                    color: currentStepData.color,
                                    mb: 4,
                                    boxShadow: `0 8px 32px ${alpha(currentStepData.color, 0.2)}`
                                }}
                            >
                                <CurrentIcon size={48} strokeWidth={1.5} />
                            </Box>

                            <Typography variant="h5" align="center" sx={{ fontWeight: 800, mb: 2, color: theme.palette.text.primary, fontFamily: 'Amazon Ember, sans-serif' }}>
                                {currentStepData.title}
                            </Typography>
                            
                            <Typography variant="body1" align="center" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6, maxWidth: '85%' }}>
                                {currentStepData.description}
                            </Typography>
                        </motion.div>
                    </AnimatePresence>
                </Box>

                <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {TOUR_STEPS.map((_, idx) => (
                            <Box 
                                key={idx} 
                                sx={{ 
                                    width: currentStep === idx ? 24 : 8, 
                                    height: 8, 
                                    borderRadius: 4, 
                                    bgcolor: currentStep === idx ? theme.palette.primary.main : theme.palette.divider,
                                    transition: 'all 0.3s ease'
                                }} 
                            />
                        ))}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {currentStep > 0 && (
                            <Button 
                                variant="text" 
                                color="inherit" 
                                onClick={handlePrev}
                                sx={{ fontWeight: 600, color: theme.palette.text.secondary }}
                            >
                                Back
                            </Button>
                        )}
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={handleNext}
                            endIcon={currentStep === TOUR_STEPS.length - 1 ? <Check size={16} /> : <ChevronRight size={16} />}
                            sx={{ borderRadius: '20px', px: 3, fontWeight: 600, textTransform: 'none', boxShadow: theme.shadows[4] }}
                        >
                            {currentStep === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next'}
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};
