import { Controller, Get, Post, Body } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHome(): string {
    return this.appService.getHome();
  }

  @Post("contact")
  contact(@Body() body: { name: string; email: string; message: string }) {
    return this.appService.contact(body);
  }

  @Get("analysis")
  analysis() {
    return this.appService.analysis();
  }
}
