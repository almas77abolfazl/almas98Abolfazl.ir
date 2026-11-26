import { Controller, Post, Body, UnauthorizedException, HttpException, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RateLimitService } from '../common/rate-limit.service';

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly rateLimit: RateLimitService,
  ) {}

  @Post('login')
  login(
    @Req() req: Request,
    @Body() body: { username: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = (req as any).ip ?? (req as any).socket?.remoteAddress ?? 'unknown';
    const rateKey = `login:${ip}`;
    if (this.rateLimit.isBlocked(rateKey, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS)) {
      throw new HttpException('Too many attempts, please try again later.', 429);
    }

    const username = body?.username ?? '';
    const password = body?.password ?? '';
    if (!this.authService.validateCredentials(username, password)) {
      this.rateLimit.recordHit(rateKey, LOGIN_WINDOW_MS);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.rateLimit.reset(rateKey);
    const isProd = process.env.NODE_ENV === 'production';
    const domainAttr = isProd ? '; Domain=.almas98abolfazl.ir' : '';
    const secureAttr = isProd ? '; Secure' : '';
    res.setHeader(
      'Set-Cookie',
      `is_admin=1; Path=/; Max-Age=31536000${domainAttr}${secureAttr}; SameSite=Lax`,
    );
    return this.authService.login(username);
  }
}
