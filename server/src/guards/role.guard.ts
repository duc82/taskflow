import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "src/decorators/roles.decorator";
import { UserRole } from "src/users/users.enum";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException("Bạn chưa đăng nhập");
    }

    const hasRole = () =>
      requiredRoles.some((role) => user.roles?.includes(role)); // 'admin' | 'user'

    if (!hasRole()) {
      throw new ForbiddenException(
        "Bạn không có quyền truy cập vào tài nguyên này",
      );
    }
  }
}
