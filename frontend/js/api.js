import { getToken, clearSession } from './auth.js';

const API_BASE = 'http://localhost:3000/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  // Token varsa ekle
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);

  // 401 → token geçersiz, logout yap
  const isAuthEndpoint = path.startsWith('/auth/');
  if (response.status === 401 && !isAuthEndpoint) {
    clearSession();
    window.location.hash = '#/welcome';
    throw new Error('Oturum süresi doldu, lütfen tekrar giriş yapın');
  }

  if (response.status === 204) return null;

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || 'Bir hata oluştu');
    error.status = response.status;
    error.details = data.details;
    throw error;
  }

  return data;
}

// ═══════════════════════════════════════════════
// BOOKS
// ═══════════════════════════════════════════════
export const booksApi = {
  list:   (filters)=> {
    const params = new URLSearchParams(filters || {}).toString();
    return request(`/books${params ? '?' + params : ''}`);
  },
  get:    (id)     => request(`/books/${id}`),
  create: (data)   => request('/books', { method: 'POST', body: data }),
  update: (id, d)  => request(`/books/${id}`, { method: 'PUT', body: d }),
  remove: (id)     => request(`/books/${id}`, { method: 'DELETE' }),
};

// ═══════════════════════════════════════════════
// CHAPTERS
// ═══════════════════════════════════════════════
export const chaptersApi = {
  list:   (bookId)       => request(`/books/${bookId}/chapters`),
  get:    (bookId, id)   => request(`/books/${bookId}/chapters/${id}`),
  create: (bookId, d)    => request(`/books/${bookId}/chapters`, { method: 'POST', body: d }),
  update: (bookId, id, d)=> request(`/books/${bookId}/chapters/${id}`, { method: 'PUT', body: d }),
  remove: (bookId, id)   => request(`/books/${bookId}/chapters/${id}`, { method: 'DELETE' }),
  revisions: (bookId, id) => request(`/books/${bookId}/chapters/${id}/revisions`),
  restoreRevision: (bookId, id, revId) =>
    request(`/books/${bookId}/chapters/${id}/revisions/${revId}/restore`, { method: 'POST' }),
};

// ═══════════════════════════════════════════════
// READING LOG
// ═══════════════════════════════════════════════
export const readingLogApi = {
  list:   (filters)=> {
    const params = new URLSearchParams(filters || {}).toString();
    return request(`/reading-log${params ? '?' + params : ''}`);
  },
  get:    (id)     => request(`/reading-log/${id}`),
  create: (data)   => request('/reading-log', { method: 'POST', body: data }),
  update: (id, d)  => request(`/reading-log/${id}`, { method: 'PUT', body: d }),
  remove: (id)     => request(`/reading-log/${id}`, { method: 'DELETE' }),
  stats:  ()       => request('/reading-log/stats'),
};

// ═══════════════════════════════════════════════
// TAGS
// ═══════════════════════════════════════════════
export const tagsApi = {
  list: () => request('/tags'),
};

// ═══════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════
export const authApi = {
  register:       (data) => request('/auth/register', { method: 'POST', body: data }),
  login:          (data) => request('/auth/login',    { method: 'POST', body: data }),
  me:             ()     => request('/auth/me'),
  updateUsername: (data) => request('/auth/me', { method: 'PATCH', body: data }),
  changePassword: (data) => request('/auth/change-password', { method: 'POST', body: data }),
  deleteAccount:  ()     => request('/auth/me', { method: 'DELETE' }),
  updateTheme:    (data) => request('/auth/theme', { method: 'PATCH', body: data }),
};