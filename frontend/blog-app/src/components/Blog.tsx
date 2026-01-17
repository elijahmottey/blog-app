import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Grid, Card, CardContent, CardMedia, Chip, Button, TextField, InputAdornment, Pagination } from '@mui/material';
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
  const postsPerPage = 9;
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

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
          <Typography variant="h2" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
            Blog
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
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
            <Grid container spacing={4}>
              {filteredPosts.map((post, index) => (
                //   @ts-ignore
                <Grid xs={12} sm={6} lg={4} key={post.id || index}>
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
                      image={`https://images.unsplash.com/photo-${1500000000000 + (index % 10)}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`}
                      alt={post.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label="Technology"
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      </Box>

                      <Typography
                        variant="h6"
                        component={Link}
                        to={`/posts/${post.id}`}
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
                </Grid>
              ))}
            </Grid>

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