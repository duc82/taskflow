import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JwtService, JwtSignOptions, JwtVerifyOptions } from "@nestjs/jwt";
import { UsersService } from "src/users/users.service";
import { DataSource } from "typeorm";
import { SignInDto, SignUpDto } from "./auth.dto";
import { UserPayload } from "src/users/users.interface";
import { ConfigService } from "@nestjs/config";
import { UserToken } from "src/users/entities/user_tokens.entity";
import { MailerService } from "src/mailer/mailer.service";
import { Response } from "express";

@Injectable()
export class AuthService {
  private readonly accessSecret = this.configService.get("JWT_ACCESS_SECRET");
  private readonly refreshSecret = this.configService.get("JWT_REFRESH_SECRET");
  private readonly resetSecret = this.configService.get("JWT_RESET_SECRET");
  private readonly accessExpiration = this.configService.get(
    "JWT_ACCESS_EXPIRATION",
  );
  private readonly refreshExpiration = this.configService.get(
    "JWT_REFRESH_EXPIRATION",
  );
  private readonly clientUrl = this.configService.get("CLIENT_URL");

  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
    private configService: ConfigService,
    private mailerService: MailerService,
    private dataSource: DataSource,
  ) {}

  async generateToken(payload: UserPayload, options?: JwtSignOptions) {
    return this.jwtService.signAsync(payload, options);
  }

  async verifyToken<T>(token: string, options?: JwtVerifyOptions): Promise<T> {
    const payload = await this.jwtService.verifyAsync(token, options);
    return payload;
  }

  async signUp(signUpDto: SignUpDto) {
    const user = await this.userService.create(signUpDto);

    return {
      user,
      message: "Đăng ký thành công",
    };
  }

  async signIn(signInDto: SignInDto, res: Response) {
    const user = await this.userService.userRepository.findOne({
      where: { email: signInDto.email },
    });

    if (!user) {
      throw new BadRequestException("Email hoặc mật khẩu không chính xác");
    }

    const isMatch = await user.comparePassword(signInDto.password);

    if (!isMatch) {
      throw new BadRequestException("Email hoặc mật khẩu không chính xác");
    }

    const payload: UserPayload = {
      userId: user.id,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken(payload, {
        expiresIn: this.accessExpiration / 1000,
        secret: this.accessSecret,
      }),
      this.generateToken(payload, {
        expiresIn: this.refreshExpiration / 1000,
        secret: this.refreshSecret,
      }),
    ]);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: this.refreshExpiration,
    });

    return {
      user,
      accessToken,
      message: "Đăng nhập thành công",
    };
  }

  async refreshToken(token: string) {
    const { userId } = await this.verifyToken<UserPayload>(token, {
      secret: this.refreshSecret,
    });

    const user = await this.userService.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("Người dùng không tồn tại");
    }

    const payload = {
      userId: user.id,
      role: user.role,
    };

    const newAccessToken = await this.generateToken(payload, {
      expiresIn: this.accessExpiration / 1000,
      secret: this.accessSecret,
    });

    return {
      accessToken: newAccessToken,
      message: "Làm mới token thành công",
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userService.userRepository.findOne({
      where: { email },
      relations: { token: true },
    });

    if (!user) {
      throw new NotFoundException("Email không tồn tại");
    }

    const token = await this.generateToken(
      { userId: user.id, role: user.role },
      { expiresIn: "1h", secret: this.resetSecret },
    );

    const oneHour = 60 * 60 * 1000;

    if (user.token) {
      user.token.resetToken = token;
      user.token.resetTokenExpires = new Date(Date.now() + oneHour);
    } else {
      const newToken = this.dataSource.getRepository(UserToken).create({
        resetToken: token,
        resetTokenExpires: new Date(Date.now() + oneHour),
      });
      user.token = newToken;
    }

    const link = `${this.clientUrl}/doi-mat-khau/${token}`;

    await Promise.all([
      this.mailerService.sendMail({
        to: email,
        subject: "Khôi phục mật khẩu",
        template: "forgot-password",
        context: {
          name: user.name,
          link,
        },
      }),
      this.userService.userRepository.save(user),
    ]);

    return {
      message: "Email đã được gửi",
    };
  }

  async resetPassword(resetToken: string, password: string) {
    const payload = await this.verifyToken<UserPayload>(resetToken, {
      secret: this.resetSecret,
    });
    const user = await this.userService.userRepository.findOne({
      where: { id: payload.userId },
      relations: ["token"],
    });

    if (
      user?.token?.resetToken !== resetToken ||
      user?.token?.resetTokenExpires <= new Date()
    ) {
      throw new BadRequestException("Link không hợp lệ hoặc đã hết hạn");
    }

    user.password = password;
    user.token.resetToken = null;
    user.token.resetTokenExpires = null;

    await this.userService.userRepository.save(user);

    return {
      message: "Mật khẩu đã được thay đổi",
    };
  }
}
