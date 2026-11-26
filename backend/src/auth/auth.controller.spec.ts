import { HttpException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RateLimitService } from '../common/rate-limit.service';

describe('AuthController', () => {
  let controller: AuthController;
  let rateLimit: RateLimitService;
  const prevUser = process.env.ADMIN_USERNAME;
  const prevPass = process.env.ADMIN_PASSWORD;

  beforeEach(() => {
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD = 'correct-password';
    rateLimit = new RateLimitService();
    const authService = new AuthService(new JwtService({ secret: 'test-secret' }));
    controller = new AuthController(authService, rateLimit);
  });

  afterEach(() => {
    process.env.ADMIN_USERNAME = prevUser;
    process.env.ADMIN_PASSWORD = prevPass;
  });

  it('returns access_token for valid credentials and resets failed attempts', () => {
    const req = { ip: '198.51.100.1' } as any;
    const res = { setHeader: jest.fn() } as any;

    expect(() =>
      controller.login(req, { username: 'admin', password: 'wrong' }, res),
    ).toThrow(UnauthorizedException);

    const result = controller.login(req, { username: 'admin', password: 'correct-password' }, res);
    expect(typeof result.access_token).toBe('string');
    expect(res.setHeader).toHaveBeenCalledWith('Set-Cookie', expect.stringContaining('is_admin=1'));
  });

  it('throws 429 after 5 consecutive failed login attempts from the same IP', () => {
    const req = { ip: '198.51.100.2' } as any;
    const res = { setHeader: jest.fn() } as any;

    for (let i = 0; i < 5; i++) {
      expect(() =>
        controller.login(req, { username: 'admin', password: 'wrong' }, res),
      ).toThrow(UnauthorizedException);
    }

    try {
      controller.login(req, { username: 'admin', password: 'correct-password' }, res);
      fail('Expected 429 HttpException');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpException);
      expect((err as HttpException).getStatus()).toBe(429);
    }
  });
});
