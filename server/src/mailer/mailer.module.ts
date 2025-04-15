import { DynamicModule, Global, Module } from "@nestjs/common";
import { MailerService } from "./mailer.service";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export interface TransportOptions {
  transport?: SMTPTransport | SMTPTransport.Options | string;
  defaults?: SMTPTransport.Options;
}

interface MailerModuleAsyncOptions {
  useFactory?: (...args: any[]) => Promise<TransportOptions>;
  inject?: any[];
}

@Global()
@Module({})
export class MailerModule {
  static forRoot(options?: TransportOptions): DynamicModule {
    return {
      module: MailerModule,
      providers: [
        {
          provide: "MAILER_TRANSPORT_OPTIONS",
          useValue: options,
        },
        MailerService,
      ],
      exports: [MailerService],
    };
  }

  static forRootAsync(options: MailerModuleAsyncOptions): DynamicModule {
    return {
      module: MailerModule,
      providers: [
        {
          provide: "MAILER_TRANSPORT_OPTIONS",
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        MailerService,
      ],
      exports: [MailerService],
    };
  }
}
