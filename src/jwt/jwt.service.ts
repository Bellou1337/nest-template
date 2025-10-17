import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAccessToken(userId: string): Promise<string> {
    const payload = { sub: userId };

    return this.jwtService.signAsync(payload);
  }

  async verifyToken(token: string): Promise<string> {
    const payload = await this.jwtService.verifyAsync(token);
    return payload.sub;
  }

  async generateRefreshToken(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId, type: 'refresh' },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRES_IN',
        ) as any,
      },
    );
  }

  async verifyRefreshToken(token: string): Promise<string> {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });

    return payload.sub;
  }
}
