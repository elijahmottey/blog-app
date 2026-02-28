// components/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button, Box, Typography, Paper } from '@mui/material';
import useDocumentTitle from "../hooks/useDocumentTitle.ts";

export const NotFound: React.FC = () => {
    useDocumentTitle('LIVBlog - Page Not Found');
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                bgcolor: 'background.default',
                p: 3,
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 6,
                    borderRadius: 3,
                    maxWidth: 500,
                    textAlign: 'center',
                    bgcolor: 'background.paper',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                    }}
                >
                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: '6rem',
                            fontWeight: 'bold',
                            color: 'primary.main',
                            lineHeight: 1,
                        }}
                    >
                        404
                    </Typography>
                </Box>

                <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: 'text.primary' }}>
                    Page Not Found
                </Typography>

                <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                    The page you are looking for might have been removed, had its name changed,
                    or is temporarily unavailable.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                        component={Link}
                        to="/"
                        variant="outlined"
                        startIcon={<Home />}
                    >
                        Go Home
                    </Button>
                    <Button
                        onClick={() => window.history.back()}
                        variant="contained"
                        startIcon={<ArrowLeft />}
                    >
                        Go Back
                    </Button>
                </Box>

                <Typography variant="caption" sx={{ mt: 4, display: 'block', color: 'text.secondary' }}>
                    Try searching or check the URL for errors.
                </Typography>
            </Paper>
        </Box>
    );
};