import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Mail, LogOut } from 'lucide-react';
import { useSetRecoilState } from 'recoil';
import { authState, userBasicInfoState } from '../store/atoms/index';
import { Button } from '@/components/ui/button';

function BannedInterface() {
  const navigate = useNavigate();
  const setAuth = useSetRecoilState(authState);
  const setBasicInfo = useSetRecoilState(userBasicInfoState);

  const handleResetExit = () => {
    localStorage.clear();
    sessionStorage.clear();
    setAuth({
      isAuthenticated: false,
      token: null,
      userId: null,
      username: null,
      isAdmin: false,
    });
    setBasicInfo({
      firstname: null,
      lastname: null,
      username: null,
      profileImage: null,
      isAdmin: false,
      isOnline: false,
    });
    navigate('/signin');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-zinc-50 dark:bg-black font-sans">
      <div className="max-w-md w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-[32px] p-8 sm:p-10 shadow-sm text-center space-y-6">
        
        {/* Dynamic Warning Emblem */}
        <div className="mx-auto h-16 w-16 rounded-2xl bg-red-500/10 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/50 flex items-center justify-center text-red-500">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Account Suspended</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto font-medium">
            Your access has been suspended due to violations of our chronological community guidelines.
          </p>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/35 border border-zinc-150 dark:border-zinc-900/60 rounded-2xl p-4 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-normal">
          <p className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-1.5 mb-1">
            <Mail className="h-4 w-4" /> Need assistance?
          </p>
          If you believe this is an error, appeal to our support desk:
          <a 
            href="mailto:neuronspaceofficial@gmail.com" 
            className="block text-zinc-950 dark:text-white font-bold hover:underline mt-1 transition-colors"
          >
            neuronspaceofficial@gmail.com
          </a>
        </div>

        <Button
          onClick={handleResetExit}
          className="w-full bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:text-black dark:hover:bg-zinc-100 text-white font-semibold h-11 rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Exit Workspace</span>
        </Button>

      </div>
    </div>
  );
}

export default BannedInterface;