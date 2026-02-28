import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare } from 'lucide-react';
import { CircularProgress, Avatar, Divider } from '@mui/material';
import { LIVBlogHeader, LIVBlogCard } from '../ui';
import { useTheme } from '@mui/material/styles';
import useDocumentTitle from "../../hooks/useDocumentTitle.ts";

export const CommentsManagement: React.FC = () => {
  const { userProfile, loading } = useAuth();
  const theme = useTheme();
    useDocumentTitle('LIVBlog | Comments ');

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '200px' }}>
        <CircularProgress size={48} />
      </div>
    );
  }

  const comments = userProfile?.comments ?? [];

  return (
    <div className="aws-spacing-y-lg">
      <LIVBlogHeader
        title="Comments Management"
        subtitle="Manage and review the comments you have made across posts"
        size="large"
        actions={
          <div className="flex items-center gap-2" style={{ color: theme.palette.primary.main }}>
            <MessageSquare size={24} />
            <span className="aws-header-md" style={{ margin: 0 }}>{comments.length}</span>
          </div>
        }
      />

      <LIVBlogCard title="All Comments" padding="none">
        {comments.length === 0 ? (
          <div className="text-center aws-spacing-y-xl">
            <MessageSquare size={48} style={{ color: theme.palette.text.secondary, margin: '0 auto 16px' }} />
            <p className="aws-text-body" style={{ color: theme.palette.text.secondary, margin: 0 }}>
              You haven't made any comments yet.
            </p>
          </div>
        ) : (
          <div>
            {comments.map((c, index) => (
              <div key={c.id}>
                <div className="aws-spacing-md">
                  <div className="flex items-start gap-3">
                    <Avatar 
                      style={{ 
                        backgroundColor: theme.palette.primary.light, 
                        color: theme.palette.primary.main, 
                        width: 40, 
                        height: 40 
                      }}
                    >
                      <MessageSquare size={20} />
                    </Avatar>
                    <div className="flex-1">
                      <p className="aws-text-body-lg" style={{ color: theme.palette.text.primary, margin: '0 0 8px 0' }}>
                        {c.content}
                      </p>
                      <p className="aws-text-body" style={{ color: theme.palette.text.secondary, margin: 0, fontSize: '0.75rem' }}>
                        Comment ID: {c.id}
                      </p>
                    </div>
                  </div>
                </div>
                {index < comments.length - 1 && <Divider />}
              </div>
            ))}
          </div>
        )}
      </LIVBlogCard>
    </div>
  );
};

export default CommentsManagement;