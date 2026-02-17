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
import { LIVBlogLayout, LIVBlogHeader, LIVBlogCard} from '../ui';
import { useTheme } from '@mui/material/styles';

interface DraftPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const DraftsManagement: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
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
    <LIVBlogLayout.Container>
      {/* Header */}
      <LIVBlogHeader
        title="My Drafts"
        subtitle={`Continue working on your saved drafts (${drafts.length} drafts)`}
        size="large"
        actions={
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => navigate('/dashboard/posts/create')}
            className="aws-button aws-button-primary"
            style={{
              fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            New Post
          </Button>
        }
      />

      {/* Drafts Grid */}
      {drafts.length === 0 ? (
        <LIVBlogCard
          variant="default"
          padding="large"
        >
          <div className="aws-text-center aws-py-12">
            <FileText size={48} style={{ color: '#9e9e9e', marginBottom: 16 }} />
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                color: 'text.secondary',
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              No drafts yet
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 3, 
                color: 'text.secondary',
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              Start writing and save your work as drafts to continue later
            </Typography>
            <Button
              variant="contained"
              startIcon={<Plus />}
              onClick={() => navigate('/dashboard/posts/create')}
              className="aws-button aws-button-primary"
              style={{
                fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              Create Your First Post
            </Button>
          </div>
        </LIVBlogCard>
      ) : (
        <LIVBlogLayout.Grid cols={3} gap="lg">
          {drafts.map((draft) => (
            <LIVBlogCard
              key={draft.id}
              variant="default"
              padding="medium"
              className="aws-min-h-card"
            >
              <div className="aws-flex aws-items-start aws-justify-between aws-mb-3">
                <h3 
                  className="aws-text-lg aws-font-semibold aws-flex-1 aws-mr-2"
                  style={{ 
                    color: theme.palette.text.primary,
                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  {draft.title || 'Untitled Draft'}
                </h3>
                <Chip
                  label="Draft"
                  size="small"
                  color="warning"
                  variant="outlined"
                  className="aws-chip"
                  style={{
                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                />
              </div>

              {draft.content && (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2, 
                    lineHeight: 1.6,
                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  {getPreview(draft.content)}
                </Typography>
              )}

              <div className="aws-flex aws-items-center aws-gap-4 aws-mb-3">
                <div className="aws-flex aws-items-center aws-gap-1">
                  <FileText size={14} />
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    style={{
                      fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    {getWordCount(draft.content)} words
                  </Typography>
                </div>
                <div className="aws-flex aws-items-center aws-gap-1">
                  <Clock size={14} />
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    style={{
                      fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    {format(new Date(draft.updatedAt), 'MMM dd, HH:mm')}
                  </Typography>
                </div>
              </div>

              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  mb: 3,
                  fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                <Calendar size={12} />
                Created {format(new Date(draft.createdAt), 'MMM dd, yyyy')}
              </Typography>

              <div className="aws-flex aws-justify-between aws-items-center">
                <Button
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => editDraft(draft)}
                  className="aws-button aws-button-primary"
                  style={{
                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
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
              </div>
            </LIVBlogCard>
          ))}
        </LIVBlogLayout.Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, draft: null })}
        PaperProps={{
          sx: {
            fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }
        }}
      >
        <DialogTitle
          style={{
            fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          Delete Draft
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone.
          </Alert>
          <Typography
            style={{
              fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            Are you sure you want to delete the draft "{deleteDialog.draft?.title || 'Untitled Draft'}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, draft: null })}
            className="aws-button aws-button-secondary"
            style={{
              fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteDialog.draft && deleteDraft(deleteDialog.draft.id)}
            style={{
              fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </LIVBlogLayout.Container>
  );
};