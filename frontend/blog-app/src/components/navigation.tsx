import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Menu,
    X,
    Search,
    User,
    LogIn,
    PenSquare,
    Home,
    BookOpen,
    Users,
    Settings
} from "lucide-react";

import {
    Button,
    Box,
    Typography,
    IconButton,
    Tooltip
} from "@mui/material";
import BackendApi from "../service/BackendApi.ts";
import { useThemeMode } from "../context/ThemeModeContext";
import { Moon, Sun } from "lucide-react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const isAuthenticated = BackendApi.isAuthenticated();
    const navigate = useNavigate();
    const { mode, toggleMode } = useThemeMode();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsOpen(false);
        setIsSearchOpen(false);
    }, [location]);

    const navigation = [
        { name: "Home", href: "/", icon: Home },
        { name: "Blog", href: "/blog", icon: BookOpen },
        { name: "About", href: "/about", icon: Users },
    ];

    return (
        <nav
            className={`sticky top-0 z-50 w-full transition-all duration-300 ${
                scrolled
                    ? (mode === 'dark' ? 'bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 shadow-sm text-gray-100' : 'bg-white/95 backdrop-blur-lg border-b shadow-sm')
                    : (mode === 'dark' ? 'bg-gray-900 border-b border-gray-800 text-gray-100' : 'bg-white border-b')
            }`}
        >
            <div className="container mx-auto px-4">
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center justify-between h-16">
                    {/* Logo and Navigation Links */}
                    <div className="flex items-center">
                        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 1,
                                        bgcolor: 'primary.main',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                                        LIV
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 'bold',
                                        color: 'primary.main',
                                        fontSize: '1.25rem',
                                    }}
                                >
                                    Blog
                                </Typography>
                            </Box>
                        </Link>

                        {/* Navigation Links */}
                        <div className="ml-10 flex items-baseline space-x-8">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                                            isActive
                                                ? "text-blue-600"
                                                : "text-gray-700 hover:text-blue-600"
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <div className="relative">
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Search"
                            >
                                <Search className="h-5 w-5" />
                            </button>
                            {isSearchOpen && (
                                <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-lg border p-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search articles, tags, authors..."
                                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="mt-2 text-sm text-gray-500">
                                        Press Enter to search
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Theme Toggle */}
                        <Tooltip title="Toggle color mode">
                          <IconButton onClick={() => toggleMode()} size="small" sx={{ color: 'text.secondary' }}>
                            {mode === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}
                          </IconButton>
                        </Tooltip>

                        {/* Auth Buttons */}
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-3">
                                <Link to="/dashboard">
                                    <Button variant="outlined" startIcon={<User />}>
                                        Dashboard
                                    </Button>
                                </Link>
                                <Button
                                    onClick={() => navigate("/dashboard/posts/create")}
                                    startIcon={<PenSquare />}
                                >
                                    Write Post
                                </Button>
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <User className="h-5 w-5 text-gray-700" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/auth/login">
                                    <Button variant="contained" startIcon={<LogIn className="h-4 w-4" />}>
                                        Sign In
                                    </Button>
                                </Link>
                                <Link to="/auth/signup">
                                    <Button>Get Started</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="flex md:hidden items-center justify-between h-16">
                    {/* Mobile Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 1,
                                bgcolor: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>
                                LIV
                            </Typography>
                        </Box>
                        <Typography
                            sx={{
                                fontWeight: 'bold',
                                color: 'primary.main',
                                fontSize: '1.125rem',
                            }}
                        >
                            Blog
                        </Typography>
                    </Link>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Search"
                        >
                            <Search className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Menu"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search */}
                {isSearchOpen && (
                    <div className="md:hidden px-4 pb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search articles, tags, authors..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                        </div>
                    </div>
                )}

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden border-t">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                                            isActive
                                                ? "bg-blue-50 text-blue-600"
                                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}

                            {/* Mobile Auth Links */}
                            <div className="px-3 pt-4 border-t">
                                {isAuthenticated ? (
                                    <>
                                        <Link
                                            to="/dashboard/posts/create"
                                            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        >
                                            <PenSquare className="h-5 w-5" />
                                            <span>Write Post</span>
                                        </Link>
                                        <Link
                                            to="/dashboard/profile"
                                            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        >
                                            <User className="h-5 w-5" />
                                            <span>Profile</span>
                                        </Link>
                                        <Link
                                            to="/dashboard/settings"
                                            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        >
                                            <Settings className="h-5 w-5" />
                                            <span>Settings</span>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/auth/login"
                                            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        >
                                            <LogIn className="h-5 w-5" />
                                            <span>Sign In</span>
                                        </Link>
                                        <Link
                                            to="/auth/signup"
                                            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        >
                                            <PenSquare className="h-5 w-5" />
                                            <span>Get Started</span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}