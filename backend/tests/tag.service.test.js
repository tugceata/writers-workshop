const { validateTagIds } = require('../src/services/tag.service');

describe('validateTagIds', () => {
  test('null/undefined için boş dizi döner', () => {
    expect(validateTagIds(null)).toEqual([]);
    expect(validateTagIds(undefined)).toEqual([]);
  });

  test('boş dizi için boş dizi döner', () => {
    expect(validateTagIds([])).toEqual([]);
  });

  test('geçerli id\'leri integer\'a çevirir', () => {
    expect(validateTagIds(['1', '2', '3'])).toEqual([1, 2, 3]);
  });

  test('tekrarları çıkarır', () => {
    expect(validateTagIds([1, 1, 2, 2, 3])).toEqual([1, 2, 3]);
  });

  test('3\'ten fazla tag için hata fırlatır', () => {
    expect(() => validateTagIds([1, 2, 3, 4])).toThrow('En fazla 3 tag');
  });

  test('geçersiz değerleri filtreler', () => {
    expect(validateTagIds([1, 'abc', 2, null])).toEqual([1, 2]);
  });

  test('dizi olmayan değer için hata fırlatır', () => {
    expect(() => validateTagIds('1,2,3')).toThrow('dizi olmalıdır');
  });
});