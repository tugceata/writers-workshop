import { booksApi } from '../api.js';
import { navigate } from '../router.js';

export async function renderBooksList({ app }) {
  const books = await booksApi.list();

  app.innerHTML = `
    <div class="page-header">
      <h1>Kitaplarım</h1>
      <a href="#/books/new" class="btn btn-primary">+ Yeni Kitap</a>
    </div>

    ${books.length === 0 ? `
      <div class="empty-state">
        <h2>Henüz kitap yok</h2>
        <p>İlk kitabını oluşturarak başla.</p>
      </div>
    ` : `
      <div class="grid">
        ${books.map(b => bookCard(b)).join('')}
      </div>
    `}
  `;

  // Sil butonları için event listener
  app.querySelectorAll('[data-delete-book]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const id = btn.dataset.deleteBook;
      if (confirm('Bu kitabı silmek istediğine emin misin?')) {
        await booksApi.remove(id);
        renderBooksList({ app });
      }
    });
  });
}

function bookCard(book) {
  const statusLabels = {
    draft:     'Taslak',
    active:    'Aktif',
    completed: 'Tamamlandı',
    paused:    'Beklemede',
  };

  return `
    <div class="card">
      <div class="card-title">${escapeHtml(book.title)}</div>
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
      ${book.description ? `
        <div class="card-description" style="margin-top: 12px;">${escapeHtml(book.description)}</div>
      ` : ''}
      <div class="card-actions">
        <a href="#/books/${book.id}" class="btn btn-secondary btn-sm">Aç</a>
        <button class="btn btn-danger btn-sm" data-delete-book="${book.id}">
          Sil
        </button>
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