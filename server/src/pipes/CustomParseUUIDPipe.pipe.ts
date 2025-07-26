import { ParseUUIDPipe, ParseUUIDPipeOptions } from "@nestjs/common";

export class CustomParseUUIDPipe extends ParseUUIDPipe {
  constructor(options?: ParseUUIDPipeOptions) {
    super({
      exceptionFactory: () => {
        return {
          statusCode: 400,
          message: "UUID không hợp lệ",
          error: "Bad Request",
        };
      },
      ...options,
    });
  }
}
