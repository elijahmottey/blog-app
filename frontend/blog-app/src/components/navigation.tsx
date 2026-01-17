// components/layout/Navbar.tsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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

import {Button, IconButton} from "@mui/material";
import BackendApi from "../service/BackendApi.ts";
import { motion } from "framer-motion";


export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
   // const isAdmin = BackendApi.isAdmin();
    const isAuthenticated = BackendApi.isAuthenticated();
   // const isUser = BackendApi.isUser();


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
       // // { name: "Categories", href: "/categories", icon: Tag },
       //  { name: "Authors", href: "/authors", icon: Users },
        { name: "About", href: "/about", icon: Users },
    ];

    // @ts-ignore
    // @ts-ignore
    return (
        <nav
            className={`sticky top-0 z-50 w-full transition-all duration-300 ${
                scrolled
                    ? "bg-white/95 backdrop-blur-lg border-b shadow-sm"
                    : "bg-white border-b"
            }`}
        >
            <div className="container mx-auto px-4">
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LIVBlog
              </span>
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
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                            <IconButton
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                aria-label="Search"
                            >
                                <Search />
                            </IconButton>
                        </motion.div>
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

                        {/* Auth Buttons */}
                        {isAuthenticated? (
                            <div className="flex items-center space-x-3">
                                <Link to="/dashboard">
                                    <Button variant="outlined" startIcon={<User />}>
                                        Dashboard
                                    </Button>
                                </Link>
                                <Link to="dashboard/posts/create">
                                    <Button variant="contained" startIcon={<PenSquare />}>
                                        Write Post
                                    </Button>
                                </Link>
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    <IconButton>
                                        <User />
                                    </IconButton>
                                </motion.div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/auth/login">
                                    <Button variant="contained" startIcon={<LogIn className="h-4 w-4" />}>
                                        Sign In
                                    </Button>
                                </Link>
                                <Link to="/auth/signup">
                                    <Button variant="contained">Get Started</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="flex md:hidden items-center justify-between h-16">
                    {/* Mobile Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LIVBlog
            </span>
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
                                            to="/create"
                                            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        >
                                            <PenSquare className="h-5 w-5" />
                                            <span>Write Post</span>
                                        </Link>
                                        <Link
                                            to="/profile"
                                            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        >
                                            <User className="h-5 w-5" />
                                            <span>Profile</span>
                                        </Link>
                                        <Link
                                            to="/settings"
                                            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        >
                                            <Settings className="h-5 w-5" />
                                            <span>Settings</span>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        >
                                            <LogIn className="h-5 w-5" />
                                            <span>Sign In</span>
                                        </Link>
                                        <Link
                                            to="/register"
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