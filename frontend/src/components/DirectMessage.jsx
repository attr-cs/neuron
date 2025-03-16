import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { authState } from '../store/atoms';
import Chat from './Chat';
import { useQueryClient } from '@tanstack/react-query';
import ErrorBoundary from './ErrorBoundary';


function DirectMessage() {
  const { username } = useParams();
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const auth = useRecoilValue(authState);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!auth.token) {
      navigate('/login');
      return;
    }

    if (username === auth.username) {
      navigate("/dashboard");
      return;
    }

    const fetchRecipient = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/user/profile/${username}`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`
            }
          }
        );
        setRecipient(response.data);
        
        // Prefetch initial messages
        const roomId = [auth.userId, response.data._id].sort().join('-');
        await queryClient.prefetchInfiniteQuery({
          queryKey: ['messages', response.data._id],
          queryFn: async ({ pageParam = 0 }) => {
            const messagesResponse = await axios.get(
              `${import.meta.env.VITE_BACKEND_URL}/chat/messages/${roomId}`,
              {
                params: {
                  page: pageParam,
                  limit: 25,
                },
                headers: {
                  Authorization: `Bearer ${auth.token}`
                }
              }
            );
            return messagesResponse.data;
          },
          initialPageParam: 0,
        });
      } catch (err) {
        console.error('Error fetching recipient:', err);
        setError(err.response?.data?.message || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipient();
  }, [username, auth.token, auth.username, navigate, queryClient]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-0 sm:px-4 py-0 sm:py-8 min-h-screen bg-[#0A0A0A]">
        {recipient && (
          <Chat 
            recipientId={recipient._id} 
            recipientName={`${recipient.firstname} ${recipient.lastname}`}
            recipientImage={recipient.profileImage?.thumbUrl || recipient.profileImage?.url}
            recipientUsername={recipient.username}
            recipientIsAdmin={recipient.isAdmin}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default DirectMessage;

