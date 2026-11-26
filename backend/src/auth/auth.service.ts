import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, timingSafeEqual } from 'crypto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  private safeEquals(a: string, b: string): boolean {
    const digestA = createHash('sha256').update(a).digest();
    const digestB = createHash('sha256').update(b).digest();
    return timingSafeEqual(digestA, digestB);
  }

  validateCredentials(username: string, password: string): boolean {
    if (typeof username !== 'string' || typeof password !== 'string') {
      return false;
    }
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
    const userMatch = this.safeEquals(username, adminUser);
    const passMatch = this.safeEquals(password, adminPass);
    return userMatch && passMatch;
  }

  login(username: string) {
    const payload = { sub: username, role: 'admin' };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }
}
