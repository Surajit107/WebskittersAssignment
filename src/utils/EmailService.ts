import nodemailer from 'nodemailer';
import { CommonTypes } from '../../types/commonType';
import EmailConfig from '../config/email.config';

class EmailService {
    private static config = EmailConfig.getConfig();

    private static transporter = nodemailer.createTransport({
        host: this.config.emailHost,
        port: this.config.emailPort,
        secure: false, // TLS
        requireTLS: true,
        auth: {
            user: this.config.emailId,
            pass: this.config.appPassword
        }
    });

    // Method to send an email
    public static async sendEmail({ receiver, subject, htmlContent }: CommonTypes.SendEmailOptions): Promise<CommonTypes.SendEmailResponse> {
        try {
            const mailOptions = {
                from: "Email Verification <no-reply@justhired.mern.com>",
                to: receiver,
                subject,
                html: htmlContent,
            };

            // Send email
            const info = await this.transporter.sendMail(mailOptions);
            console.log("Email sent:", info.messageId);

            return { success: true, message: "Email sent successfully!" };
        } catch (exc: any) {
            console.error("Error sending email:", exc.message);
            return { success: false, message: "Service unavailable: Error sending email!" };
        }
    }
}

export default EmailService;