import nodemailer from 'nodemailer';

// Generate a random 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email
export const sendEmailOTP = async (email, otp) => {
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  const createPrimaryTransporter = () => {
    if (process.env.SMTP_HOST) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 465,
        secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        connectionTimeout: 10000,
        socketTimeout: 10000,
        greetingTimeout: 5000,
      });
    }
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
      pool: true,
      connectionTimeout: 10000,
      socketTimeout: 10000,
      greetingTimeout: 5000,
    });
  };

  const createFallbackTransporter = () => {
    if (process.env.SMTP_HOST) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 587,
        secure: false,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        connectionTimeout: 10000,
        socketTimeout: 10000,
        greetingTimeout: 5000,
      });
    }
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
      pool: true,
      connectionTimeout: 10000,
      socketTimeout: 10000,
      greetingTimeout: 5000,
    });
  };

  let transporter = createPrimaryTransporter();
  const mailOptions = {
    from: `SkillAble <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'SkillAble - Email Verification OTP',
    text: `Your DevXcom verification code is ${otp}. It expires in 10 minutes. If you didn't request this code, ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #1dbf73; text-align: center;">SkillAble Email Verification</h2>
        <p>Hello,</p>
        <p>Your verification code for SkillAble is:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <p>Thank you,<br>The DevXcom Team</p>
      </div>
    `,
    priority: 'high',
    replyTo: process.env.EMAIL_USER,
  };

  if (process.env.NODE_ENV === 'development') {
    console.log(`DEV: Email OTP for ${email}: ${otp}`);
  }

  try {
    try {
      await transporter.verify();
    } catch (vErr) {
      transporter = createFallbackTransporter();
      try { await transporter.verify(); } catch (_) {}
    }

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await transporter.sendMail(mailOptions);
        return true;
      } catch (error) {
        if (attempt === 3) {
          // Try fallback transporter if primary failed repeatedly
          const fb = createFallbackTransporter();
          for (let fbAttempt = 1; fbAttempt <= 2; fbAttempt++) {
            try {
              await fb.sendMail(mailOptions);
              return true;
            } catch (fbErr) {
              if (fbAttempt === 2) {
                console.error('Error sending email OTP (fallback failed):', fbErr);
                return false;
              }
              await delay(700 * fbAttempt);
            }
          }
        } else {
          await delay(500 * attempt);
        }
      }
    }
    return false;
  } catch (error) {
    console.error('Error sending email OTP:', error);
    return false;
  }
};

// Send OTP via SMS (using a third-party service like Twilio)
export const sendSmsOTP = async (phone, otp) => {
  try {
    // This is a placeholder for SMS sending functionality
    // You would typically use a service like Twilio here
    
    // Example with Twilio (commented out):
    /*
    const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: `Your SkillAble verification code is: ${otp}. This code will expire in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    */
    
    // For now, we'll just log the OTP (in a real app, you'd use a service like Twilio)
    console.log(`SMS OTP for ${phone}: ${otp}`);
    return true;
  } catch (error) {
    console.error('Error sending SMS OTP:', error);
    return false;
  }
};

// Verify OTP
export const verifyOTP = (storedOTP, providedOTP, expiryTime) => {
  // Check if OTP has expired
  if (expiryTime < new Date()) {
    return { valid: false, message: 'OTP has expired' };
  }
  
  // Check if OTP matches
  if (storedOTP !== providedOTP) {
    return { valid: false, message: 'Invalid OTP' };
  }
  
  return { valid: true, message: 'OTP verified successfully' };
};