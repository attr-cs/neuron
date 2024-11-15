import { userState } from "@/store/atoms";
import { Navigate, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { useState } from 'react'
import { Mail, ArrowRight, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import axios from "axios";

function RequestReset() {
    
      const [email, setEmail] = useState('')
      const [isSubmitting, setIsSubmitting] = useState(false)
      const [error, setError] = useState("")
const navigate = useNavigate();
    const [user, setUser] = useRecoilState(userState);

    if (user?.isOAuthUser === true) {
        return <Navigate to="/create-password" replace />;
      }

      const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(""); 
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/request-reset`, { email });
            setIsSubmitting(false);
            navigate("/email-sent");
        } catch (err) {
            setIsSubmitting(false);
            setError(err.response?.data?.msg || "Something went wrong");
            console.log(err.response?.data?.msg || "error")
        }
    }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
            <CardDescription className="text-center text-blue-100">Enter your email to reset your password</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
                  {error? <p className="text-red-600 font-semibold">{String(error)}</p> : null}
                
            </CardContent>
            
            <CardFooter className="bg-gray-50 p-6">
              
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? 'Sending...' : 'Reset Password'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}



export default RequestReset
