import { Link, useLocation } from "react-router-dom";
import BackendApi, { type PostDto, type ApiResponse, type PagedResponse } from "../service/BackendApi.ts";
import { useApi } from "../hooks/useApi";
import { CalendarDays, User, ArrowRight, Sparkles, TrendingUp, Clock, ChevronRight, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import {Button, useTheme} from "@mui/material";
import { alpha } from '@mui/material/styles';
import {excerpt, formatDate, getAuthorName} from "../lib/utils.ts";


export default function Home() {
    const theme = useTheme();
    const { data, loading, error } = useApi<ApiResponse<PagedResponse<PostDto>>>(
        async () => {
            return await BackendApi.getAllPost();
        },
        true
    );

    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const qParam = params.get('q') || '';
    const [searchResults, setSearchResults] = useState<PostDto[]>([]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        let mounted = true;
        const q = qParam.trim();
        if (!q) {
            setSearchResults([]);
            return;
        }
        (async () => {
            try {
                const resp = await BackendApi.getAllPost(0, 200);
                const postsList = resp.data?.content || [];
                const filtered = postsList.filter(p => (p.title||'').toLowerCase().includes(q.toLowerCase()) || (p.content||'').toLowerCase().includes(q.toLowerCase()));
                if (mounted) setSearchResults(filtered);
            } catch (e) {
                // ignore
            }
        })();
        return () => { mounted = false; };
    }, [qParam]);

    const posts = data?.data?.content || [];
    const latestPosts = [...posts]
        .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        })
        .slice(0, 6);

    const featuredPost = latestPosts[0];
    const gridPosts = latestPosts.slice(1);

    const allPosts = posts.length > 0 ? posts : [];

    // Unified blog post image
    const unifiedImageUrl = '/blog-unified-image.svg';

    return (
        <main className="min-h-screen" style={{ background: `linear-gradient(180deg, ${theme.palette.background.default}, ${alpha(theme.palette.background.default, 0.95)})` }}>

            {/* Hero Section */}
            <section className="relative overflow-hidden py-12 md:py-20 px-4">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/50 to-transparent"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200 rounded-full -translate-y-32 translate-x-32 opacity-20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-200 rounded-full translate-y-40 -translate-x-40 opacity-20 blur-3xl"></div>

                <div className="container relative mx-auto max-w-4xl">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full shadow-sm" style={{ backgroundColor: alpha(theme.palette.background.paper, 0.9), border: `1px solid ${theme.palette.divider}` }}>
                            <Sparkles className="w-4 h-4" style={{ color: theme.palette.primary.main }} />
                            <span className="text-sm font-medium" style={{ color: theme.palette.text.primary }}>Welcome to LIV Blog</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: theme.palette.text.primary }}>
                            Where <span style={{ color: theme.palette.primary.main }}>Ideas</span> Meet <span style={{ color: theme.palette.primary.main }}>Innovation</span>
                        </h1>

                        <p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-2xl mx-auto px-4" style={{ color: theme.palette.text.secondary }}>
                            Discover cutting-edge insights, expert tutorials, and compelling stories
                            from a community passionate about technology and creativity.
                        </p>

                        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm" style={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}>
                                <TrendingUp className="w-4 h-4" style={{ color: theme.palette.primary.main }} />
                                <span className="text-sm font-medium" style={{ color: theme.palette.text.primary }}>{posts.length}+ Articles</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm" style={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}>
                                <User className="w-4 h-4" style={{ color: theme.palette.primary.main }} />
                                <span className="text-sm font-medium" style={{ color: theme.palette.text.primary }}>Expert Authors</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm" style={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}>
                                <Clock className="w-4 h-4" style={{ color: theme.palette.primary.main }} />
                                <span className="text-sm font-medium" style={{ color: theme.palette.text.primary }}>Daily Updates</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                component={Link}
                                to="/blog"
                                variant="contained"
                                endIcon={<ChevronRight />}
                                sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}
                            >
                                Explore Articles
                            </Button>
                            <Button
                                component={Link}
                                to="/about"
                                variant="outlined"
                                sx={{ color: theme.palette.text.primary, borderColor: theme.palette.divider }}
                            >
                                Learn About Us
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Post */}
            {featuredPost && (
                <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
                    <div className="max-w-6xl mx-auto">
                        <div className="rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden" style={{ background: `linear-gradient(180deg, ${theme.palette.background.paper}, ${alpha(theme.palette.background.paper, 0.95)})`, border: `1px solid ${theme.palette.divider}` }}>
                            <div className="md:flex">
                                <div className="md:w-2/3 p-6 sm:p-8 md:p-12">
                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full" style={{ background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.12)}, ${alpha(theme.palette.secondary.main, 0.12)})`, color: theme.palette.text.primary, border: `1px solid ${theme.palette.divider}` }}>
                                            <Sparkles className="w-3 h-3" style={{ color: theme.palette.primary.main }} />
                                            Featured Story
                                        </span>
                                        <time className="flex items-center gap-1 text-xs font-medium" style={{ color: theme.palette.text.secondary }}>
                                            <CalendarDays className="w-4 h-4" />
                                            {formatDate(featuredPost.createdAt)}
                                        </time>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight" style={{ color: theme.palette.text.primary }}>
                                        {featuredPost.title}
                                    </h2>
                                    <p className="mb-6 leading-relaxed text-sm sm:text-base" style={{ color: theme.palette.text.secondary }}>
                                        {excerpt(featuredPost.content, 200)}
                                    </p>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                                                <User className="w-4 h-4 text-primary-foreground" />
                                            </div>
                                            <div>
                                                {/*@ts-ignore*/}
                                                <div className="font-semibold">{getAuthorName(featuredPost.user)}</div>
                                                <div className="text-xs text-gray-500">Author</div>
                                            </div>
                                        </div>
                                        <Button
                                            component={Link}
                                            to={`/dashboard/posts/${featuredPost.id}`}
                                            variant="contained"
                                            endIcon={<ArrowRight />}
                                        >
                                            Read Full Article
                                        </Button>
                                    </div>
                                </div>
                                <div className="md:w-1/3 relative min-h-[300px] md:min-h-full">
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-gray-900/10 to-transparent z-10"></div>
                                    <img
                                        src={unifiedImageUrl}
                                        alt={featuredPost.title}
                                        className="w-full h-full object-cover absolute inset-0"
                                    />
                                    <div className="absolute bottom-4 left-4 z-20">
                                        <div style={{ color: theme.palette.getContrastText('#000000'), backgroundColor: alpha('#000000', 0.3) }} className="text-sm font-medium px-3 py-1.5 rounded-lg">
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
                                to="/blog"
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
                                variant="contained"
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

                    {/* If search query present show searchResults */}
                    {qParam && (
                      <div className="mb-6">
                        <h3 className="text-xl font-semibold" style={{ color: theme.palette.text.primary }}>Search results for "{qParam}"</h3>
                        {searchResults.length === 0 ? (
                          <p style={{ color: theme.palette.text.secondary }}>No results found.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {searchResults.map((post) => (
                              <Link key={post.id} to={`/dashboard/posts/${post.id}`} className="group block">
                                <article style={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }} className="rounded-xl overflow-hidden">
                                    <div className="p-4">
                                        <h4 style={{ color: theme.palette.text.primary, fontWeight: 700 }}>{post.title}</h4>
                                        <p style={{ color: theme.palette.text.secondary }}>{excerpt(post.content, 120)}</p>
                                    </div>
                                </article>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {!loading && !error && allPosts.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                {(isMobile && featuredPost ? [featuredPost, ...gridPosts] : gridPosts).map((post) => (
                                    <Link
                                        key={post.id}
                                        to={`/dashboard/posts/${post.id}`}
                                        className="group block"
                                    >
                                        <article
                                            className="rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                                            style={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}
                                         >
                                            <div className="relative overflow-hidden h-48 sm:h-56" style={{ background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.98)}, ${alpha(theme.palette.background.paper, 0.95)})` }}>
                                                <img
                                                    src={unifiedImageUrl}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute top-4 right-4" style={{ backgroundColor: alpha(theme.palette.background.paper, 0.9), borderRadius: 9999, padding: '6px 12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                                                    <time className="flex items-center gap-1 text-xs font-medium" style={{ color: theme.palette.text.secondary }}>
                                                        <CalendarDays className="w-3 h-3" />
                                                        {formatDate(post.createdAt)}
                                                    </time>
                                                </div>
                                            </div>
                                            <div className="p-5 sm:p-6">
                                                <h3 className="text-lg sm:text-xl font-bold mb-3 transition-colors line-clamp-2" style={{ color: theme.palette.text.primary }}>
                                                     {post.title}
                                                 </h3>
                                                <p className="mb-4 leading-relaxed text-sm sm:text-base line-clamp-3" style={{ color: theme.palette.text.secondary }}>
                                                     {excerpt(post.content, isMobile ? 100 : 120)}
                                                 </p>
                                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                                                            <User className="w-4 h-4 text-primary-foreground" />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-sm" style={{ color: theme.palette.text.primary }}>
                                                                {/*@ts-ignore*/}
                                                                {getAuthorName(post?.user)}
                                                            </div>
                                                            <div className="text-xs" style={{ color: theme.palette.text.secondary }}>Author</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                         </article>
                                     </Link>
                                 ))}
                             </div>

                            {/* Featured Post Banner for Desktop (if no featured post displayed above) */}
                            {!isMobile && featuredPost && (
                                <div className="mt-12 rounded-2xl p-6 sm:p-8" style={{ background: `linear-gradient(90deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.9)})`, border: `1px solid ${theme.palette.divider}` }}>
                                     <div className="flex items-center justify-between">
                                         <div>
                                            <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: theme.palette.text.primary }}>
                                                 Explore More Featured Content
                                             </h3>
                                            <p style={{ color: theme.palette.text.secondary }}>
                                                 Dive deeper into our most insightful articles and tutorials
                                             </p>
                                         </div>
                                         <Button
                                             component={Link}
                                             to={`/blog`}
                                             variant="contained"
                                         >
                                             Discover More
                                         </Button>
                                     </div>
                                 </div>
                             )}
                        </>
                    )}

                    {/* Newsletter Subscription */}
                    <div className="mt-16 sm:mt-20">
                        <div className="max-w-4xl mx-auto rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-lg" style={{ background: `linear-gradient(180deg, ${theme.palette.background.paper}, ${alpha(theme.palette.background.paper, 0.98)})`, border: `1px solid ${theme.palette.divider}` }}>
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl mb-4">
                                    <Mail className="w-6 h-6 text-primary-foreground" />
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: theme.palette.text.primary }}>
                                     Never Miss an Update
                                 </h3>
                                <p className="text-sm sm:text-base max-w-2xl mx-auto" style={{ color: theme.palette.text.secondary }}>
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
                                     variant="outlined"
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
