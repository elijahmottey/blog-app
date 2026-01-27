import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, Container, Card, CardContent, CardMedia, Chip, Button, TextField, InputAdornment, Pagination } from '@mui/material';
import { CalendarDays, User, Search, Filter, Download } from 'lucide-react';
import BackendApi, { type PostDto } from '../service/BackendApi';
import { excerpt, formatDate } from '../lib/utils';
import { downloadPost, downloadPostPdf } from '../lib/download';

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [highlightedPost, setHighlightedPost] = useState<PostDto | null>(null);
  const [searchParams] = useSearchParams();
  const postsPerPage = 9;
  const navigate = useNavigate();

  // Unified blog post image
  const unifiedImageUrl = '/blog-unified-image.svg';

  useEffect(() => {
    fetchPosts();
    
    // Check for specific post/comment ID in URL params
    const postId = searchParams.get('postId');
    const commentId = searchParams.get('commentId');
    
    if (postId || commentId) {
      highlightSpecificContent(postId, commentId);
    }
  }, [currentPage, searchParams]);

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
      const response = await BackendApi.getAllPost(currentPage - 1, postsPerPage);
      setPosts(response.data?.content || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Typography variant="h2" component="h1" sx={{ mb: 2, fontWeight: 'bold',color:'white' }}>
              Blog
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 ,color:'white'}}>
              Discover insights, tutorials, and stories from our developer community
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: 6 }}>
          {/* Search and Filter */}
          <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
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
            <Button
                variant="contained"
                startIcon={<Filter />}
                sx={{ textTransform: 'none' }}
            >
              Filter
            </Button>
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
                              image={unifiedImageUrl}
                              alt="Blog post illustration"
                              sx={{ objectFit: 'cover' }}
                          />
                          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ mb: 2 }}>
                              <Chip
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ mb: 1 }}
                              />
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
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <User size={16} />
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  {post.users || 'Anonymous'}
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
                                  <Button size="small" startIcon={<Download />} onClick={() => downloadPost(post)}>
                                    TXT
                                  </Button>
                                  <Button size="small" onClick={() => downloadPostPdf(post)}>
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