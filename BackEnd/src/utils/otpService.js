import twilio from "twilio";
import dotenv from "dotenv"

dotenv.config({
  path: "./.env"
})

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export const sendOtp = async (phone, otp) => {
  try {
    await client.messages.create({
      body: `Your login OTP is: ${otp}`,
      from: twilioPhoneNumber,
      to: `+91${phone}`,
    });
    console.log(`OTP sent to ${phone}: ${otp}`);
  } catch (error) {
    console.error("Error sending OTP via Twilio:", error);
    throw new Error("Failed to send OTP. Please try again later.");
  }
};

export const verifyOtp = (phone, otp, otpStorage) => {
  const storedOtpData = otpStorage[phone];
  if (!storedOtpData) return false;

  const { otp: storedOtp, expiresAt } = storedOtpData;
  if (Date.now() > expiresAt) return false; // OTP expired

  return storedOtp === otp;
};
