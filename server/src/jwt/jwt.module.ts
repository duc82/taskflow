import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

@Global()
@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),
  ],
  exports: [JwtModule],
})
export class JwtGlobalModule {}
