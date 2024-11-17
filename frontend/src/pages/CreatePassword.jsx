import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { authState, userState } from '../store/atoms';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';

function CreatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [auth] = useRecoilState(authState); 
  const [user, setUser] = useRecoilState(userState); 
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  if (user?.isOAuthUser === false) {
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

    try {
      
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/create-password`, {
        userId: auth.userId,
        newPassword: confirmPassword
      });

     
      setUser((prevUser) => ({
        user: {
          ...prevUser.user,
          isOAuthUser: false // Updated `isOAuthUser` to indicate password creation is complete
        }
      }));

   
      navigate(`/profile/${auth.username}`);
    } catch (err) {
      console.log("Failed to create password:", err);
    }
    setError('');
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Create Password</h1>
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
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
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

       
        {error && <p className="text-red-600 text-sm">{error}</p>}
        
        <Button type="submit" className="w-full">Create Password</Button>
      </form>
    </div>
  )
}

export default CreatePassword;