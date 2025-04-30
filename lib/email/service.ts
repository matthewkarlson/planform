import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { db } from '@/lib/db/drizzle';
import { verificationTokens, passwordResetTokens, users } from '@/lib/db/schema';

// In production, use SendGrid API
// For development, we can use a test account from Ethereal
let testAccount: nodemailer.TestAccount | null = null;
let transporter: nodemailer.Transporter | null = null;

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function getEmailTransporter() {
  if (!transporter) {
    // If we're in production with SendGrid SMTP config, use that
    if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        secure: process.env.EMAIL_SERVER_SECURE === 'true',
      });
    } else {
      // Otherwise use Ethereal for testing
      testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }
  }

  return transporter;
}

export async function createVerificationToken(userId: number) {
  // Delete any existing tokens for this user
  await db.delete(verificationTokens).where(eq(verificationTokens.userId, userId));
  
  // Create a new token
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours
  
  // Store the token in the database
  const [createdToken] = await db.insert(verificationTokens)
    .values({
      userId,
      token,
      expiresAt,
    })
    .returning();
    
  return createdToken;
}

export async function sendVerificationEmail(userId: number, email: string) {
  // Create a verification token
  const verificationToken = await createVerificationToken(userId);
  
  // Generate verification URL
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken.token}`;
  
  // Email content
  const fromEmail = process.env.EMAIL_FROM || '"SaaS Starter" <noreply@saas-starter.com>';
  const subject = "Verify your email address";
  const text = `Please verify your email address by clicking on the following link: ${verificationUrl}`;
  const html = `
    <div>
      <h1>Email Verification</h1>
      <p>Please verify your email address by clicking on the button below:</p>
      <a href="${verificationUrl}" style="
        display: inline-block;
        background-color: #f97316;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        margin: 20px 0;
      ">
        Verify Email
      </a>
      <p>Or copy and paste the following link in your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
    </div>
  `;
  
  // If SendGrid API key is available and we're in production, use SendGrid API
  if (process.env.SENDGRID_API_KEY) {
    const msg = {
      to: email,
      from: fromEmail,
      subject,
      text,
      html,
    };
    
    await sgMail.send(msg);
    console.log(`Verification email sent to ${email} using SendGrid API`);
    return { sent: true };
  } 
  // Otherwise use SMTP
  else {
    // Send the email
    const transporter = await getEmailTransporter();
    
    const info = await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject,
      text,
      html,
    });
    
    // For testing, log the URL where the email can be viewed
    if (testAccount) {
      console.log("Verification email sent: %s", nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  }
}

export async function verifyEmail(token: string) {
  // Find the token in the database
  const tokenRecord = await db.query.verificationTokens.findFirst({
    where: eq(verificationTokens.token, token),
  });
  
  if (!tokenRecord) {
    return { success: false, message: "Invalid verification token" };
  }
  
  // Check if the token has expired
  if (new Date() > tokenRecord.expiresAt) {
    await db.delete(verificationTokens).where(eq(verificationTokens.id, tokenRecord.id));
    return { success: false, message: "Verification token has expired" };
  }
  
  // Mark the user as verified
  await db.update(users)
    .set({ isVerified: true })
    .where(eq(users.id, tokenRecord.userId));
    
  // Delete the used token
  await db.delete(verificationTokens).where(eq(verificationTokens.id, tokenRecord.id));
  
  return { success: true, message: "Email verified successfully" };
}

export async function createPasswordResetToken(userId: number) {
  // Delete any existing tokens for this user
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  
  // Create a new token
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour
  
  // Store the token in the database
  const [createdToken] = await db.insert(passwordResetTokens)
    .values({
      userId,
      token,
      expiresAt,
    })
    .returning();
    
  return createdToken;
}

export async function sendPasswordResetEmail(userId: number, email: string) {
  // Create a password reset token
  const resetToken = await createPasswordResetToken(userId);
  
  // Generate reset URL
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken.token}`;
  
  // Email content
  const fromEmail = process.env.EMAIL_FROM || '"SaaS Starter" <noreply@saas-starter.com>';
  const subject = "Reset your password";
  const text = `You requested to reset your password. Please click on the following link to reset your password: ${resetUrl}. This link will expire in 1 hour.`;
  const html = `
    <div>
      <h1>Password Reset</h1>
      <p>You requested to reset your password. Please click on the button below to set a new password:</p>
      <a href="${resetUrl}" style="
        display: inline-block;
        background-color: #f97316;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        margin: 20px 0;
      ">
        Reset Password
      </a>
      <p>Or copy and paste the following link in your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
    </div>
  `;
  
  // If SendGrid API key is available and we're in production, use SendGrid API
  if (process.env.SENDGRID_API_KEY) {
    const msg = {
      to: email,
      from: fromEmail,
      subject,
      text,
      html,
    };
    
    await sgMail.send(msg);
    console.log(`Password reset email sent to ${email} using SendGrid API`);
    return { sent: true };
  } 
  // Otherwise use SMTP
  else {
    // Send the email
    const transporter = await getEmailTransporter();
    
    const info = await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject,
      text,
      html,
    });
    
    // For testing, log the URL where the email can be viewed
    if (testAccount) {
      console.log("Password reset email sent: %s", nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  }
}

