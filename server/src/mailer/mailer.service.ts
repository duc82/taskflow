import { Inject, Injectable } from "@nestjs/common";
import { createTransport } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import * as ejs from "ejs";
import { TransportOptions } from "./mailer.module";

interface MailOptions extends Mail.Options {
  template?: string;
  context: Record<string, any>;
}

@Injectable()
export class MailerService {
  private readonly transporter = createTransport(
    this.transportOptions.transport,
    this.transportOptions.defaults,
  );

  constructor(
    @Inject("MAILER_TRANSPORT_OPTIONS")
    private readonly transportOptions: TransportOptions,
  ) {}

  async sendMail(mailOptions: MailOptions) {
    if (mailOptions.template) {
      const templatePath =
        process.cwd() + `/templates/mail/${mailOptions.template}.ejs`;
      const data = await ejs.renderFile(templatePath, mailOptions.context);
      mailOptions.html = data;
    }

    return await this.transporter.sendMail(mailOptions);
  }
}
