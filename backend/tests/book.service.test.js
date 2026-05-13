const { calculateBookProgress } = require('../src/services/book.service');

describe('calculateBookProgress', () => {
  test('hiç bölüm yoksa 0 döner', () => {
    expect(calculateBookProgress({}, 0, 0)).toBe(0);
  });

  test('yarısı yazıldıysa 50 döner', () => {
    expect(calculateBookProgress({}, 10, 5)).toBe(50);
  });

  test('hepsi yazıldıysa 100 döner', () => {
    expect(calculateBookProgress({}, 10, 10)).toBe(100);
  });

  test('100 üstüne çıkmaz', () => {
    expect(calculateBookProgress({}, 10, 15)).toBe(100);
  });

  test('negatife düşmez', () => {
    expect(calculateBookProgress({}, 10, -5)).toBe(0);
  });

  test('yuvarlama doğru çalışır', () => {
    expect(calculateBookProgress({}, 3, 1)).toBe(33);
    expect(calculateBookProgress({}, 3, 2)).toBe(67);
  });
});