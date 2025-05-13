import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../user/entity/user.entity';
import { ROLES_KEY } from '../auth/roles.decorator';
import { Request } from 'express';
import { JwtPayload } from './auth.guard';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (!requiredRoles) {
        return true;
      }

      const request: Request = context.switchToHttp().getRequest();

      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException('Invalid token');
      }

      const user: JwtPayload = await this.jwtService.verifyAsync<JwtPayload>(
        token,
        {
          secret: this.configService.get<string>('JWT_SECRET'),
        },
      );

      console.log(user);

      // const {user} = request.

      // const token = this.extractTokenFromHeader(request);
      // console.log('token: ', token);
      // console.log('ROLES_KEY: ', ROLES_KEY);

      // return requiredRoles.some((role) => user.role?.includes(role));
      return true;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException();
    }

    // const request = context
    //   .switchToHttp()
    //   .getRequest<{ user: { role: UserRole[] } }>();

    // return false;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers['authorization'];

    const [type, token] = authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }

  // private extractTokenFromHeader(request: Request): string | undefined {
  //   const authorization = request.headers.get('authorization');
  //   const [type, token] = authorization?.split(' ') ?? [];
  //   return type === 'Bearer' ? token : undefined;
  // }
}
