import twilio from 'twilio';
import dotenv from 'dotenv'

dotenv.config();


const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendSms = async (phone, message) => {
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
};

// from: process.env.TWILIO_PHONE_NUMBER,
