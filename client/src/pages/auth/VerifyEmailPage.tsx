import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OTPInput } from "@/components/ui/otp-input"
import useAuthStore from "@/stores/authStore"

export function VerifyEmailPage() {
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const { verifyEmail, resendVerificationEmail } = useAuthStore()
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
    } catch { /* empty */ }
  }

  const handleVerify = async (otpCode: string) => {
    if (otpCode.length !== 6) {
      return
    }

    try {
      setIsVerifying(true)
      
      const promise = verifyEmail(otpCode);
      
      await promise
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

      <div className="space-y-3 text-center">
        <button
          type="button"
          onClick={handleResendCode}
          disabled={remainingTime > 0}
          className="text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {remainingTime > 0
            ? `Resend code in ${remainingTime}s`
            : "Didn't receive a code? Resend"}
        </button>
        <p className="text-xs text-destructive font-medium">
          If you don't see the email, please check your spam or junk folder.
        </p>
      </div>
    </div>
  )
}