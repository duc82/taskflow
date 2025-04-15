import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHome(): string {
    return "API quản lý ứng dụng đánh giá hoàn thành công việc";
  }
}
