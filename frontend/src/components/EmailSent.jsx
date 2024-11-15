import { useState, useEffect } from 'react'
import { Mail, RefreshCw, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CheckEmailPage() {
  const [email, setEmail] = useState('user@example.com')
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer)
          setCanResend(true)
          return 0
        }
        return prevCountdown - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleResend = async () => {
    setIsResending(true)
    // Simulating resend action
    await new Promise(resolve => setTimeout(resolve, 2000))
    setCanResend(false)
    setCountdown(60)
    setIsResending(false)
    // Here you would typically call an API to resend the email
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
            <CardTitle className="text-2xl font-bold text-center">Check Your Email</CardTitle>
            <CardDescription className="text-center text-blue-100">We&apos;ve sent a password reset link to your email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <motion.div 
              className="flex justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className="rounded-full bg-blue-100 p-3">
                <Mail className="h-12 w-12 text-blue-600" />
              </div>
            </motion.div>
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-center text-blue-800">
                An email has been sent to:
                <br />
                <strong className="font-medium">{email}</strong>
              </AlertDescription>
            </Alert>
            <p className="text-center text-sm text-gray-600">
              Click the link in the email to reset your password. If you don&apos;t see the email, check your spam folder.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 bg-gray-50 p-6">
            <Button 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              onClick={handleResend} 
              disabled={!canResend || isResending}
            >
              {isResending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : canResend ? (
                <RefreshCw className="mr-2 h-4 w-4" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {isResending ? 'Resending...' : (canResend ? 'Resend Email' : `Email Sent (${countdown}s)`)}
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}