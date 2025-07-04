import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OTPInput } from "@/components/ui/otp-input"
import useAuthStore from "@/stores/authStore"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface VerifyOtpFormProps {
  className?: string
}

export function VerifyOtpForm({ className }: VerifyOtpFormProps) {
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { user, verifyEmail, resendVerificationEmail } = useAuthStore()
  console.log(user)
  // Handle countdown timer for resend button
  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setTimeout(() => setRemainingTime(remainingTime - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [remainingTime])

  // No need for manual redirects - handled by protected routes
  const handleResendCode = async () => {
    if (remainingTime > 0) return
    
    try {
      await resendVerificationEmail()
      setRemainingTime(60)
      toast.success("Verification code sent", {
        description: `A new verification code has been sent to ${user?.email}`,
      })
    } catch (error) {
      toast.error("Failed to resend code", {
        description: "Please try again later."
      })
    }
  }

  const handleVerify = async (otpCode: string) => {
    if (otpCode.length !== 6) {
      setError("Please enter a valid 6-digit code")
      return
    }

    try {
      setError(null)
      setIsVerifying(true)
      
      const promise = verifyEmail(otpCode)
      
      toast.promise(promise, {
        loading: 'Verifying your email...',
        success: () => {
          navigate('/complete-profile')
          return 'Email verified! Redirecting to complete your profile...'
        },
        error: (err) => {
          const message = err.message || "Invalid or expired verification code"
          setError(message)
          return message
        },
      })
      
      await promise
    } catch (error) {
      // Error is handled in the toast.promise
    } finally {
      setIsVerifying(false)
    }
  }

  // Show loading state while verifying
  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors self-start"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </button>

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p className="text-muted-foreground">
          We've sent a verification code to <span className="font-medium">{user?.email}</span>
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center">
          <OTPInput
            value={otp}
            onChangeOTP={setOtp}
            length={6}
            className="w-10 h-10 text-center border rounded"
            disabled={isVerifying}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <Button
          onClick={() => handleVerify(otp)}
          disabled={isVerifying || otp.length !== 6}
          className="w-full"
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Email'
          )}
        </Button>

        <div className="text-center text-sm">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={remainingTime > 0}
            className="text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {remainingTime > 0
              ? `Resend code in ${remainingTime}s`
              : "Didn't receive a code? Resend"}
          </button>
        </div>
      </div>
    </div>
  )
}