export async function sendInvitationEmail(email: string, teamName: string, role: string, invitationId: number) {
  // Generate invitation URL
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const invitationUrl = `${baseUrl}/sign-up?inviteId=${invitationId}`;
  
  // Email content
  const fromEmail = process.env.EMAIL_FROM || '"SaaS Starter" <noreply@saas-starter.com>';
  const subject = `You've been invited to join ${teamName}`;
  const text = `You've been invited to join ${teamName} as a ${role}. Please click on the following link to accept the invitation: ${invitationUrl}`;
  const html = `
    <div>
      <h1>Team Invitation</h1>
      <p>You've been invited to join <strong>${teamName}</strong> as a <strong>${role}</strong>.</p>
      <p>Click the button below to accept the invitation and create your account:</p>
      <a href="${invitationUrl}" style="
        display: inline-block;
        background-color: #f97316;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        margin: 20px 0;
      ">
        Accept Invitation
      </a>
      <p>Or copy and paste the following link in your browser:</p>
      <p>${invitationUrl}</p>
      <p>If you don't know why you received this invitation, you can safely ignore this email.</p>
    </div>
  `;
  
  // If SendGrid API key is available and we're in production, use SendGrid API
  if (process.env.SENDGRID_API_KEY) {
    const msg = {
      to: email,
      from: fromEmail,
      subject,
      text,
      html,
    };
    
    await sgMail.send(msg);
    console.log(`Team invitation email sent to ${email} using SendGrid API`);
    return { sent: true };
  } 
  // Otherwise use SMTP
  else {
    // Send the email
    const transporter = await getEmailTransporter();
    
    const info = await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject,
      text,
      html,
    });
    
    // For testing, log the URL where the email can be viewed
    if (testAccount) {
      console.log("Team invitation email sent: %s", nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  }
}

export async function sendWaitlistVerificationEmail(email: string, token: string) {
  // Generate verification URL
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/waitlist/verify?token=${token}`;
  
  // Email content
  const fromEmail = process.env.EMAIL_FROM || '"SaaS Starter" <noreply@saas-starter.com>';
  const subject = "Verify your waitlist signup";
  const text = `Thank you for joining our waitlist! Please verify your email address by clicking on the following link: ${verificationUrl}`;
  const html = `
    <div>
      <h1>Waitlist Verification</h1>
      <p>Thank you for joining our waitlist! Please verify your email address by clicking on the button below:</p>
      <a href="${verificationUrl}" style="
        display: inline-block;
        background-color: #f97316;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        margin: 20px 0;
      ">
        Verify Email
      </a>
      <p>Or copy and paste the following link in your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
    </div>
  `;
  
  // If SendGrid API key is available and we're in production, use SendGrid API
  if (process.env.SENDGRID_API_KEY) {
    const msg = {
      to: email,
      from: fromEmail,
      subject,
      text,
      html,
    };
    
    await sgMail.send(msg);
    console.log(`Waitlist verification email sent to ${email} using SendGrid API`);
    return { sent: true };
  } 
  // Otherwise use SMTP
  else {
    // Send the email
    const transporter = await getEmailTransporter();
    
    const info = await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject,
      text,
      html,
    });
    
    // For testing, log the URL where the email can be viewed
    if (testAccount) {
      console.log("Waitlist verification email sent: %s", nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  }
}

export async function verifyPasswordResetToken(token: string) {
  // Find the token in the database
  const tokenRecord = await db.query.passwordResetTokens.findFirst({
    where: eq(passwordResetTokens.token, token),
  });
  
  if (!tokenRecord) {
    return { success: false, message: "Invalid password reset token" };
  }
  
  // Check if the token has expired
  if (new Date() > tokenRecord.expiresAt) {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, tokenRecord.id));
    return { success: false, message: "Password reset token has expired" };
  }
  
  return { success: true, userId: tokenRecord.userId, tokenId: tokenRecord.id };
} 