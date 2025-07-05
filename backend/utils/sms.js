import twilio from 'twilio';
import SmsLog from '../models/SmsLog.js';

// Send SMS using Twilio
export const sendSMS = async (to, message, type, customerId, customerName) => {
  try {
    // Initialize Twilio client
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    // Create SMS log entry
    const smsLog = await SmsLog.create({
      customerId,
      customerName,
      phoneNumber: to,
      message,
      type,
      status: 'pending',
      provider: 'twilio'
    });
    
    // In development mode, don't actually send the SMS
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV MODE] SMS would be sent to ${to}: ${message}`);
      
      // Simulate successful delivery
      smsLog.status = 'delivered';
      smsLog.deliveredAt = new Date();
      await smsLog.save();
      
      return smsLog;
    }
    
    // Send the SMS
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    
    // Update the SMS log
    smsLog.status = 'delivered';
    smsLog.deliveredAt = new Date();
    smsLog.messageId = result.sid;
    await smsLog.save();
    
    return smsLog;
  } catch (error) {
    console.error('Error sending SMS:', error);
    
    // Create or update SMS log with error
    let smsLog;
    try {
      smsLog = await SmsLog.findOneAndUpdate(
        { 
          customerId,
          phoneNumber: to,
          message,
          type,
          status: 'pending'
        },
        {
          status: 'failed',
          error: error.message
        },
        { new: true, upsert: true }
      );
    } catch (logError) {
      console.error('Error creating SMS log:', logError);
      smsLog = {
        customerId,
        customerName,
        phoneNumber: to,
        message,
        type,
        status: 'failed',
        error: error.message
      };
    }
    
    return smsLog;
  }
};