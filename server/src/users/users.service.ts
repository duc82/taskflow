import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DataSource, ILike, In, Not } from "typeorm";
import { User } from "./entities/users.entity";
import { CreateUserDto, UpdatePasswordDto, UpdateUserDto } from "./users.dto";
import { QueryDto } from "src/dtos/query.dto";

@Injectable()
export class UsersService {
  public readonly userRepository = this.dataSource.getRepository(User);

  constructor(private dataSource: DataSource) {}

  async create(user: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: user.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException("Email đã tồn tại");
    }

    const newUser = this.userRepository.create(user);
    await this.userRepository.save(newUser);
    return newUser;
  }

  async findAll(query: QueryDto) {
    const { search, exclude, page, limit } = query;

    const excludeIds = JSON.parse(exclude);

    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      where: {
        name: ILike(`%${search}%`),
        id: Not(In(excludeIds)),
      },
      skip,
      take: limit,
    });

    return {
      users,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException("Người dùng không tồn tại");
    }

    return user;
  }

  async changePassword(id: string, data: UpdatePasswordDto) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException("Người dùng không tồn tại");
    }

    const isPasswordMatch = await user.comparePassword(data.password);

    if (!isPasswordMatch) {
      throw new BadRequestException("Mật khẩu hiện tại không đúng");
    }

    user.password = data.newPassword;

    await this.userRepository.save(user);

    return {
      message: "Đổi mật khẩu thành công",
    };
  }

  async update(id: string, user: UpdateUserDto) {
    const userToUpdate = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!userToUpdate) {
      throw new NotFoundException("Người dùng không tồn tại");
    }

    Object.assign(userToUpdate, user);

    if (!user.password) {
      delete userToUpdate.password;
    }

    return await this.userRepository.save(userToUpdate);
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException("Người dùng không tồn tại");
    }

    await this.userRepository.softRemove(user);

    return {
      message: "Xóa người dùng thành công",
    };
  }

  async restore(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException("Người dùng không tồn tại");
    }

    await this.userRepository.restore(user.id);

    return {
      message: "Khôi phục người dùng thành công",
    };
  }

  async delete(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException("Người dùng không tồn tại");
    }

    await this.userRepository.remove(user);

    return {
      message: "Xóa người dùng thành công",
    };
  }
}
