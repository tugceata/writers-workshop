const API_BASE = 'http://localhost:3000/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);

  // 204 (No Content) → boş cevap
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
  list:   ()       => request('/books'),
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