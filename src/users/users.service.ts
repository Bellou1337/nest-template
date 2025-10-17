import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
  }

  async findAllData(params: {
    email?: string;
    id?: string;
  }): Promise<PrismaUser | null> {
    const { email, id } = params;

    return this.prisma.user.findFirst({
      where: email ? { email } : { id },
    });
  }

  async create(data: CreateUser): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findById(id: string): Promise<User | null> {
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
  }

  async getCurrentUser(request: Request): Promise<User | null> {
    const userId = request.user?.id!;

    return this.findById(userId);
  }

  async updatePassword(
    data: UpdatePasswordDto,
    request: Request,
  ): Promise<Record<string, string>> {
    const { newPassword } = data;

    const userId = request.user.id;

    const hashedPassword = await hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return { message: 'Password updated successfully' };
  }

  async updateUsername(
    data: UpdateUsernameDto,
    request: Request,
  ): Promise<User> {
    const { newUsername } = data;

    const userId = request.user.id;

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: newUsername,
      },
    });

    user.name = newUsername;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    } as User;
  }

  async updateAvatar(
    file: Express.Multer.File,
    request: Request,
  ): Promise<User | void> {
    const userId = request.user.id;

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

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      avatar: updated.avatar,
    } as User;
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
