import { config } from 'dotenv';
import { createTransport, Transporter } from 'nodemailer';
config();

export class Mailer {
  private user = process.env.MY_ACCOUNT;
  private pass = process.env.MY_PASSWORD;
  private service = 'gmail';
  private transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      service: this.service,
      auth: {
        user: this.user,
        pass: this.pass
      }
    });
  }

  static emailVerify(email: string) {
    return RegExp(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ).test(email);
  }

  private getMailOptions(to: string, subject: string, text: string) {
    return {
      from: this.user,
      to: to,
      subject: subject,
      text: text
    };
  }

  send(toEmail: string, subject: string, text: string) {
    if (!Mailer.emailVerify(toEmail)) throw new EmailNotValid();
    let mailOptions = this.getMailOptions(toEmail, subject, text);
    this.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        throw new EmailNotFound();
      } else {
        console.warn('Email sent: ' + info.response);
      }
    });
  }
}
