import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { DataSource, ILike, In, Not } from "typeorm";
import { User } from "./entities/users.entity";
import { CreateUserDto, UpdatePasswordDto, UpdateUserDto } from "./users.dto";
import { QueryDto } from "src/dtos/query.dto";
import { AvatarService } from "src/avatar/avatar.service";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";
import { UploadApiResponse } from "cloudinary";

@Injectable()
export class UsersService {
  public readonly userRepository = this.dataSource.getRepository(User);

  constructor(
    private avatarService: AvatarService,
    private cloudinaryService: CloudinaryService,
    private dataSource: DataSource,
  ) {}

  async create(user: CreateUserDto, file?: Express.Multer.File) {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: user.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException("Email đã tồn tại");
    }

    let avatarRes: UploadApiResponse = null;

    try {
      if (!file) {
        const buffer = await this.avatarService.generateAvatar(user.name);
        avatarRes = await this.cloudinaryService.uploadFile(buffer, {
          folder: "taskflow/avatars",
          public_id: user.email,
        });
      } else {
        avatarRes = await this.cloudinaryService.uploadFile(file, {
          folder: "taskflow/avatars",
          public_id: user.email,
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

    const newUser = this.userRepository.create({
      ...user,
      avatar: avatarRes.secure_url,
    });
    await this.userRepository.save(newUser);

    return newUser;
  }

  async findAll(query: QueryDto) {
    const { search, exclude, page, limit } = query;

    const excludeIds = JSON.parse(exclude);

    if (!limit) {
      return this.userRepository.find({
        where: {
          name: ILike(`%${search}%`),
          id: Not(In(excludeIds)),
        },
      });
    }

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

  async searchUsers(search: string, userId: string) {
    const users = await this.userRepository
      .createQueryBuilder("user")
      .where(
        "user.name ILIKE :search OR user.email ILIKE :search AND user.id != :userId",
        {
          search: `%${search}%`,
          userId,
        },
      )
      .getMany();

    return users;
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

  async update(id: string, user: UpdateUserDto, file?: Express.Multer.File) {
    const userToUpdate = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!userToUpdate) {
      throw new NotFoundException("Người dùng không tồn tại");
    }

    if (file) {
      const avatarRes = await this.cloudinaryService.uploadFile(file, {
        folder: "taskflow/avatars",
        public_id: userToUpdate.email,
      });

      userToUpdate.avatar = avatarRes.secure_url;
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

  async softRemoveMultiple(ids: string[]) {
    const users = await this.userRepository.findBy({
      id: In(ids),
    });

    if (users.length === 0) {
      throw new NotFoundException("Không tìm thấy người dùng nào để xóa");
    }

    await this.userRepository.softRemove(users);

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

    await this.userRepository.delete(id);

    return {
      message: "Xóa người dùng thành công",
    };
  }
}
