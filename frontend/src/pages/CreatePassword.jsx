import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, Check, X, LoaderIcon } from "lucide-react";
import { authState, userBasicInfoState } from '../store/atoms';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';

function CreatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const auth = useRecoilValue(authState);
  const setBasicInfo = useSetRecoilState(userBasicInfoState);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const userInfo = useRecoilValue(userBasicInfoState);
  
  if (!userInfo.isOAuthUser) {
    return <Navigate to="/request-reset" replace />;
  }

  const passwordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    return (strength / 4) * 100;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    if (passwordStrength(password) < 75) {
      setError("Password is not strong enough");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/create-password`,
        {
          userId: auth.userId,
          newPassword: confirmPassword
        },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        }
      );

      if (response.status === 200) {
        setBasicInfo(prev => ({
          ...prev,
          isOAuthUser: false
        }));
        navigate(`/profile/${auth.username}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create password");
      console.error("Failed to create password:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center dark:text-white">Create Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Password Input */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={isLoading}
            >
              {showPassword ? 
                <EyeOff className="h-4 w-4 text-gray-400" /> : 
                <Eye className="h-4 w-4 text-gray-400" />
              }
            </button>
          </div>
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

      
        <div className="space-y-2">
          <Label>Password Strength</Label>
          <Progress value={passwordStrength(password)} className="w-full" />
        </div>

       
        <div className="space-y-2">
          <p className="text-sm font-medium">Password must contain:</p>
          <ul className="text-sm space-y-1">
            <li className={`flex items-center ${password.length >= 8 ? 'text-green-600' : 'text-red-600'}`}>
              {password.length >= 8 ? <Check className="h-4 w-4 mr-2" /> : <X className="h-4 w-4 mr-2" />}
              At least 8 characters
            </li>
            <li className={`flex items-center ${password.match(/[a-z]/) && password.match(/[A-Z]/) ? 'text-green-600' : 'text-red-600'}`}>
              {password.match(/[a-z]/) && password.match(/[A-Z]/) ? <Check className="h-4 w-4 mr-2" /> : <X className="h-4 w-4 mr-2" />}
              Uppercase and lowercase letters
            </li>
            <li className={`flex items-center ${password.match(/\d/) ? 'text-green-600' : 'text-red-600'}`}>
              {password.match(/\d/) ? <Check className="h-4 w-4 mr-2" /> : <X className="h-4 w-4 mr-2" />}
              At least one number
            </li>
            <li className={`flex items-center ${password.match(/[^a-zA-Z\d]/) ? 'text-green-600' : 'text-red-600'}`}>
              {password.match(/[^a-zA-Z\d]/) ? <Check className="h-4 w-4 mr-2" /> : <X className="h-4 w-4 mr-2" />}
              At least one special character
            </li>
          </ul>
        </div>

       
        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        )}
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
              Creating Password...
            </>
          ) : (
            "Create Password"
          )}
        </Button>
      </form>
    </div>
  );
}

export default CreatePassword;