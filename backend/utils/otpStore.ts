interface OtpData {
  otp: string;
  expiresAt: number;
  attempts: number;
}

interface OtpVerificationResult {
  valid: boolean;
  message?: string;
}

// In-memory store for OTPs
const otpStore = new Map<string, OtpData>();

const OTP_ATTEMPTS: number = parseInt(process.env.OTP_ATTEMPTS || '3', 10);
const OTP_EXPIRY_MINUTES: number = parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10);

// OTP management
const otpManager = {
  generateOTP: (email: string): string => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

    otpStore.set(email, {
      otp,
      expiresAt,
      attempts: 0,
    });

    return otp;
  },

  verifyOTP: (email: string, otp: string): OtpVerificationResult => {
    const otpData = otpStore.get(email);

    if (!otpData) {
      return { valid: false, message: 'OTP not found or expired' };
    }

    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(email);
      return { valid: false, message: 'OTP has expired' };
    }

    if (otpData.attempts >= OTP_ATTEMPTS) {
      otpStore.delete(email);
      return { valid: false, message: 'Too many attempts. Please request a new OTP.' };
    }

    if (otpData.otp !== otp) {
      otpData.attempts += 1;
      return {
        valid: false,
        message: `Invalid OTP. ${OTP_ATTEMPTS - otpData.attempts} attempts remaining.`,
      };
    }

    otpStore.delete(email);
    return { valid: true };
  },

  getOtpData: (email: string): OtpData | undefined => {
    return otpStore.get(email);
  },
};

export { otpManager };
