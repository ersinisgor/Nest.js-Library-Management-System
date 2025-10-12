import { JwtPayload } from './jwt-payload.interface';
import { Request } from 'express';

export interface AuthRequest extends Request {
  user: JwtPayload;
}
