import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request.headers.authorization as string | undefined);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    const user = this.authService.verifyToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    request['user'] = user;
    const response = context.switchToHttp().getResponse();
    if (response && typeof response.setHeader === 'function') {
      const isProd = process.env.NODE_ENV === 'production';
      const domainAttr = isProd ? '; Domain=.almas98abolfazl.ir' : '';
      const secureAttr = isProd ? '; Secure' : '';
      response.setHeader(
        'Set-Cookie',
        `is_admin=1; Path=/; Max-Age=31536000${domainAttr}${secureAttr}; SameSite=Lax`,
      );
    }
    return true;
  }

  private extractToken(authHeader: string | undefined): string | undefined {
    if (!authHeader) return undefined;
    const [type, token] = String(authHeader).split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
