import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { authState } from '../store/atoms';
import Chat from '../components/Chat';


function DirectMessage() {
  const { username } = useParams();
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const auth = useRecoilValue(authState);
const navigate = useNavigate();

  useEffect(() => {

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
      } catch (err) {
        console.error('Error fetching recipient:', err);
        setError(err.response?.data?.message || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    if (username && auth.token) {
      fetchRecipient();
    }
  }, [username, auth.token]);

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
    <div className="container mx-auto px-4 py-8">
      {recipient && (
        <Chat 
          recipientId={recipient._id} 
          recipientName={`${recipient.firstname.charAt(0).toUpperCase()}${recipient.firstname.slice(1)} ${recipient.lastname.charAt(0).toUpperCase()}${recipient.lastname.slice(1)}`}
 
          recipientImage={recipient.profileImageUrl}
          recipientUsername={recipient.username}
          recipientIsAdmin={recipient.isAdmin}
        />
      )}
    </div>
  );
}

export default DirectMessage;

