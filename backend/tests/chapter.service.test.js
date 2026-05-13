const { countWords, nextChapterOrder } = require('../src/services/chapter.service');

describe('countWords', () => {
  test('boş string için 0 döner', () => {
    expect(countWords('')).toBe(0);
  });

  test('null veya undefined için 0 döner', () => {
    expect(countWords(null)).toBe(0);
    expect(countWords(undefined)).toBe(0);
  });

  test('düz metin için kelime sayar', () => {
    expect(countWords('Mira istasyonda durdu')).toBe(3);
  });

  test('HTML tag\'lerini sayıma katmaz', () => {
    expect(countWords('<p>Mira istasyonda durdu</p>')).toBe(3);
  });

  test('birden fazla tag ile sayar', () => {
    expect(countWords('<h1>Başlık</h1><p>Bu bir paragraf</p>')).toBe(4);
  });

  test('fazla boşlukları ihmal eder', () => {
    expect(countWords('  bir   iki   üç  ')).toBe(3);
  });

  test('uzun bir metni doğru sayar', () => {
    const html = '<p>Bu bir test metnidir ve toplam on kelimeden oluşmaktadır gerçekten.</p>';
    expect(countWords(html)).toBe(10);
  });
});

describe('nextChapterOrder', () => {
  test('hiç bölüm yoksa 1 döner', () => {
    expect(nextChapterOrder(0)).toBe(1);
  });

  test('mevcut max 5 ise 6 döner', () => {
    expect(nextChapterOrder(5)).toBe(6);
  });

  test('null/undefined için 1 döner', () => {
    expect(nextChapterOrder(null)).toBe(1);
    expect(nextChapterOrder(undefined)).toBe(1);
  });

  test('negatif değer için 1 döner', () => {
    expect(nextChapterOrder(-3)).toBe(1);
  });
});