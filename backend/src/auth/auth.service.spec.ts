import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const prevUser = process.env.ADMIN_USERNAME;
  const prevPass = process.env.ADMIN_PASSWORD;

  beforeEach(() => {
    process.env.ADMIN_USERNAME = 'testadmin';
    process.env.ADMIN_PASSWORD = 'super-secret-password';
    service = new AuthService(new JwtService({ secret: 'test-secret' }));
  });

  afterEach(() => {
    process.env.ADMIN_USERNAME = prevUser;
    process.env.ADMIN_PASSWORD = prevPass;
  });

  it('validates matching credentials and rejects mismatched ones', () => {
    expect(service.validateCredentials('testadmin', 'super-secret-password')).toBe(true);
    expect(service.validateCredentials('testadmin', 'wrong')).toBe(false);
    expect(service.validateCredentials('wrong', 'super-secret-password')).toBe(false);
    expect(service.validateCredentials(undefined as any, 'super-secret-password')).toBe(false);
  });

  it('signs a JWT access_token on login', () => {
    const res = service.login('testadmin');
    expect(typeof res.access_token).toBe('string');
    const decoded = service.verifyToken(res.access_token);
    expect(decoded).toMatchObject({ sub: 'testadmin', role: 'admin' });
  });
});
