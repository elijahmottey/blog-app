import { Github, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { Box, Typography } from "@mui/material";

const Footer = () => {
    return (
        <footer className="relative mt-auto bg-gradient-to-b from-gray-50 to-white border-t">
            {/* Accent line */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary via-primary to-primary" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
                {/* Top section */}
                <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" style={{ textDecoration: 'none' }}>
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
                                    <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                                        LIV
                                    </Typography>
                                </Box>
                                <Typography
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
                        <p className="text-sm leading-relaxed text-gray-600">
                            A modern blog platform for sharing ideas, tutorials,
                            and insights on software development and technology.
                        </p>
                    </div>

                    {/* Blog Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-900">
                            Blog
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link
                                    to="/blog"
                                    className="text-gray-600 transition-all hover:text-primary hover:translate-x-1 inline-block"
                                >
                                    All Posts
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/blog"
                                    className="text-gray-600 transition-all hover:text-primary hover:translate-x-1 inline-block"
                                >
                                    Categories
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/blog"
                                    className="text-gray-600 transition-all hover:text-primary hover:translate-x-1 inline-block"
                                >
                                    Tags
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-900">
                            Resources
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link
                                    to="/about"
                                    className="text-gray-600 transition-all hover:text-primary hover:translate-x-1 inline-block"
                                >
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact"
                                    className="text-gray-600 transition-all hover:text-primary hover:translate-x-1 inline-block"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/privacy-policy"
                                    className="text-gray-600 transition-all hover:text-primary hover:translate-x-1 inline-block"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/terms-of-service"
                                    className="text-gray-600 transition-all hover:text-primary hover:translate-x-1 inline-block"
                                >
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-900">
                            Community
                        </h3>
                        <div className="flex items-center gap-3">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-amber-500/30"
                            >
                                <Github className="h-5 w-5" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-amber-500/30"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-amber-500/30"
                            >
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom section */}
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 text-center md:flex-row">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} LIV Blog. All rights reserved.
                    </p>

                    <p className="text-sm text-gray-500">
                        Built with{" "}
                        <span className="font-medium text-primary">React</span>{" "}
                        &{" "}
                        <span className="font-medium text-primary">
                            Material-UI
                        </span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;