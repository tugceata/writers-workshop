const jwt = require('jsonwebtoken');

// JWT_SECRET'ı test için ayarla (env'den okumaz)
process.env.JWT_SECRET = 'test_secret_key_for_unit_tests_only';
process.env.JWT_EXPIRES_IN = '7d';

const authService = require('../src/services/auth.service');

describe('generateToken', () => {
  test('geçerli bir JWT token üretir', () => {
    const user = { id: 1, email: 'test@example.com', username: 'tester' };
    const token = authService.generateToken(user);

    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // header.payload.signature
  });

  test('token kullanıcı bilgisini doğru şekilde içerir', () => {
    const user = { id: 42, email: 'ayse@example.com', username: 'ayse' };
    const token = authService.generateToken(user);

    // Token'ı çöz (verify değil sadece decode)
    const decoded = jwt.decode(token);

    expect(decoded.id).toBe(42);
    expect(decoded.email).toBe('ayse@example.com');
    expect(decoded.username).toBe('ayse');
  });

  test('token süresi (exp) içerir', () => {
    const user = { id: 1, email: 'test@example.com', username: 'test' };
    const token = authService.generateToken(user);
    const decoded = jwt.decode(token);

    expect(decoded.exp).toBeDefined();
    expect(decoded.exp).toBeGreaterThan(decoded.iat);
  });

  test('aynı kullanıcı için her zaman geçerli token üretir', () => {
    const user = { id: 1, email: 'test@example.com', username: 'test' };
    const token1 = authService.generateToken(user);
    const token2 = authService.generateToken(user);

    // Token'lar farklı olabilir (iat değişir) ama her ikisi de geçerli
    expect(authService.verifyToken(token1)).not.toBeNull();
    expect(authService.verifyToken(token2)).not.toBeNull();
  });
});

describe('verifyToken', () => {
  test('geçerli token için payload döner', () => {
    const user = { id: 1, email: 'test@example.com', username: 'test' };
    const token = authService.generateToken(user);

    const payload = authService.verifyToken(token);

    expect(payload).not.toBeNull();
    expect(payload.id).toBe(1);
    expect(payload.email).toBe('test@example.com');
  });

  test('geçersiz token için null döner', () => {
    const result = authService.verifyToken('bu.gecersiz.bir.token');
    expect(result).toBeNull();
  });

  test('bozuk format token için null döner', () => {
    const result = authService.verifyToken('saçma_string');
    expect(result).toBeNull();
  });

  test('boş string için null döner', () => {
    const result = authService.verifyToken('');
    expect(result).toBeNull();
  });

  test('farklı secret ile imzalanmış token için null döner', () => {
    // Başka bir secret ile token üret
    const fakeToken = jwt.sign({ id: 1 }, 'baska_secret', { expiresIn: '1h' });

    const result = authService.verifyToken(fakeToken);
    expect(result).toBeNull();
  });

  test('süresi dolmuş token için null döner', () => {
    // 1 saniye önce sürmüş bir token
    const expiredToken = jwt.sign(
      { id: 1, email: 'test@example.com' },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' }
    );

    const result = authService.verifyToken(expiredToken);
    expect(result).toBeNull();
  });
});

describe('registerSchema validation', () => {
  const { registerSchema } = require('../src/validators/auth.validator');

  test('geçerli kayıt verisini kabul eder', () => {
    const { error } = registerSchema.validate({
      email: 'test@example.com',
      username: 'tugce',
      password: 'sifre123',
    });
    expect(error).toBeUndefined();
  });

  test('username opsiyoneldir', () => {
    const { error } = registerSchema.validate({
      email: 'test@example.com',
      password: 'sifre123',
    });
    expect(error).toBeUndefined();
  });

  test('username boş string olabilir', () => {
    const { error } = registerSchema.validate({
      email: 'test@example.com',
      username: '',
      password: 'sifre123',
    });
    expect(error).toBeUndefined();
  });

  test('eksik email reddedilir', () => {
    const { error } = registerSchema.validate({
      password: 'sifre123',
    });
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain('zorunlu');
  });

  test('geçersiz email formatı reddedilir', () => {
    const { error } = registerSchema.validate({
      email: 'gecersiz-email',
      password: 'sifre123',
    });
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain('e-posta');
  });

  test('eksik şifre reddedilir', () => {
    const { error } = registerSchema.validate({
      email: 'test@example.com',
    });
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain('zorunlu');
  });

  test('çok kısa şifre reddedilir', () => {
    const { error } = registerSchema.validate({
      email: 'test@example.com',
      password: '12345', // 5 karakter (min 6)
    });
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain('6 karakter');
  });

  test('çok uzun username reddedilir', () => {
    const { error } = registerSchema.validate({
      email: 'test@example.com',
      username: 'a'.repeat(51), // max 50
      password: 'sifre123',
    });
    expect(error).toBeDefined();
  });
});

describe('loginSchema validation', () => {
  const { loginSchema } = require('../src/validators/auth.validator');

  test('geçerli giriş verisini kabul eder', () => {
    const { error } = loginSchema.validate({
      email: 'test@example.com',
      password: 'herhangibirsey',
    });
    expect(error).toBeUndefined();
  });

  test('eksik email reddedilir', () => {
    const { error } = loginSchema.validate({
      password: 'sifre123',
    });
    expect(error).toBeDefined();
  });

  test('eksik şifre reddedilir', () => {
    const { error } = loginSchema.validate({
      email: 'test@example.com',
    });
    expect(error).toBeDefined();
  });

  test('geçersiz email formatı reddedilir', () => {
    const { error } = loginSchema.validate({
      email: 'sacma-email',
      password: 'sifre123',
    });
    expect(error).toBeDefined();
  });
});

describe('changePasswordSchema validation', () => {
  const { changePasswordSchema } = require('../src/validators/auth.validator');

  test('geçerli şifre değiştirme verisini kabul eder', () => {
    const { error } = changePasswordSchema.validate({
      current_password: 'eskisifre',
      new_password: 'yenisifre123',
    });
    expect(error).toBeUndefined();
  });

  test('eksik mevcut şifre reddedilir', () => {
    const { error } = changePasswordSchema.validate({
      new_password: 'yenisifre123',
    });
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain('zorunlu');
  });

  test('eksik yeni şifre reddedilir', () => {
    const { error } = changePasswordSchema.validate({
      current_password: 'eskisifre',
    });
    expect(error).toBeDefined();
  });

  test('çok kısa yeni şifre reddedilir', () => {
    const { error } = changePasswordSchema.validate({
      current_password: 'eskisifre',
      new_password: '123', // 3 karakter
    });
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain('6 karakter');
  });
});