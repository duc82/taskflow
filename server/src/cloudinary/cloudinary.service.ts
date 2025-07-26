import { Inject, Injectable } from "@nestjs/common";
import {
  UploadApiOptions,
  UploadApiResponse,
  v2 as cloudinaryInstance,
} from "cloudinary";

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject("CLOUDINARY_SERVICE")
    private readonly cloudinary: typeof cloudinaryInstance,
  ) {}

  uploadFile(
    file: Express.Multer.File | Buffer<ArrayBufferLike>,
    options?: UploadApiOptions,
  ): Promise<UploadApiResponse> {
    const isBuffer = Buffer.isBuffer(file);

    return new Promise<UploadApiResponse>((resolve, reject) => {
      this.cloudinary.uploader
        .upload_stream(options, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        })
        .end(isBuffer ? file : file.buffer);
    });
  }
}
