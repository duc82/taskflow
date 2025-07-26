import { DynamicModule, Global, Module } from "@nestjs/common";
import { CloudinaryService } from "./cloudinary.service";
import { v2 as cloudinary, ConfigOptions } from "cloudinary";

interface CloudinaryModuleOptions {
  useFactory?: (...args: any[]) => Promise<ConfigOptions> | ConfigOptions;
  inject?: any[];
}

@Global()
@Module({})
export class CloudinaryModule {
  static configure(options?: CloudinaryModuleOptions): DynamicModule {
    return {
      module: CloudinaryModule,
      providers: [
        {
          provide: "CLOUDINARY_SERVICE",
          useFactory: async (...args) => {
            if (options?.useFactory) {
              const config = await options.useFactory(...args);
              cloudinary.config(config);
            }
            return cloudinary;
          },
          inject: options.inject || [],
        },
        CloudinaryService,
      ],
      exports: [CloudinaryService],
    };
  }
}
