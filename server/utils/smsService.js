export const sendPhoneOtpMessage = async (phone, otp) => {
  console.log(`[BakiBook OTP] Phone: ${phone} | Code: ${otp}`);

  // Replace with SMS provider (Twilio, Firebase, etc.) in production.
  return true;
};
