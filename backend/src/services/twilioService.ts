import dotenv from 'dotenv';

dotenv.config();

const getClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) return null;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('twilio')(accountSid, authToken);
};

export const sendWhatsAppMessage = async (toPhone?: string): Promise<any> => {
  try {
    const client = getClient();
    if (!client) {
      console.warn('Twilio credentials not configured; skipping WhatsApp message');
      return { success: false, error: 'Twilio credentials not configured' };
    }
    const fallbackPhone = process.env.TWILIO_FALLBACK_WHATSAPP_TO;
    const target = toPhone ? `whatsapp:${toPhone}` : (fallbackPhone ? `whatsapp:${fallbackPhone}` : undefined);
    if (!target) {
      return { success: false, error: 'No recipient phone number provided' };
    }
    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
      contentSid: process.env.TWILIO_CONTENT_SID || 'HXb5b62575e6e4ff6129ad7c8efe1f983e',
      contentVariables: '{"1":"12/1","2":"3pm"}',
      to: target
    });
    console.log('WhatsApp message sent successfully');
    return { success: true, sid: message.sid };
  } catch (err: any) {
    console.error('Error sending WhatsApp message:', err);
    return { success: false, error: err.message };
  }
};
