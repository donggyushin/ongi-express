import nodemailer from 'nodemailer';
import { IEmailService } from './mailgun.service';

export class GmailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const email = process.env.GMAIL_EMAIL;
    const password = process.env.GMAIL_APP_PASSWORD;

    if (!email || !password) {
      throw new Error('GMAIL_EMAIL and GMAIL_APP_PASSWORD are required');
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email,
        pass: password
      }
    });

    console.log('Gmail SMTP initialized with email:', email);
  }

  async sendVerificationEmail(to: string, verificationCode: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"Ongi" <${process.env.GMAIL_EMAIL}>`,
        to: to,
        subject: '이메일 인증 코드',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">이메일 인증</h2>
            <p>안녕하세요!</p>
            <p>이메일 인증을 위한 인증 코드입니다:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
              <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${verificationCode}</h1>
            </div>
            <p>이 코드는 5분 후에 만료됩니다.</p>
            <p>본인이 요청하지 않았다면 이 메일을 무시해주세요.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">
              이 메일은 Ongi에서 자동으로 발송되었습니다.
            </p>
          </div>
        `,
        text: `
이메일 인증 코드: ${verificationCode}

이 코드는 5분 후에 만료됩니다.
본인이 요청하지 않았다면 이 메일을 무시해주세요.

이 메일은 Ongi에서 자동으로 발송되었습니다.
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Verification email sent to ${to} with code: ${verificationCode}`);
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }
}