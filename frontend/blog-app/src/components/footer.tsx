import { Github, Twitter, Linkedin, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="relative mt-auto bg-linear-to-b from-gray-50 to-white border-t">
            {/* Accent line */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-linear-to-r from-amber-400 via-amber-500 to-amber-600" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
                {/* Top section */}
                <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                                <BookOpen className="h-5 w-5 text-amber-600" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-gray-900">
                                LIVBlog
                            </span>
                        </div>
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
                                    className="text-gray-600 transition-all hover:text-amber-600 hover:translate-x-1 inline-block"
                                >
                                    All Posts
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/blog"
                                    className="text-gray-600 transition-all hover:text-amber-600 hover:translate-x-1 inline-block"
                                >
                                    Categories
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/blog"
                                    className="text-gray-600 transition-all hover:text-amber-600 hover:translate-x-1 inline-block"
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
                                    className="text-gray-600 transition-all hover:text-amber-600 hover:translate-x-1 inline-block"
                                >
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact"
                                    className="text-gray-600 transition-all hover:text-amber-600 hover:translate-x-1 inline-block"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/privacy-policy"
                                    className="text-gray-600 transition-all hover:text-amber-600 hover:translate-x-1 inline-block"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/terms-of-service"
                                    className="text-gray-600 transition-all hover:text-amber-600 hover:translate-x-1 inline-block"
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
                            {[Github, Twitter, Linkedin].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all hover:bg-amber-500 hover:text-white hover:shadow-lg hover:shadow-amber-500/30"
                                >
                                    <Icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom section */}
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 text-center md:flex-row">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} LIVBlog. All rights reserved.
                    </p>

                    <p className="text-sm text-gray-500">
                        Built with{" "}
                        <span className="font-medium text-amber-600">React</span>{" "}
                        &{" "}
                        <span className="font-medium text-amber-600">
                            Tailwind CSS
                        </span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
