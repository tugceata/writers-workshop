const {
  calculateAverageRating,
  groupByGenre,
  calculateReadingDays,
} = require('../src/services/readingLog.service');

describe('calculateAverageRating', () => {
  test('boş liste için 0 döner', () => {
    expect(calculateAverageRating([])).toBe(0);
  });

  test('dizi olmayan girdi için 0 döner', () => {
    expect(calculateAverageRating(null)).toBe(0);
    expect(calculateAverageRating(undefined)).toBe(0);
  });

  test('tek kayıt için doğru ortalama', () => {
    expect(calculateAverageRating([{ rating: 5 }])).toBe(5);
  });

  test('birden çok kayıt için doğru ortalama', () => {
    const entries = [
      { rating: 5 },
      { rating: 4 },
      { rating: 3 },
    ];
    expect(calculateAverageRating(entries)).toBe(4);
  });

  test('1 ondalığa yuvarlar', () => {
    const entries = [
      { rating: 5 },
      { rating: 4 },
      { rating: 4 },
    ];
    expect(calculateAverageRating(entries)).toBe(4.3);
  });

  test('null veya 0 puanları hariç tutar', () => {
    const entries = [
      { rating: 5 },
      { rating: null },
      { rating: 0 },
      { rating: 3 },
    ];
    expect(calculateAverageRating(entries)).toBe(4);
  });

  test('hiçbiri puanlanmamışsa 0 döner', () => {
    expect(calculateAverageRating([{ rating: null }, { rating: null }])).toBe(0);
  });
});

describe('groupByGenre', () => {
  test('boş liste için boş obje döner', () => {
    expect(groupByGenre([])).toEqual({});
  });

  test('türlere göre doğru sayar', () => {
    const entries = [
      { genre: 'roman' },
      { genre: 'roman' },
      { genre: 'şiir' },
    ];
    expect(groupByGenre(entries)).toEqual({ roman: 2, şiir: 1 });
  });

  test('tür belirtilmemişse "Belirtilmemiş" altında sayar', () => {
    const entries = [
      { genre: 'roman' },
      { genre: null },
      { genre: undefined },
      {},
    ];
    expect(groupByGenre(entries)).toEqual({
      roman: 1,
      Belirtilmemiş: 3,
    });
  });
});

describe('calculateReadingDays', () => {
  test('null veya eksik girdi için null döner', () => {
    expect(calculateReadingDays(null)).toBe(null);
    expect(calculateReadingDays({})).toBe(null);
    expect(calculateReadingDays({ started_date: '2026-01-01' })).toBe(null);
    expect(calculateReadingDays({ finished_date: '2026-01-01' })).toBe(null);
  });

  test('aynı gün başlayıp biten kitap için 1 döner', () => {
    expect(calculateReadingDays({
      started_date: '2026-01-01',
      finished_date: '2026-01-01',
    })).toBe(1);
  });

  test('5 günde biten kitap için doğru sayar', () => {
    expect(calculateReadingDays({
      started_date: '2026-01-01',
      finished_date: '2026-01-05',
    })).toBe(5);
  });

  test('bitiş tarihi başlangıçtan öncesi null döner', () => {
    expect(calculateReadingDays({
      started_date: '2026-01-10',
      finished_date: '2026-01-05',
    })).toBe(null);
  });
});

describe('groupByRating', () => {
  const { groupByRating } = require('../src/services/readingLog.service');

  test('boş liste için tüm puanlar 0', () => {
    expect(groupByRating([])).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  test('puanları doğru sayar', () => {
    const entries = [
      { rating: 5 },
      { rating: 5 },
      { rating: 4 },
      { rating: 3 },
      { rating: 3 },
      { rating: 3 },
    ];
    expect(groupByRating(entries)).toEqual({ 1: 0, 2: 0, 3: 3, 4: 1, 5: 2 });
  });

  test('null/geçersiz puanları görmezden gelir', () => {
    const entries = [
      { rating: 5 },
      { rating: null },
      { rating: 0 },
      { rating: 6 },
      { rating: 3 },
    ];
    expect(groupByRating(entries)).toEqual({ 1: 0, 2: 0, 3: 1, 4: 0, 5: 1 });
  });
});