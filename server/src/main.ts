import { HttpAdapterHost, NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  BadRequestException,
  ClassSerializerInterceptor,
  ValidationPipe,
} from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
import { AllExceptionsFilter } from "./filters/all-exceptions.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigin = [process.env.CLIENT_URL, process.env.ADMIN_URL];

  app.enableCors({
    origin: allowedOrigin,
    credentials: true,
  });
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.useGlobalPipes(
    // validate the DTO object
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const firstError = Object.values(errors[0].constraints)[0];
        return new BadRequestException(firstError);
      },
      stopAtFirstError: true,
      // transfrom the payload to the DTO object
      transform: true,
    }),
  );

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
