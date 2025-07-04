// In-memory store for OTPs
const otpStore = new Map();

// Cleanup expired entries every hour
setInterval(() => {
    const now = Date.now();
    
    // Clean OTP store
    for (const [key, value] of otpStore.entries()) {
        if (value.expiresAt < now) {
            otpStore.delete(key);
        }
    }
}, 60 * 60 * 1000); // Run cleanup every hour

const OTP_ATTEMPTS = process.env.OTP_ATTEMPTS || 3; // default 3 attempts
const OTP_EXPIRY_MINUTES = process.env.OTP_EXPIRY_MINUTES || 10; // default 10 minutes

// OTP management
export const otpManager = {
    generateOTP: (email) => {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt =  Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000); // defualt 10 minutes
        
        otpStore.set(email, {
            otp,
            expiresAt,
            attempts: 0
        });
        
        return otp;
    },
    
    verifyOTP: (email, otp) => {
        const otpData = otpStore.get(email);
        
        if (!otpData) {
            return { valid: false, message: 'OTP not found or expired' };
        }
        
        if (Date.now() > otpData.expiresAt) {
            otpStore.delete(email);
            return { valid: false, message: 'OTP has expired' };
        }
        
        //default 3 attempts
        if (otpData.attempts >= OTP_ATTEMPTS) {
            otpStore.delete(email);
            return { valid: false, message: 'Too many attempts. Please request a new OTP.' };
        }
        
        if (otpData.otp !== otp) {
            otpData.attempts += 1;
            return { 
                valid: false, 
                message: `Invalid OTP. ${OTP_ATTEMPTS - otpData.attempts} attempts remaining.` 
            };
        }
        
        // OTP is valid, clean it up
        otpStore.delete(email);
        return { valid: true };
    },
    
    getOtpData: (email) => {
        return otpStore.get(email);
    }
};

export default otpManager;