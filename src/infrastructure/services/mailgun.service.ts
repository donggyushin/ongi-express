import Mailgun from 'mailgun.js';
import FormData from 'form-data';

export interface IEmailService {
  sendVerificationEmail(to: string, verificationCode: string): Promise<void>;
}

export class MailgunService implements IEmailService {
  private mailgun: any;
  private domain: string;

  constructor() {
    const apiKey = process.env.MAILGUN_API_KEY;
    this.domain = process.env.MAILGUN_DOMAIN || 'your-domain.com'; // 추후 설정 필요
    
    if (!apiKey) {
      throw new Error('MAILGUN_API_KEY is required');
    }

    const mailgun = new Mailgun(FormData);
    this.mailgun = mailgun.client({
      username: 'api',
      key: apiKey,
    });
  }

  async sendVerificationEmail(to: string, verificationCode: string): Promise<void> {
    try {
      const mailData = {
        from: `Ongi <noreply@${this.domain}>`,
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
        `
      };

      await this.mailgun.messages.create(this.domain, mailData);
      console.log(`Verification email sent to ${to}`);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }
}