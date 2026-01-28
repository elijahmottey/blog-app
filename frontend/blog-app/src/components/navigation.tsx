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
import { useTheme, alpha } from '@mui/material/styles';
import BackendApi from "../service/BackendApi.ts";
import { useThemeMode } from "../context/ThemeModeContext";
import { Moon, Sun } from "lucide-react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const location = useLocation();
    const isAuthenticated = BackendApi.isAuthenticated();
    const navigate = useNavigate();
    const { mode, toggleMode } = useThemeMode();
    const theme = useTheme();

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

    // Search functionality
    useEffect(() => {
        const searchData = async () => {
            if (searchTerm.trim().length < 2) {
                setSearchResults([]);
                return;
            }
            
            try {
                const [posts, users, comments] = await Promise.all([
                    BackendApi.getAllPost(0, 50),
                    BackendApi.getAllUsers(),
                    BackendApi.getAllPostComment(0, 50)
                ]);
                
                const query = searchTerm.toLowerCase();
                const results = [];
                
                // Search posts
                const filteredPosts = posts.data?.content?.filter((post: any) => 
                    post.title?.toLowerCase().includes(query) || 
                    post.content?.toLowerCase().includes(query)
                ) || [];
                
                results.push(...filteredPosts.slice(0, 5).map((post: any) => ({
                    type: 'post',
                    id: post.id,
                    title: post.title,
                    content: post.content?.substring(0, 100) + '...',
                    url: `/dashboard/posts/${post.id}`
                })));
                
                // Search users
                const filteredUsers = Array.isArray(users) ? users.filter((user: any) => 
                    user.name?.toLowerCase().includes(query) || 
                    user.email?.toLowerCase().includes(query)
                ) : [];
                
                results.push(...filteredUsers.slice(0, 3).map((user: any) => ({
                    type: 'user',
                    id: user.id,
                    title: user.name,
                    content: user.email,
                    url: `/about?userId=${user.id}`
                })));
                
                // Search comments
                const filteredComments = comments.data?.content?.filter((comment: any) => 
                    comment.content?.toLowerCase().includes(query)
                ) || [];
                
                results.push(...filteredComments.slice(0, 3).map((comment: any) => ({
                    type: 'comment',
                    id: comment.id,
                    title: 'Comment',
                    content: comment.content?.substring(0, 100) + '...',
                    url: `/dashboard/comments`
                })));
                
                setSearchResults(results);
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            }
        };
        
        const timeoutId = setTimeout(searchData, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const navigation = [
        { name: "Home", href: "/", icon: Home },
        { name: "Blog", href: "/blog", icon: BookOpen },
        { name: "About", href: "/about", icon: Users },
    ];

    return (
        <nav
            className={`sticky top-0 z-50 w-full transition-all duration-300`}
            style={{
                backgroundColor: scrolled ? (mode === 'dark' ? theme.palette.background.paper : alpha(theme.palette.background.paper, 0.98)) : theme.palette.background.paper,
                borderBottom: `1px solid ${theme.palette.divider}`,
                color: theme.palette.text.primary,
                backdropFilter: scrolled ? 'blur(6px)' : undefined,
            }}
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
                                        className={`flex items-center space-x-1 text-sm font-medium transition-colors`}
                                        style={{
                                            color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                                        }}
                                    >
                                        <Icon className="h-4 w-4" style={{ color: isActive ? theme.palette.primary.main : (theme.palette as any).custom?.icon ?? theme.palette.text.secondary }} />
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
                                className="p-2 rounded-lg transition-colors"
                                aria-label="Search"
                                style={{ color: theme.palette.text.secondary, backgroundColor: 'transparent' }}
                            >
                                <Search className="h-5 w-5" />
                            </button>
                            {isSearchOpen && (
                                <div className="absolute right-0 top-12 w-96 rounded-lg shadow-lg border p-4" style={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }}>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: theme.palette.text.secondary }} />
                                        <input
                                            type="text"
                                            placeholder="Search posts, users, comments..."
                                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none"
                                            style={{ borderColor: theme.palette.divider, color: theme.palette.text.primary, backgroundColor: theme.palette.background.paper }}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && searchResults.length > 0) {
                                                    navigate(searchResults[0].url);
                                                    setIsSearchOpen(false);
                                                }
                                            }}
                                            autoFocus
                                        />
                                    </div>
                                    {searchResults.length > 0 && (
                                        <div className="mt-3 max-h-64 overflow-y-auto">
                                            {searchResults.map((result, index) => (
                                                <div
                                                    key={`${result.type}-${result.id}`}
                                                    className="p-2 rounded cursor-pointer hover:bg-gray-50"
                                                    style={{ backgroundColor: 'transparent' }}
                                                    onClick={() => {
                                                        navigate(result.url);
                                                        setIsSearchOpen(false);
                                                        setSearchTerm('');
                                                    }}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: theme.palette.primary.light, color: theme.palette.primary.contrastText }}>
                                                            {result.type}
                                                        </span>
                                                        <span className="font-medium" style={{ color: theme.palette.text.primary }}>
                                                            {result.title}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm mt-1" style={{ color: theme.palette.text.secondary }}>
                                                        {result.content}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="mt-2 text-sm" style={{ color: theme.palette.text.secondary }}>
                                        {searchTerm.length > 0 ? `${searchResults.length} results found` : 'Type to search...'}
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
                                    <Button variant="outlined" startIcon={<User />} sx={{ color: theme.palette.text.primary, borderColor: theme.palette.divider }}>
                                        Dashboard
                                    </Button>
                                </Link>
                                <Button
                                    onClick={() => navigate("/dashboard/posts/create")}
                                    startIcon={<PenSquare />}
                                    sx={{ color: theme.palette.text.primary }}
                                >
                                    Write Post
                                </Button>
                                <button className="p-2 rounded-lg transition-colors" style={{ color: theme.palette.text.secondary }}>
                                    <User className="h-5 w-5" style={{ color: (theme.palette as any).custom?.icon ?? theme.palette.text.secondary }} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/auth/login">
                                    <Button variant="contained" startIcon={<LogIn className="h-4 w-4" />} sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>
                                        Sign In
                                    </Button>
                                </Link>
                                <Link to="/auth/signup">
                                    <Button sx={{ color: theme.palette.text.primary }}>Get Started</Button>
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
                        {/* Theme Toggle for Mobile */}
                        <Tooltip title="Toggle color mode">
                          <IconButton onClick={() => toggleMode()} size="small" sx={{ color: 'text.secondary' }}>
                            {mode === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}
                          </IconButton>
                        </Tooltip>
                        
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="p-2 rounded-lg transition-colors"
                            aria-label="Search"
                            style={{ color: theme.palette.text.secondary, backgroundColor: 'transparent' }}
                        >
                            <Search className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg transition-colors"
                            aria-label="Menu"
                            style={{ color: theme.palette.text.secondary, backgroundColor: 'transparent' }}
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search */}
                {isSearchOpen && (
                    <div className="md:hidden px-4 pb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: theme.palette.text.secondary }} />
                            <input
                                type="text"
                                placeholder="Search posts, users, comments..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none"
                                style={{ borderColor: theme.palette.divider, color: theme.palette.text.primary, backgroundColor: theme.palette.background.paper }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && searchResults.length > 0) {
                                        navigate(searchResults[0].url);
                                        setIsSearchOpen(false);
                                    }
                                }}
                                autoFocus
                            />
                        </div>
                        {searchResults.length > 0 && (
                            <div className="mt-3 max-h-48 overflow-y-auto">
                                {searchResults.map((result) => (
                                    <div
                                        key={`${result.type}-${result.id}`}
                                        className="p-2 rounded cursor-pointer"
                                        onClick={() => {
                                            navigate(result.url);
                                            setIsSearchOpen(false);
                                            setSearchTerm('');
                                        }}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: theme.palette.primary.light, color: theme.palette.primary.contrastText }}>
                                                {result.type}
                                            </span>
                                            <span className="font-medium" style={{ color: theme.palette.text.primary }}>
                                                {result.title}
                                            </span>
                                        </div>
                                        <p className="text-sm mt-1" style={{ color: theme.palette.text.secondary }}>
                                            {result.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden" style={{ borderTop: `1px solid ${theme.palette.divider}` }}>
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-colors`}
                                        style={{
                                            backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
                                            color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                                        }}
                                    >
                                        <Icon className="h-5 w-5" style={{ color: isActive ? theme.palette.primary.main : (theme.palette as any).custom?.icon ?? theme.palette.text.secondary }} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}

                            {/* Mobile Auth Links */}
                            <div className="px-3 pt-4" style={{ borderTop: `1px solid ${theme.palette.divider}` }}>
                                {isAuthenticated ? (
                                    <>
                                        <Link
                                            to="/dashboard/posts/create"
                                            className="flex items-center space-x-3 px-3 py-2 rounded-lg textbase font-medium"
                                            style={{ color: theme.palette.text.primary }}
                                        >
                                            <PenSquare className="h-5 w-5" style={{ color: (theme.palette as any).custom?.icon ?? theme.palette.text.secondary }} />
                                            <span>Write Post</span>
                                        </Link>
                                        <Link
                                            to="/dashboard/profile"
                                            className="flex items-center space-x-3 px-3 py-2 rounded-lg textbase font-medium"
                                            style={{ color: theme.palette.text.primary }}
                                        >
                                            <User className="h-5 w-5" style={{ color: (theme.palette as any).custom?.icon ?? theme.palette.text.secondary }} />
                                            <span>Profile</span>
                                        </Link>
                                        <Link
                                            to="/dashboard/settings"
                                            className="flex items-center space-x-3 px-3 py-2 rounded-lg textbase font-medium"
                                            style={{ color: theme.palette.text.primary }}
                                        >
                                            <Settings className="h-5 w-5" style={{ color: (theme.palette as any).custom?.icon ?? theme.palette.text.secondary }} />
                                            <span>Settings</span>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/auth/login"
                                            className="flex items-center space-x-3 px-3 py-2 rounded-lg textbase font-medium"
                                            style={{ color: theme.palette.text.primary }}
                                        >
                                            <LogIn className="h-5 w-5" style={{ color: (theme.palette as any).custom?.icon ?? theme.palette.text.secondary }} />
                                            <span>Sign In</span>
                                        </Link>
                                        <Link
                                            to="/auth/signup"
                                            className="flex items-center space-x-3 px-3 py-2 rounded-lg textbase font-medium"
                                            style={{ color: theme.palette.text.primary }}
                                        >
                                            <PenSquare className="h-5 w-5" style={{ color: (theme.palette as any).custom?.icon ?? theme.palette.text.secondary }} />
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