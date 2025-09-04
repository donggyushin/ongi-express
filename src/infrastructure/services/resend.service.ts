import { Resend } from 'resend';
import { IEmailService } from './mailgun.service';

export class ResendService implements IEmailService {
  private resend: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is required');
    }

    this.resend = new Resend(apiKey);
    console.log('Resend API initialized');
  }

  async sendVerificationEmail(to: string, verificationCode: string): Promise<void> {
    try {
      // 개발 환경에서는 콘솔에 인증 코드 출력
      if (process.env.NODE_ENV !== 'production') {
        console.log('='.repeat(50));
        console.log('📧 DEVELOPMENT MODE - Email Simulation');
        console.log('='.repeat(50));
        console.log(`To: ${to}`);
        console.log(`Subject: 이메일 인증 코드`);
        console.log(`Verification Code: ${verificationCode}`);
        console.log('='.repeat(50));
        console.log('💡 Use this code for testing!');
        return;
      }

      const { data, error } = await this.resend.emails.send({
        from: 'Ongi <onboarding@resend.dev>', // Resend 기본 테스트 도메인 사용
        to: [to],
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
      });

      if (error) {
        console.error('❌ Resend API error:', error);
        throw new Error('Failed to send verification email');
      }

      console.log(`✅ Verification email sent to ${to} with code: ${verificationCode}`);
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(to: string, resetCode: string): Promise<void> {
    try {
      // 개발 환경에서는 콘솔에 리셋 코드 출력
      if (process.env.NODE_ENV !== 'production') {
        console.log('='.repeat(50));
        console.log('📧 DEVELOPMENT MODE - Email Simulation');
        console.log('='.repeat(50));
        console.log(`To: ${to}`);
        console.log(`Subject: 비밀번호 재설정 코드`);
        console.log(`Reset Code: ${resetCode}`);
        console.log('='.repeat(50));
        console.log('💡 Use this code for testing!');
        return;
      }

      const { data, error } = await this.resend.emails.send({
        from: 'Ongi <onboarding@resend.dev>', // Resend 기본 테스트 도메인 사용
        to: [to],
        subject: '비밀번호 재설정 코드',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">비밀번호 재설정</h2>
            <p>안녕하세요!</p>
            <p>비밀번호 재설정을 위한 인증 코드입니다:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
              <h1 style="color: #dc3545; font-size: 32px; margin: 0; letter-spacing: 5px;">${resetCode}</h1>
            </div>
            <p>이 코드는 10분 후에 만료됩니다.</p>
            <p>본인이 요청하지 않았다면 이 메일을 무시해주세요.</p>
            <p style="color: #dc3545; font-weight: bold;">⚠️ 보안을 위해 이 코드를 타인과 공유하지 마세요.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">
              이 메일은 Ongi에서 자동으로 발송되었습니다.
            </p>
          </div>
        `,
      });

      if (error) {
        console.error('❌ Resend API error:', error);
        throw new Error('Failed to send password reset email');
      }

      console.log(`✅ Password reset email sent to ${to} with code: ${resetCode}`);
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}