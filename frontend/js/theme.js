/**
 * Tema yönetimi.
 * Kullanıcının seçtiği temayı localStorage'da saklar ve uygular.
 */

const STORAGE_KEY = 'ww_theme';
const DEFAULT_THEME = 'rose';

export const THEMES = {
  rose: {
    name: 'Gül',
    description: 'Tok ve sıcak pembe',
    preview: ['#FCE4E9', '#D87489', '#C04B6B', '#7A2540'],
  },
  lavender: {
    name: 'Erik',
    description: 'Derin lavanta tonları',
    preview: ['#E8DEEE', '#B190C5', '#6E4F8A', '#3D2C50'],
  },
  ocean: {
    name: 'Lacivert',
    description: 'Sakin deniz tonları',
    preview: ['#D5DEEA', '#7A8FB0', '#2D4970', '#14253E'],
  },
  forest: {
    name: 'Çam',
    description: 'Derin orman yeşili',
    preview: ['#D5E3D7', '#82A887', '#3F6845', '#1F3925'],
  },
};

export function getTheme() {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
}

export function setTheme(themeId) {
  if (!THEMES[themeId]) return;
  localStorage.setItem(STORAGE_KEY, themeId);
  applyTheme(themeId);
}

export function applyTheme(themeId) {
  document.documentElement.setAttribute('data-theme', themeId);
}

// Sayfa yüklenirken otomatik uygula
applyTheme(getTheme());