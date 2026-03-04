import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  CircularProgress,
  Pagination,
  Avatar
} from '@mui/material';
import { Bookmark, ArrowRight, Calendar, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BackendApi from '../../service/BackendApi';
import { LIVBlogHeader, LIVBlogLayout } from '../ui';
import { format } from 'date-fns';
import { useTheme, alpha } from '@mui/material/styles';
import useDocumentTitle from "../../hooks/useDocumentTitle.ts";

export const LIVSave: React.FC = () => {
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const navigate = useNavigate();
  const theme = useTheme();
  useDocumentTitle('LIVSave | Bookmarks');

  const { data: postsData, isLoading, isError } = useQuery({
    queryKey: ['livmarks', page],
    queryFn: () => BackendApi.getLIVMarkedPosts(page - 1, pageSize),
  });

  const posts = postsData?.data?.content || [];
  const totalPages = postsData?.data?.totalPages || 0;

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <LIVBlogLayout.Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </LIVBlogLayout.Container>
    );
  }

  if (isError) {
    return (
      <LIVBlogLayout.Container>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="error">
            Failed to load bookmarks. Please try again later.
          </Typography>
        </Box>
      </LIVBlogLayout.Container>
    );
  }

  return (
    <div className="aws-spacing-y-lg">
      <LIVBlogHeader
        title="LIVSave"
        subtitle="Your personal collection of bookmarked posts"
        actions={
          <Chip 
            icon={<Bookmark size={16} />} 
            label={`${postsData?.data?.totalElements || 0} Saved`} 
            color="primary" 
            variant="outlined" 
            sx={{ borderRadius: '8px' }}
          />
        }
      />

      {posts.length === 0 ? (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8, 
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 4,
            border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`
          }}
        >
          <Bookmark size={64} style={{ color: theme.palette.primary.main, opacity: 0.5, marginBottom: 16 }} />
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            No bookmarks yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
            Start exploring posts and click the bookmark icon to save them here for later reading.
          </Typography>
          <Button 
            component={Link} 
            to="/dashboard/posts" 
            variant="contained" 
            size="large"
            startIcon={<ArrowRight />}
          >
            Explore Posts
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {posts.map((post) => (
              <Grid item xs={12} sm={6} md={4} key={post.id}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 3,
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                      borderColor: theme.palette.primary.main
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      {post.category && (
                        <Chip 
                          label={post.category} 
                          size="small" 
                          sx={{ 
                            bgcolor: alpha(theme.palette.primary.main, 0.1), 
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            borderRadius: '6px'
                          }} 
                        />
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Calendar size={14} />
                        {post.createdAt ? format(new Date(post.createdAt), 'MMM dd') : ''}
                      </Typography>
                    </Box>
                    
                    <Typography 
                      variant="h6" 
                      component={Link} 
                      to={`/dashboard/posts/${post.id}`}
                      sx={{ 
                        fontWeight: 700, 
                        mb: 1.5, 
                        display: 'block', 
                        textDecoration: 'none', 
                        color: 'text.primary',
                        lineHeight: 1.3,
                        '&:hover': { color: theme.palette.primary.main }
                      }}
                    >
                      {post.title}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 3,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {post.content.replace(/[#*`]/g, '').substring(0, 150)}...
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar 
                        src={post.user?.avatar} 
                        alt={post.user?.name || 'User'}
                        sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                      >
                        {(post.user?.name || 'U').charAt(0)}
                      </Avatar>
                      <Typography variant="caption" fontWeight={500}>
                        {post.user?.name || 'Anonymous'}
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button 
                      component={Link} 
                      to={`/dashboard/posts/${post.id}`} 
                      fullWidth 
                      variant="outlined"
                      endIcon={<ArrowRight size={16} />}
                      sx={{ borderRadius: 2 }}
                    >
                      Read Post
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </div>
  );
};