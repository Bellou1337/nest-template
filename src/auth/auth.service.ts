import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from 'src/jwt/jwt.service';
import {
  hashPassword,
  comparePasswords,
} from 'src/shared/utils/password.utils';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateRandomPassword } from 'src/shared/utils/password.utils';
import type { AuthResponse } from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const { email, password } = dto;

    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await hashPassword(password);

    dto.password = hashedPassword;

    const user = await this.usersService.create(dto);

    return {
      message: 'User registered successfully',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    } as AuthResponse;
  }

  async login(dto: LoginDto, response: Response): Promise<AuthResponse> {
    const { email, password } = dto;

    const user = await this.usersService.findAllData({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await comparePasswords(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtService.generateAccessToken(user.id);
    const refreshToken = await this.jwtService.generateRefreshToken(user.id);

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: this.configService.get<number>('ACCESS_TOKEN_EXPIRATION_COOKIE'),
    });

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: this.configService.get<number>('REFRESH_TOKEN_EXPIRATION_COOKIE'),
    });

    return {
      message: 'Login successful',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    } as AuthResponse;
  }

  async refresh(
    request: Request,
    response: Response,
  ): Promise<Record<string, string>> {
    const refreshToken = request.cookies['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    try {
      const userId = await this.jwtService.verifyRefreshToken(refreshToken);

      const user = await this.usersService.findById(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const newAccessToken = await this.jwtService.generateAccessToken(user.id);

      response.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        sameSite: 'strict',
        maxAge: this.configService.get<number>(
          'ACCESS_TOKEN_EXPIRATION_COOKIE',
        ),
      });

      return {
        message: 'Access token refreshed successfully',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async yandexLogin(req: Request, response: Response): Promise<AuthResponse> {
    if (!req.user) {
      throw new UnauthorizedException('Yandex authentication failed');
    }

    const { provider, providerId, email, name } = req.user;

    if (!provider || !providerId || !name || !email) {
      throw new UnauthorizedException('Invalid OAuth data');
    }

    const oauthProvider = await this.prismaService.oAuthProvider.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
      include: {
        user: true,
      },
    });

    let user;

    if (!oauthProvider) {
      user = await this.usersService.findByEmail(email);

      if (!user) {
        user = await this.prismaService.user.create({
          data: {
            email,
            name,
            password: await generateRandomPassword(),
            authProvider: 'YANDEX',
          },
        });

        await this.prismaService.oAuthProvider.create({
          data: {
            userId: user.id,
            provider,
            providerId,
          },
        });
      } else {
        await this.prismaService.oAuthProvider.create({
          data: {
            userId: user.id,
            provider,
            providerId,
          },
        });
      }
    } else {
      user = oauthProvider.user;
    }

    const accessToken = await this.jwtService.generateAccessToken(user.id);
    const refreshToken = await this.jwtService.generateRefreshToken(user.id);

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: this.configService.get<number>('ACCESS_TOKEN_EXPIRATION_COOKIE'),
    });

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: this.configService.get<number>('REFRESH_TOKEN_EXPIRATION_COOKIE'),
    });

    return {
      message: 'Yandex login successful',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    } as AuthResponse;
  }
}
