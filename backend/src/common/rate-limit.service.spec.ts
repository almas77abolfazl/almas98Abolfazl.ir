import { RateLimitService } from './rate-limit.service';

describe('RateLimitService', () => {
  let service: RateLimitService;

  beforeEach(() => {
    service = new RateLimitService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('increments counter and blocks once max is reached', () => {
    expect(service.isAllowed('ip:1.1.1.1', 2, 10_000)).toBe(true);
    expect(service.isAllowed('ip:1.1.1.1', 2, 10_000)).toBe(true);
    expect(service.isAllowed('ip:1.1.1.1', 2, 10_000)).toBe(false);
  });

  it('isolates counters across different keys/IPs', () => {
    expect(service.isAllowed('ip:1.1.1.1', 1, 10_000)).toBe(true);
    expect(service.isAllowed('ip:1.1.1.1', 1, 10_000)).toBe(false);
    expect(service.isAllowed('ip:2.2.2.2', 1, 10_000)).toBe(true);
  });

  it('expires old hits after windowMs elapses', () => {
    let now = 1_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);

    expect(service.isAllowed('ip:3.3.3.3', 1, 5_000)).toBe(true);
    expect(service.isAllowed('ip:3.3.3.3', 1, 5_000)).toBe(false);

    now += 5_001;
    expect(service.isAllowed('ip:3.3.3.3', 1, 5_000)).toBe(true);
  });

  it('supports isBlocked, recordHit, and reset', () => {
    expect(service.isBlocked('login:1.2.3.4', 2, 60_000)).toBe(false);
    service.recordHit('login:1.2.3.4', 60_000);
    expect(service.isBlocked('login:1.2.3.4', 2, 60_000)).toBe(false);
    service.recordHit('login:1.2.3.4', 60_000);
    expect(service.isBlocked('login:1.2.3.4', 2, 60_000)).toBe(true);

    service.reset('login:1.2.3.4');
    expect(service.isBlocked('login:1.2.3.4', 2, 60_000)).toBe(false);
  });
});
