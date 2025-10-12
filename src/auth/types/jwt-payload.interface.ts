import { UserRole } from 'src/user/entity/user.entity';

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
