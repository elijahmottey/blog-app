import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { Box, Typography, Container, Card, CardContent, CardMedia, Chip, Button, TextField, InputAdornment, Pagination } from '@mui/material';
import { CalendarDays, User, Search, Filter, Download, X } from 'lucide-react';
import BackendApi, { type PostDto } from '../service/BackendApi';
import { excerpt, formatDate } from '../lib/utils';
import { downloadPost, downloadPostPdf } from '../lib/download';
import useDocumentTitle from "../hooks/useDocumentTitle.ts";

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [highlightedPost, setHighlightedPost] = useState<PostDto | null>(null);
  const [searchParams] = useSearchParams();
  const postsPerPage = 9;
  const navigate = useNavigate();
  useDocumentTitle('LIVBlog - Blog');
  const { category: routeCategory } = useParams<{ category?: string }>();

  const getCategoryImage = (category?: string) => {
    const images: Record<string, string> = {
      TECHNOLOGY: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
      SPIRITUAL: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop',
      POLITICS: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&auto=format&fit=crop',
      LEADERSHIP: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop',
      CULTURE: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop',
      HEALTH: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop',
      BUSINESS: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop',
      EDUCATION: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop',
      SPORTS: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop',
    };
    return images[category?.toUpperCase() || ''] || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop';
  };

  useEffect(() => {
    fetchCategories();
    // when routeCategory or page changes, fetch posts
    fetchPosts();

    // Check for specific post/comment ID in URL params
    const postId = searchParams.get('postId');
    const commentId = searchParams.get('commentId');

    if (postId || commentId) {
      highlightSpecificContent(postId, commentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchParams, routeCategory]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await BackendApi.getCategories();
      const categoryList = response.data || [];
      // Filter out null, undefined, and empty strings
      const filteredCategories = categoryList.filter((cat: string) => cat && cat.trim());
      setCategories(filteredCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const highlightSpecificContent = async (postId: string | null, commentId: string | null) => {
    try {
      if (postId) {
        const response = await BackendApi.getPostById(parseInt(postId));
        setHighlightedPost(response.data);
      } else if (commentId) {
        // Find post containing this comment
        const allPosts = await BackendApi.getAllPost(0, 100);
        const postWithComment = allPosts.data?.content?.find((post: any) =>
          post.comments?.some((comment: any) => comment.id === parseInt(commentId))
        );
        if (postWithComment) {
          setHighlightedPost(postWithComment);
        }
      }
    } catch (error) {
      console.error('Error highlighting content:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);

      // If routeCategory is present and not 'All', fetch by category; otherwise fetch all
      if (routeCategory && routeCategory.toLowerCase() !== 'all') {
        // routeCategory may be human-friendly; backend will normalize, so pass through
        const response = await BackendApi.getPostsByCategory(routeCategory, currentPage - 1, postsPerPage);
        setPosts(response.data?.content || []);
        setTotalPages(response.data?.totalPages || 1);
        setSelectedCategory(routeCategory);
      } else {
        const response = await BackendApi.getAllPost(currentPage - 1, postsPerPage);
        setPosts(response.data?.content || []);
        setTotalPages(response.data?.totalPages || 1);
        setSelectedCategory(null);
      }
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || post.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Typography variant="h6">Loading posts...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button variant="contained" onClick={fetchPosts}>
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: { xs: 6, md: 8 },
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" sx={{ mb: 2, fontWeight: 'bold', color: 'white' }}>
            Blog
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, color: 'white' }}>
            Discover insights, tutorials, and stories from our developer community
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Search and Filter */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              sx={{ flex: 1, minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Categories Filter */}
          {!loadingCategories && categories.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Filter size={20} />
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                  Categories:
                </Typography>
              </Box>

              {/* All Categories Chip */}
              <Chip
                label="All Categories"
                onClick={() => {
                  // navigate to category page for All
                  navigate('/blog/category/All');
                }}
                variant={selectedCategory === null ? "filled" : "outlined"}
                color={selectedCategory === null ? "primary" : "default"}
                sx={{ cursor: 'pointer' }}
              />

              {/* Individual Category Chips */}
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  onClick={() => {
                    // navigate to category page for deep linking
                    navigate(`/blog/category/${encodeURIComponent(category)}`);
                    // selectedCategory will be set via route effect
                  }}
                  variant={selectedCategory === category ? "filled" : "outlined"}
                  color={selectedCategory === category ? "primary" : "default"}
                  sx={{ cursor: 'pointer' }}
                />
              ))}

              {/* Clear Filter Button */}
              {selectedCategory && (
                <Button
                  size="small"
                  startIcon={<X size={16} />}
                  onClick={() => {
                    setSelectedCategory(null);
                    setCurrentPage(1);
                    navigate('/blog');
                  }}
                  variant="outlined"
                  color="error"
                >
                  Clear
                </Button>
              )}
            </Box>
          )}

        </Box>

        {/* Highlighted Post (from search) */}
        {highlightedPost && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, color: 'primary.main' }}>
              Search Result
            </Typography>
            <Card sx={{ border: 2, borderColor: 'primary.main', mb: 4 }}>
              <CardContent>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
                  {highlightedPost.title}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                  {highlightedPost.content}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                  <Chip icon={<User size={16} />} label={highlightedPost.users || 'Anonymous'} />
                  <Chip icon={<CalendarDays size={16} />} label={formatDate(highlightedPost.createdAt)} />
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {searchTerm ? 'No posts found matching your search.' : 'No posts available.'}
            </Typography>
            {searchTerm && (
              <Button variant="contained" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            )}
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {filteredPosts.map((post, index) => (
                <Box
                  key={post.id || index}
                  sx={{
                    flex: '1 1 300px',
                    maxWidth: { xs: '100%', sm: 'calc(50% - 16px)', lg: 'calc(33.333% - 16px)' },
                    minWidth: '300px'
                  }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                        cursor: 'pointer'
                      }
                    }}
                    onClick={() => navigate(`/dashboard/posts/${post.id}`)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={getCategoryImage(post.category)}
                      alt="Blog post illustration"
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ mb: 2 }}>
                        {post.category && (
                          <Chip
                            label={post.category}
                            size="small"
                            color="primary"
                            variant={selectedCategory === post.category ? "filled" : "outlined"}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/blog/category/${encodeURIComponent(post.category || '')}`);
                            }}
                            sx={{ mb: 1, cursor: 'pointer' }}
                          />
                        )}
                      </Box>

                      <Typography
                        variant="h6"
                        component={Link}
                        to={`/dashboard/posts/${post.id}`}
                        sx={{
                          textDecoration: 'none',
                          color: 'text.primary',
                          fontWeight: 'bold',
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          '&:hover': { color: 'primary.main' }
                        }}
                      >
                        {post.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {excerpt(post.content, 120)}
                      </Typography>

                      <Box sx={{ mt: 'auto', pt: 2 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main' }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${post.user?.name || post.users}`);
                          }}
                        >
                          <User size={16} />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {post.user?.name || post.users || 'Anonymous'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarDays size={16} />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {formatDate(post.createdAt)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button size="small" startIcon={<Download />} onClick={() => downloadPost(post, true)}>
                              TXT
                            </Button>
                            <Button size="small" onClick={() => downloadPostPdf(post, true)}>
                              PDF
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default Blog;

