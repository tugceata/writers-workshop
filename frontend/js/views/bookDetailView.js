import { booksApi } from '../api.js';

export async function renderBookDetail({ params, app }) {
  const book = await booksApi.get(params.id);

  const statusLabels = {
    draft: 'Taslak', active: 'Aktif',
    completed: 'Tamamlandı', paused: 'Beklemede',
  };

  app.innerHTML = `
    <div class="page-header">
      <h1>${escapeHtml(book.title)}</h1>
      <a href="#/books" class="btn btn-secondary">← Kitaplarım</a>
    </div>

    <div class="card">
      <div class="card-meta">
        <span class="badge badge-status-${book.status}">
          ${statusLabels[book.status] || book.status}
        </span>
      </div>
      ${book.tags && book.tags.length > 0 ? `
        <div class="tag-list">
          ${book.tags.map(t => `<span class="badge">${escapeHtml(t.name)}</span>`).join('')}
        </div>
      ` : ''}
      ${book.description ? `<p style="margin-top: 12px;">${escapeHtml(book.description)}</p>` : ''}
      ${book.goals ? `
        <p style="margin-top: 12px; color: var(--gray-700);">
          <strong>Hedef:</strong> ${escapeHtml(book.goals)}
        </p>
      ` : ''}
    </div>

    <div style="margin-top: 32px;">
      <h2 style="margin-bottom: 16px;">Bölümler</h2>
      <div class="empty-state">
        <p>Bölüm yönetimi yarın eklenecek 🌸</p>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}