import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare } from 'lucide-react';

export const CommentsManagement: React.FC = () => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  const comments = userProfile?.comments ?? [];

  return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Comments</h1>
            <p className="text-gray-600 mt-1">Manage and review the comments you have made across posts.</p>
          </div>
          <div className="flex items-center gap-2 text-blue-600">
            <MessageSquare className="h-6 w-6" />
            <span className="font-semibold">{comments.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">All Comments</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {comments.length === 0 ? (
                <div className="p-6 text-center text-gray-500">You haven't made any comments yet.</div>
            ) : (
                comments.map((c) => (
                    <div key={c.id} className="p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-900">{c.content}</p>
                          <p className="text-sm text-gray-500 mt-1">Comment ID: {c.id}</p>
                        </div>
                      </div>
                    </div>
                ))
            )}
          </div>
        </div>
      </div>
  );
};

export default CommentsManagement;