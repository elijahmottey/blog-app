import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Container, Typography, Card, CardContent, CardMedia, Chip, Button, Pagination } from '@mui/material';
import { User, Download } from 'lucide-react';
import BackendApi, { type PostDto } from '../service/BackendApi';
import { excerpt } from '../lib/utils';
import { downloadPost, downloadPostPdf } from '../lib/download';

const CategoryView: React.FC = () => {
  const { category } = useParams();
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 9;

  useEffect(() => {
    if (category) fetchPosts(category, page);
  }, [category, page]);

  const fetchPosts = async (cat: string, pageNum: number) => {
    try {
      setLoading(true);
      if (cat.toLowerCase() === 'all') {
        const resp = await BackendApi.getAllPost(pageNum - 1, pageSize);
        setPosts(resp.data?.content || []);
        setTotalPages(resp.data?.totalPages || 1);
      } else {
        const resp = await BackendApi.getPostsByCategory(cat, pageNum - 1, pageSize);
        setPosts(resp.data?.content || []);
        setTotalPages(resp.data?.totalPages || 1);
      }
    } catch (err) {
      console.error('Error loading posts by category:', err);
      setPosts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Typography>Loading posts...</Typography>
      </Box>
    </Container>
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Category: {category}
        </Typography>

        {posts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6">No posts found for this category.</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {posts.map((post) => (
                <Card key={post.id} sx={{ width: '100%', maxWidth: 340 }} component={Link} to={`/dashboard/posts/${post.id}`}>
                  <CardMedia component="img" height="200" image={'/blog-unified-image.svg'} alt={post.title} />
                  <CardContent>
                    {post.category && <Chip label={post.category} size="small" color="primary" sx={{ mb: 1 }} />}
                    <Typography variant="h6" sx={{ mb: 1 }}>{post.title}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{excerpt(post.content, 100)}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <User size={16} />
                        <Typography variant="body2">{post.users || 'Anonymous'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" startIcon={<Download />} onClick={(e) => { e.preventDefault(); downloadPost(post); }}>
                          TXT
                        </Button>
                        <Button size="small" onClick={(e) => { e.preventDefault(); downloadPostPdf(post); }}>
                          PDF
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination count={totalPages} page={page} onChange={(_e, v) => setPage(v)} color="primary" />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default CategoryView;
