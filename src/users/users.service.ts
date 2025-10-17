import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { CreateUser, User } from './types/user.types';
import type { Request } from 'express';
import type { User as PrismaUser } from 'generated/prisma';
import type { UpdatePasswordDto } from './dto/update-password.dto';
import { hashPassword } from 'src/shared/utils/password.utils';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { join, extname } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const startTime = Date.now();

    Logger.log(
      `findByEmail method start {userEmail: ${email}}`,
      'UsersService',
    );

    try {
      const duration = Date.now() - startTime;

      Logger.log(
        `Completed findByEmail method {userEmail: ${email} duration: ${duration}ms}`,
        'UsersService',
      );

      return this.prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
        },
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      Logger.error(
        `Error in findByEmail method {duration: ${duration}ms}`,
        error as Error,
        'UsersService',
      );
      throw new InternalServerErrorException(`server error: ${error as Error}`);
    }
  }

  async findAllData(params: {
    email?: string;
    id?: string;
  }): Promise<PrismaUser | null> {
    const startTime = Date.now();

    const { email, id } = params;

    Logger.log(
      `findAllData method start {userEmail: ${email}, userId: ${id}}`,
      'UsersService',
    );

    try {
      const duration = Date.now() - startTime;

      Logger.log(
        `Completed findAllData method {userEmail: ${email}, userId: ${id}, duration: ${duration}ms}`,
        'UsersService',
      );

      return this.prisma.user.findFirst({
        where: email ? { email } : { id },
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      Logger.error(
        `Error in findAllData method {duration: ${duration}ms}`,
        error as Error,
        'UsersService',
      );
      throw new InternalServerErrorException(`server error: ${error as Error}`);
    }
  }

  async create(data: CreateUser): Promise<User> {
    const startTime = Date.now();

    Logger.log(
      `create method start {userData: ${JSON.stringify(data)}}`,
      'UsersService',
    );

    try {
      const duration = Date.now() - startTime;

      Logger.log(
        `Completed create method {userData: ${JSON.stringify(data)}}, duration: ${duration}ms}`,
        'UsersService',
      );

      return this.prisma.user.create({
        data,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      Logger.error(
        `Error in create method {userData: ${JSON.stringify(data)}, duration: ${duration}ms}`,
        error as Error,
        'UsersService',
      );
      throw new InternalServerErrorException(`server error: ${error as Error}`);
    }
  }

  async findById(id: string): Promise<User | null> {
    const startTime = Date.now();

    Logger.log(`findById method start {userId: ${id}}`, 'UsersService');

    try {
      const duration = Date.now() - startTime;

      Logger.log(
        `Completed findById method {userId: ${id}, duration: ${duration}ms}`,
        'UsersService',
      );

      return this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
        },
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      Logger.error(
        `Error in findById method {userId: ${id}, duration: ${duration}ms}`,
        error as Error,
        'UsersService',
      );
      throw new InternalServerErrorException(`server error: ${error as Error}`);
    }
  }

  async getCurrentUser(request: Request): Promise<User | null> {
    const startTime = Date.now();

    const userId = request.user?.id!;

    Logger.log(
      `getCurrentUser method start {userId: ${userId}}`,
      'UsersService',
    );

    try {
      const duration = Date.now() - startTime;

      Logger.log(
        `Completed getCurrentUser method {userId: ${userId}, duration: ${duration}ms}`,
        'UsersService',
      );

      return this.findById(userId);
    } catch (error) {
      const duration = Date.now() - startTime;
      Logger.error(
        `Error in getCurrentUser method {userId: ${userId}, duration: ${duration}ms}`,
        error as Error,
        'UsersService',
      );
      throw new InternalServerErrorException(`server error: ${error as Error}`);
    }
  }

  async updatePassword(
    data: UpdatePasswordDto,
    request: Request,
  ): Promise<Record<string, string>> {
    const startTime = Date.now();

    const { newPassword } = data;

    const userId = request.user.id;

    Logger.log(
      `updatePassword method start {userId: ${userId}}`,
      'UsersService',
    );

    try {
      const hashedPassword = await hashPassword(newPassword);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
        },
      });

      const duration = Date.now() - startTime;

      Logger.log(
        `Completed updatePassword method {userId: ${userId}, duration: ${duration}ms}`,
        'UsersService',
      );

      return { message: 'Password updated successfully' };
    } catch (error) {
      const duration = Date.now() - startTime;
      Logger.error(
        `Error in updatePassword method {userId: ${userId}, duration: ${duration}ms}`,
        error as Error,
        'UsersService',
      );
      throw new InternalServerErrorException(`server error: ${error as Error}`);
    }
  }

  async updateUsername(
    data: UpdateUsernameDto,
    request: Request,
  ): Promise<User> {
    const startTime = Date.now();

    const { newUsername } = data;

    const userId = request.user.id;

    Logger.log(
      `updateUsername method start {userId: ${userId}, newUsername: ${newUsername}}`,
      'UsersService',
    );

    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          name: newUsername,
        },
      });

      user.name = newUsername;

      const duration = Date.now() - startTime;

      Logger.log(
        `Completed updateUsername method {userId: ${userId}, newUsername: ${newUsername}, duration: ${duration}ms}`,
        'UsersService',
      );

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      } as User;
    } catch (error) {
      const duration = Date.now() - startTime;
      Logger.error(
        `Error in updateUsername method {userId: ${userId}, newUsername: ${newUsername}, duration: ${duration}ms}`,
        error as Error,
        'UsersService',
      );
      throw new InternalServerErrorException(`server error: ${error as Error}`);
    }
  }

  async updateAvatar(
    file: Express.Multer.File,
    request: Request,
  ): Promise<User | void> {
    const startTime = Date.now();

    const userId = request.user.id;

    Logger.log(`updateAvatar method start {userId: ${userId}}`, 'UsersService');

    try {
      if (!file || !file.buffer) {
        throw new NotFoundException('file not provided');
      }

      const current = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!current) {
        throw new NotFoundException('User not found');
      }

      const uploadsDir = join(process.cwd(), 'uploads', 'avatars');
      await fs.mkdir(uploadsDir, { recursive: true });

      const ext = extname(file.originalname) || '.jpg';
      const fileName = `${userId}-${Date.now()}${ext}`;
      const filePath = join(uploadsDir, fileName);

      await fs.writeFile(filePath, file.buffer);

      if (current.avatar) {
        try {
          const oldAvatarPath = join(
            process.cwd(),
            current.avatar.startsWith('/')
              ? current.avatar.slice(1)
              : current.avatar,
          );

          await fs.unlink(oldAvatarPath);
        } catch (error) {}
      }

      const avatarDbPath = `/uploads/avatars/${fileName}`;

      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: {
          avatar: avatarDbPath,
        },
      });

      const duration = Date.now() - startTime;

      Logger.log(
        `Completed updateAvatar method {userId: ${userId}, duration: ${duration}ms}`,
        'UsersService',
      );

      return {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        avatar: updated.avatar,
      } as User;
    } catch (error) {
      const duration = Date.now() - startTime;
      Logger.error(
        `Error in updateAvatar method {userId: ${userId}, duration: ${duration}ms}`,
        error as Error,
        'UsersService',
      );
      throw new InternalServerErrorException(`server error: ${error as Error}`);
    }
  }

  async deleteAvatar(request: Request): Promise<void> {
    const startTime = Date.now();

    const userId = request.user.id;

    Logger.log(
      `Starting deleteAvatar method {userId: ${userId}}`,
      'UsersService',
    );

    try {
      const current = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!current) {
        throw new NotFoundException('User not found');
      }

      if (current.avatar) {
        try {
          const avatarPath = join(
            process.cwd(),
            current.avatar.startsWith('/')
              ? current.avatar.slice(1)
              : current.avatar,
          );

          await fs.unlink(avatarPath);
        } catch (error) {
          Logger.error('Error deleting avatar file:', error as Error);
        }
      }
      await this.prisma.user.update({
        where: { id: userId },
        data: { avatar: null },
      });

      const duration = Date.now() - startTime;

      Logger.log(
        `Completed deleteAvatar method {userId: ${userId}, duration: ${duration}ms}`,
        'UsersService',
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      Logger.error(
        `Error in deleteAvatar method {userId: ${userId}, duration: ${duration}ms}`,
        error as Error,
        'UsersService',
      );
    }
  }
}
