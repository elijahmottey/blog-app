import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare } from 'lucide-react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Avatar,
  Divider
} from '@mui/material';

export const CommentsManagement: React.FC = () => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  const comments = userProfile?.comments ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: { xs: 2, md: 3 } }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 0.5 }}>
              Your Comments
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and review the comments you have made across posts.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
            <MessageSquare size={24} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {comments.length}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            All Comments
          </Typography>
        </Box>
        
        {comments.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Box sx={{ color: 'text.secondary', display: 'inline-flex', mb: 2 }}>
              <MessageSquare size={48} />
            </Box>
            <Typography color="text.secondary">
              You haven't made any comments yet.
            </Typography>
          </Box>
        ) : (
          <Box>
            {comments.map((c, index) => (
              <Box key={c.id}>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 40, height: 40 }}>
                      <MessageSquare size={20} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ color: 'text.primary', mb: 1 }}>
                        {c.content}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Comment ID: {c.id}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                {index < comments.length - 1 && <Divider />}
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CommentsManagement;