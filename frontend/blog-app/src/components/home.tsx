import { Link } from "react-router-dom";
import BackendApi, { type PostDto, type ApiResponse, type PagedResponse } from "../service/BackendApi.ts";
import { useApi } from "../hooks/useApi";
import { CalendarDays, User, ArrowRight, Sparkles, TrendingUp, Clock, ChevronRight, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import {Button} from "@mui/material";

function formatDate(iso?: string) {
    if (!iso) return "";
    try {
        const d = new Date(iso);
        return d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    } catch {
        return iso;
    }
}

function excerpt(text?: string, length = 160) {
    if (!text) return "";
    const stripped = text.replace(/<[^>]+>/g, "");
    return stripped.length > length ? stripped.slice(0, length).trim() + "..." : stripped;
}

function getAuthorName(user?: { name?: string; email?: string }) {
    if (!user) return "Anonymous";
    if (user.name && user.name !== "Anonymous" && user.name.length > 0) {
        return user.name;
    }
    if (user.email) {
        return user.email.split('@')[0];
    }
    return "Anonymous";
}

export default function Home() {
    const { data, loading, error } = useApi<ApiResponse<PagedResponse<PostDto>>>(
        async () => {
            return await BackendApi.getAllPost();
        },
        true
    );

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const posts = data?.data?.content || [];
    const latestPosts = [...posts]
        .sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
        .slice(0, 6);

    const featuredPost = latestPosts[0];
    const gridPosts = latestPosts.slice(1);

    const allPosts = posts.length > 0 ? posts : [];

    // Unsplash image placeholders for variety
    const imageUrls = [
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ];

    const getImageUrl = (index: number) => imageUrls[index % imageUrls.length];

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-amber-50/20">

            {/* Hero Section */}
            <section className="relative overflow-hidden py-12 md:py-20 px-4">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/50 to-transparent"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200 rounded-full -translate-y-32 translate-x-32 opacity-20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-200 rounded-full translate-y-40 -translate-x-40 opacity-20 blur-3xl"></div>

                <div className="container relative mx-auto max-w-4xl">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-amber-100">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            <span className="text-sm font-medium text-gray-700">Welcome to LIV Blog</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Where <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500">Ideas</span> Meet <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500">Innovation</span>
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto px-4">
                            Discover cutting-edge insights, expert tutorials, and compelling stories
                            from a community passionate about technology and creativity.
                        </p>

                        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-100">
                                <TrendingUp className="w-4 h-4 text-amber-600" />
                                <span className="text-sm font-medium text-gray-700">{posts.length}+ Articles</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-100">
                                <User className="w-4 h-4 text-amber-600" />
                                <span className="text-sm font-medium text-gray-700">Expert Authors</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-100">
                                <Clock className="w-4 h-4 text-amber-600" />
                                <span className="text-sm font-medium text-gray-700">Daily Updates</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                to="#latest"
                                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                <Button endIcon={<ChevronRight className="w-4 h-4" />}>
                                    Explore Articles
                                </Button>


                            </Link>
                            <Link
                                to="/archive"
                                className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all duration-300"
                            >
                                View All Posts
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Post */}
            {featuredPost && (
                <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-amber-100">
                            <div className="md:flex">
                                <div className="md:w-2/3 p-6 sm:p-8 md:p-12">
                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-xs font-semibold rounded-full border border-amber-200">
                                            <Sparkles className="w-3 h-3" />
                                            Featured Story
                                        </span>
                                        <time className="flex items-center gap-1 text-sm text-gray-500">
                                            <CalendarDays className="w-4 h-4" />
                                            {formatDate(featuredPost.createdAt)}
                                        </time>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                        {featuredPost.title}
                                    </h2>
                                    <p className="text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">
                                        {excerpt(featuredPost.content, 200)}
                                    </p>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                                                <User className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <div className="font-semibold">{getAuthorName(featuredPost.user)}</div>
                                                <div className="text-xs text-gray-500">Author</div>
                                            </div>
                                        </div>
                                        <Link
                                            to={`/post/${featuredPost.id}`}
                                            className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                                        >
                                            Read Full Article
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                                <div className="md:w-1/3 relative min-h-[300px] md:min-h-full">
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-gray-900/10 to-transparent z-10"></div>
                                    <img
                                        src={getImageUrl(0)}
                                        alt={featuredPost.title}
                                        className="w-full h-full object-cover absolute inset-0"
                                    />
                                    <div className="absolute bottom-4 left-4 z-20">
                                        <div className="text-white text-sm font-medium bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                                            📖 {Math.ceil(featuredPost.content?.length / 1000) || 5} min read
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Latest Posts Grid */}
            <section id="latest" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-12">
                        <div className="mb-4 sm:mb-0">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Latest Stories</h2>
                            <p className="text-gray-600 mt-1">Fresh perspectives and insights from our writers</p>
                        </div>
                        {posts.length > 3 && (
                            <Link
                                to="/archive"
                                className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-semibold group"
                            >
                                View All Posts
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        )}
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-48 sm:h-56 rounded-xl mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                                    <div className="flex justify-between">
                                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="text-center py-12 bg-gradient-to-br from-red-50/50 to-white rounded-2xl border border-red-100 px-4">
                            <div className="text-red-600 font-semibold mb-3 text-lg">Failed to load posts</div>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">{error.message}</p>
                            <Button

                                onClick={() => window.location.reload()}
                                className="px-6 font-white py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                Try Again
                            </Button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && allPosts.length === 0 && (
                        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200">
                            <div className="text-gray-400 mb-4 text-4xl">📝</div>
                            <div className="text-gray-900 font-semibold mb-2">No posts yet</div>
                            <p className="text-gray-600 max-w-md mx-auto">Be the first to share your insights with our community!</p>
                        </div>
                    )}

                    {/* Posts Grid */}
                    {!loading && !error && allPosts.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                {(isMobile && featuredPost ? [featuredPost, ...gridPosts] : gridPosts).map((post, index) => (
                                    <article
                                        key={post.id}
                                        className="group bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden hover:border-amber-300 hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
                                    >
                                        <div className="relative overflow-hidden h-48 sm:h-56 bg-gradient-to-br from-gray-100 to-gray-200">
                                            <img
                                                src={getImageUrl(index + 1)}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                                                <time className="flex items-center gap-1 text-xs font-medium text-gray-700">
                                                    <CalendarDays className="w-3 h-3" />
                                                    {formatDate(post.createdAt)}
                                                </time>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent"></div>
                                        </div>
                                        <div className="p-5 sm:p-6">
                                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-700 transition-colors line-clamp-2">
                                                {post.title}
                                            </h3>
                                            <p className="text-gray-600 mb-4 leading-relaxed text-sm sm:text-base line-clamp-3">
                                                {excerpt(post.content, isMobile ? 100 : 120)}
                                            </p>
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                                                        <User className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-800 text-sm">
                                                            {getAuthorName(post?.user)}
                                                        </div>
                                                        <div className="text-xs text-gray-500">Author</div>
                                                    </div>
                                                </div>
                                                <Link
                                                    to={`/post/${post.id}`}
                                                    className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-semibold group/read text-sm sm:text-base"
                                                >
                                                    Read
                                                    <ArrowRight className="w-4 h-4 group-hover/read:translate-x-1 transition-transform" />
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {/* Featured Post Banner for Desktop (if no featured post displayed above) */}
                            {!isMobile && featuredPost && (
                                <div className="mt-12 bg-gradient-to-r from-amber-50/50 to-orange-50/30 rounded-2xl border border-amber-100 p-6 sm:p-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                                                Explore More Featured Content
                                            </h3>
                                            <p className="text-gray-600">
                                                Dive deeper into our most insightful articles and tutorials
                                            </p>
                                        </div>
                                        <Link
                                            to={`/post/${featuredPost.id}`}
                                            className="hidden sm:inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                                        >
                                            Discover More
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Newsletter Subscription */}
                    <div className="mt-16 sm:mt-20">
                        <div className="max-w-4xl mx-auto bg-gradient-to-br from-white to-amber-50/50 rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-amber-100 shadow-lg">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl mb-4">
                                    <Mail className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                                    Never Miss an Update
                                </h3>
                                <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
                                    Join our community of readers. Get the latest articles, tutorials, and insights delivered directly to your inbox.
                                </p>
                            </div>
                            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-grow px-4 sm:px-5 py-3 sm:py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                                    required
                                />
                                <Button
                                    type="submit"
                                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-sm sm:text-base"
                                >
                                    Subscribe Now
                                </Button>
                            </form>
                            <p className="text-center text-gray-500 text-xs sm:text-sm mt-4">
                                No spam, unsubscribe anytime.
                            </p>
                        </div>
                    </div>
                </div>
            </section>


        </main>
    );
}