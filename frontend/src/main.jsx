import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { RecoilRoot } from 'recoil'
import { SocketProvider } from '@/contexts/SocketContext'

import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <Router>
            <App />
          </Router>
        </SocketProvider>
      </QueryClientProvider>
    </RecoilRoot>
  </StrictMode>,
)