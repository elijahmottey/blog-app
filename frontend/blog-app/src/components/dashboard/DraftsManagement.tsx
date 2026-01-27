import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Button,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip
} from '@mui/material';
import {
  FileText,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface DraftPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const DraftsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<DraftPost[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; draft: DraftPost | null }>({
    open: false,
    draft: null
  });

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = () => {
    const savedDrafts = JSON.parse(localStorage.getItem('blog_drafts') || '[]');
    setDrafts(savedDrafts);
  };

  const deleteDraft = (draftId: string) => {
    const updatedDrafts = drafts.filter(d => d.id !== draftId);
    localStorage.setItem('blog_drafts', JSON.stringify(updatedDrafts));
    setDrafts(updatedDrafts);
    toast.success('Draft deleted successfully');
    setDeleteDialog({ open: false, draft: null });
  };

  const editDraft = (draft: DraftPost) => {
    // Navigate to create post with draft data
    navigate('/dashboard/posts/create', { state: { draft } });
  };

  const getWordCount = (content: string) => {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getPreview = (content: string, maxLength: number = 150) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2
        }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              My Drafts
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Continue working on your saved drafts ({drafts.length} drafts)
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => navigate('/dashboard/posts/create')}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            New Post
          </Button>
        </Box>
      </Paper>

      {/* Drafts Grid */}
      {drafts.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <FileText size={48} style={{ color: '#9e9e9e', marginBottom: 16 }} />
          <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
            No drafts yet
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Start writing and save your work as drafts to continue later
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => navigate('/dashboard/posts/create')}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Create Your First Post
          </Button>
        </Paper>
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)'
          },
          gap: 3
        }}>
          {drafts.map((draft) => (
            <Card key={draft.id} sx={{ borderRadius: 2, height: 'fit-content' }}>
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, flex: 1, mr: 1 }}>
                    {draft.title || 'Untitled Draft'}
                  </Typography>
                  <Chip
                    label="Draft"
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                </Box>

                {draft.content && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                    {getPreview(draft.content)}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <FileText size={14} />
                    <Typography variant="caption" color="text.secondary">
                      {getWordCount(draft.content)} words
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Clock size={14} />
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(draft.updatedAt), 'MMM dd, HH:mm')}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Calendar size={12} />
                  Created {format(new Date(draft.createdAt), 'MMM dd, yyyy')}
                </Typography>
              </CardContent>

              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => editDraft(draft)}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Continue Writing
                </Button>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setDeleteDialog({ open: true, draft })}
                >
                  <Trash2 size={16} />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, draft: null })}
      >
        <DialogTitle>Delete Draft</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone.
          </Alert>
          <Typography>
            Are you sure you want to delete the draft "{deleteDialog.draft?.title || 'Untitled Draft'}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, draft: null })}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteDialog.draft && deleteDraft(deleteDialog.draft.id)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};