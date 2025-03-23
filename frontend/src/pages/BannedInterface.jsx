import { useNavigate } from 'react-router-dom';

function BannedInterface() {
    const navigate = useNavigate();
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full px-6 py-8 bg-white shadow-lg rounded-lg">
          <div className="text-center">
            <svg 
              className="mx-auto h-16 w-16 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Account Suspended</h2>
            <p className="mt-2 text-gray-600">
              Your account has been suspended due to violation of our community guidelines.
            </p>
            <div className="mt-6">
              <p className="text-sm text-gray-500">
                If you believe this is a mistake, please contact our support team at{' '}
                <a href="mailto:neuronspaceofficial@gmail.com" className="text-blue-600 hover:text-blue-800">
                  neuronspaceofficial@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
export default BannedInterface;  