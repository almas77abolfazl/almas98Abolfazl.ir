import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(
      request.headers.authorization as string | undefined,
    );
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    const user = this.authService.verifyToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    request['user'] = user;
    return true;
  }

  private extractToken(authHeader: string | undefined): string | undefined {
    if (!authHeader) return undefined;
    const [type, token] = String(authHeader).split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
