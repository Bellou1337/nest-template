import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '../../jwt/jwt.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies['accessToken'];

    if (!token) {
      throw new UnauthorizedException('Access token missing or invalid');
    }

    try {
      const userId = await this.jwtService.verifyToken(token);
      const user = await this.usersService.findById(userId);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      request.user = { id: user.id };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
