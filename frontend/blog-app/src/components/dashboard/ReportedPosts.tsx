import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Trash2, Eye, AlertTriangle } from 'lucide-react';
import { Button, Typography, IconButton, CircularProgress } from '@mui/material';
import BackendApi, { type PostReportDto } from '../../service/BackendApi';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { LIVBlogCard } from '../ui';
import { useTheme } from '@mui/material/styles';

export const ReportedPosts: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const theme = useTheme();

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['post-reports'],
    queryFn: () => BackendApi.getPostReports(0, 50),
  });

  const deleteReportMutation = useMutation({
    mutationFn: (reportId: number) => BackendApi.deleteReport(reportId),
    onSuccess: () => {
      toast.success('Report dismissed');
      queryClient.invalidateQueries({ queryKey: ['post-reports'] });
    },
    onError: () => toast.error('Failed to dismiss report'),
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: number) => BackendApi.deletePostBlog(postId),
    onSuccess: () => {
      toast.success('Post deleted');
      queryClient.invalidateQueries({ queryKey: ['post-reports'] });
    },
    onError: () => toast.error('Failed to delete post'),
  });

  const reports = (reportsData?.data as any)?.content || [];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Reported Posts
      </Typography>

      {reports.length === 0 ? (
        <LIVBlogCard padding="large">
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <AlertTriangle size={48} style={{ color: theme.palette.text.secondary, marginBottom: '16px' }} />
            <Typography variant="body1" color="text.secondary">
              No reported posts
            </Typography>
          </div>
        </LIVBlogCard>
      ) : (
        <LIVBlogCard padding="none">
          {reports.map((report: PostReportDto, index: number) => (
            <div
              key={report.id}
              style={{
                padding: '16px',
                borderBottom: index < reports.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {report.postTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Reported by: {report.reporterName} · {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                    Reason: "{report.reason}"
                  </Typography>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Eye size={14} />}
                      onClick={() => navigate(`/dashboard/posts/${report.postId}`)}
                    >
                      View Post
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<Trash2 size={14} />}
                      onClick={() => {
                        if (window.confirm('Delete this post?')) {
                          deletePostMutation.mutate(report.postId);
                        }
                      }}
                    >
                      Delete Post
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => deleteReportMutation.mutate(report.id)}
                    >
                      Dismiss Report
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </LIVBlogCard>
      )}
    </div>
  );
};
