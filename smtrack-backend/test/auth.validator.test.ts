import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
} from '../src/validators/auth.validator';

describe('registerSchema', () => {
  const validRegistration = {
    email: 'operator@example.com',
    password: 'secure-password',
    fullName: 'Meter Operator',
    phone: '+15551234567',
    role: 'MANAGER',
  };

  it('accepts valid registration details', () => {
    expect(registerSchema.safeParse(validRegistration).success).toBe(true);
  });

  it.each([
    ['invalid email', { ...validRegistration, email: 'not-an-email' }],
    ['short password', { ...validRegistration, password: 'short' }],
    ['short full name', { ...validRegistration, fullName: 'A' }],
    ['unsupported role', { ...validRegistration, role: 'OWNER' }],
  ])('rejects %s', (_case, input) => {
    expect(registerSchema.safeParse(input).success).toBe(false);
  });

  it('accepts an omitted optional phone and role', () => {
    const { phone: _phone, role: _role, ...registration } = validRegistration;

    expect(registerSchema.safeParse(registration).success).toBe(true);
  });
});

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    expect(
      loginSchema.safeParse({ email: 'operator@example.com', password: 'secret' }).success,
    ).toBe(true);
  });

  it.each([
    ['invalid email', { email: 'invalid', password: 'secret' }],
    ['missing password', { email: 'operator@example.com', password: '' }],
  ])('rejects %s', (_case, input) => {
    expect(loginSchema.safeParse(input).success).toBe(false);
  });
});

describe('refreshTokenSchema', () => {
  it('requires a non-empty refresh token', () => {
    expect(refreshTokenSchema.safeParse({ refreshToken: 'refresh-token' }).success).toBe(true);
    expect(refreshTokenSchema.safeParse({ refreshToken: '' }).success).toBe(false);
  });
});
