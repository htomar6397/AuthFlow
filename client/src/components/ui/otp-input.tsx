import * as React from "react"
import { cn } from "@/lib/utils"

export interface OTPInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  length?: number
  onChangeOTP: (otp: string) => void
  value?: string
}

export const OTPInput = React.forwardRef<HTMLDivElement, OTPInputProps>(
  ({ className, length = 6, onChangeOTP, value = "", ...props }, ref) => {
    const [otp, setOtp] = React.useState<string[]>(Array(length).fill(""))
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

    React.useEffect(() => {
      // Initialize with the provided value if any
      if (value && value.length === length) {
        setOtp(value.split(""))
      }
    }, [value, length])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const newOtp = [...otp]
      const input = e.target.value
      
      // Only allow single digit or empty string
      if (input === "" || /^\d$/.test(input)) {
        newOtp[index] = input
        setOtp(newOtp)
        
        // Combine all digits and call onChangeOTP
        const combinedOtp = newOtp.join("")
        onChangeOTP(combinedOtp)
        
        // Move to next input if there's a value
        if (input !== "" && index < length - 1) {
          inputRefs.current[index + 1]?.focus()
        }
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      // Handle backspace
      if (e.key === "Backspace" && otp[index] === "" && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
      
      // Handle left/right arrow keys
      if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault()
        inputRefs.current[index - 1]?.focus()
      }
      
      if (e.key === "ArrowRight" && index < length - 1) {
        e.preventDefault()
        inputRefs.current[index + 1]?.focus()
      }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pasteData = e.clipboardData.getData('text/plain')
      const numbers = pasteData.replace(/\D/g, '') // Remove non-digits
      
      if (numbers.length > 0) {
        const newOtp = [...otp]
        const maxLength = Math.min(numbers.length, length)
        
        for (let i = 0; i < maxLength; i++) {
          newOtp[i] = numbers[i]
        }
        
        setOtp(newOtp)
        const combinedOtp = newOtp.join("")
        onChangeOTP(combinedOtp)
        
        // Focus the next empty input or the last one
        const nextIndex = Math.min(maxLength, length - 1)
        inputRefs.current[nextIndex]?.focus()
      }
    }

    return (
      <div ref={ref} className="flex items-center justify-center gap-2">
        {otp.map((digit, index) => {
          const setInputRef = (el: HTMLInputElement | null) => {
            inputRefs.current[index] = el
          }
          
          return (
            <input
              key={index}
              ref={setInputRef}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className={cn(
              "flex h-12 w-12 rounded-md border border-input bg-background text-center text-xl ring-offset-background",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:opacity-50",
              className
            )}
            autoFocus={index === 0}
            {...props}
            />
          )
        })}
      </div>
    )
  }
)

OTPInput.displayName = "OTPInput"
