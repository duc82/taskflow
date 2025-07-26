import "reflect-metadata";
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UsersModule } from "./users/users.module";
import { TasksModule } from "./tasks/tasks.module";
import { AuthModule } from "./auth/auth.module";
import { JwtGlobalModule } from "./jwt/jwt.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MailerModule } from "./mailer/mailer.module";
import { google } from "googleapis";
import { BoardsModule } from "./boards/boards.module";
import { AvatarModule } from "./avatar/avatar.module";
import { CloudinaryModule } from "./cloudinary/cloudinary.module";
import { ColumnsModule } from "./columns/columns.module";
import { UploadModule } from './upload/upload.module';
const OAuth2 = google.auth.OAuth2;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // TypeORM configuration
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: "postgres",
        url: configService.getOrThrow<string>("DATABASE_URL"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        logging: false,
        autoLoadEntities: true,
      }),
    }),

    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const oauth2Client = new OAuth2(
          configService.getOrThrow<string>("GOOGLE_CLIENT_ID"),
          configService.getOrThrow<string>("GOOGLE_CLIENT_SECRET"),
          "https://developers.google.com/oauthplayground",
        );
        oauth2Client.setCredentials({
          refresh_token: configService.getOrThrow<string>(
            "GOOGLE_REFRESH_TOKEN",
          ),
        });

        const accessToken = await new Promise<string>((resolve, reject) => {
          oauth2Client.getAccessToken((err, token) => {
            if (err) {
              reject(err);
            }
            resolve(token);
          });
        });

        return {
          transport: {
            service: "gmail",
            host: "smtp.gmail.com",
            secure: true,
            auth: {
              type: "OAuth2",
              user: configService.getOrThrow<string>("GOOGLE_EMAIL"),
              accessToken,
              clientId: configService.getOrThrow<string>("GOOGLE_CLIENT_ID"),
              clientSecret: configService.getOrThrow<string>(
                "GOOGLE_CLIENT_SECRET",
              ),
              refreshToken: configService.getOrThrow<string>(
                "GOOGLE_REFRESH_TOKEN",
              ),
            },
          },
          defaults: {
            from: `"TaskFlow" <${configService.getOrThrow<string>(
              "GOOGLE_EMAIL",
            )}>`,
          },
        };
      },
    }),

    CloudinaryModule.configure({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          cloud_name: configService.getOrThrow<string>("CLOUDINARY_CLOUD_NAME"),
          api_key: configService.getOrThrow<string>("CLOUDINARY_API_KEY"),
          api_secret: configService.getOrThrow<string>("CLOUDINARY_API_SECRET"),
        };
      },
    }),

    JwtGlobalModule,
    UsersModule,
    TasksModule,
    ColumnsModule,
    AuthModule,
    MailerModule,
    BoardsModule,
    AvatarModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
