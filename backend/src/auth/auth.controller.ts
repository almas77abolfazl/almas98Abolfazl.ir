import { Controller, Post, Body, UnauthorizedException, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(
    @Body() body: { username: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { username, password } = body;
    if (!this.authService.validateCredentials(username, password)) {
      throw new UnauthorizedException('Invalid credentials');
    }
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
