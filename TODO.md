# TODO: Hide Email Verification and Direct Login After Registration

## Steps to Complete:

- [x] Modify backend register function to set isEmailVerified: true and skip OTP generation/email sending
- [x] Update frontend Register.tsx to redirect to /login instead of /verify-email-otp
- [ ] Test the registration flow to ensure it works without email verification
