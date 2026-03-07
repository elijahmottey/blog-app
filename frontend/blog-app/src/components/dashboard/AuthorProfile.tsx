import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Avatar, Chip, CircularProgress, Button } from '@mui/material';
import { ArrowLeft, Mail, Calendar, FileText, MessageSquare } from 'lucide-react';
import BackendApi from '../../service/BackendApi';
import { format } from 'date-fns';
import useDocumentTitle from "../../hooks/useDocumentTitle.ts";
import { LIVBlogCard, LIVBlogLayout } from '../ui';
import { useTheme } from '@mui/material/styles';

export const AuthorProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [author, setAuthor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useDocumentTitle('LIVBlog - Author Profile');

  useEffect(() => {
    fetchAuthorProfile();
  }, [username]);

  const fetchAuthorProfile = async () => {
    try {
      setLoading(true);

      // First try to get the authenticated user's profile
      try {
        const profileResponse = await BackendApi.getUserProfile();
        const profile = profileResponse.data;
        if (profile.name === username || profile.email === username) {
          setAuthor(profile);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.log('Not authenticated user profile');
      }

      // If not authenticated user, search in all users
      const response = await BackendApi.getAllUsers(0, 1000);
      const users = response.data?.content || [];
      const foundAuthor = users.find((u: any) =>
        u.name === username || u.email === username
      );

      if (foundAuthor && foundAuthor.id) {
        const detailResponse = await BackendApi.getUserById(foundAuthor.id);
        setAuthor((detailResponse as any).data || detailResponse);
      } else {
        setError('Author not found');
      }
    } catch (err) {
      setError('Failed to load author profile');
      console.error('Error fetching author:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LIVBlogLayout.Container>
        <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </LIVBlogLayout.Container>
    );
  }

  if (error || !author) {
    return (
      <LIVBlogLayout.Container>
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h5" color="error" sx={{ mb: 2 }}>
            {error || 'Author not found'}
          </Typography>
          <Button startIcon={<ArrowLeft />} onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Box>
      </LIVBlogLayout.Container>
    );
  }

  return (
    <LIVBlogLayout.Container>
      <Button
        startIcon={<ArrowLeft />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <LIVBlogCard variant="elevated" padding="large">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              bgcolor: 'primary.main',
              fontSize: '3rem',
              mb: 2
            }}
          >
            {author.name?.charAt(0).toUpperCase()}
          </Avatar>

          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            {author.name}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip label={author.role || 'USER'} color="primary" size="small" />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 1 }}>
            <Mail size={16} />
            <Typography variant="body2">{author.email}</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
            <Calendar size={16} />
            <Typography variant="body2">
              Joined {author.createdAt ? format(new Date(author.createdAt), 'MMM dd, yyyy') : 'Unknown'}
            </Typography>
          </Box>
        </Box>

        {author.description && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              About
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
              {author.description}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
          <LIVBlogCard variant="outlined" padding="medium" style={{ textAlign: 'center', backgroundColor: theme.palette.primary.light + '20' }}>
            <FileText size={24} style={{ margin: '0 auto', marginBottom: 8, color: theme.palette.primary.main }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {author.posts?.length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Posts
            </Typography>
          </LIVBlogCard>

          <LIVBlogCard variant="outlined" padding="medium" style={{ textAlign: 'center', backgroundColor: theme.palette.secondary.light + '20' }}>
            <MessageSquare size={24} style={{ margin: '0 auto', marginBottom: 8, color: theme.palette.secondary.main }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {author.comments?.length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comments
            </Typography>
          </LIVBlogCard>
        </Box>
      </LIVBlogCard>
    </LIVBlogLayout.Container>
  );
};