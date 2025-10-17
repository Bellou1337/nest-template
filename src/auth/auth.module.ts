import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from 'src/jwt/jwt.module';
import { ConfigModule } from '@nestjs/config';
import { YandexStrategy } from './strategies/yandex.strategy';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, YandexStrategy],
  imports: [UsersModule, JwtModule, ConfigModule, PassportModule, PrismaModule],
  exports: [],
})
export class AuthModule {}
