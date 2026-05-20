import { booksApi } from '../api.js';
import { navigate } from '../router.js';
import { toast } from '../components/toast.js';

let booksFilters = { search: '', status: '', sort: 'updated_at', order: 'desc' };

export async function renderBooksList({ app }) {
  const response = await booksApi.list(cleanFilters(booksFilters));
  const books = response.data || response;

  app.innerHTML = `
    <div class="page-header">
      <h1>Kitaplarım</h1>
      <a href="#/books/new" class="btn btn-primary">+ Yeni Kitap</a>
    </div>

    <div class="filter-bar">
      <input type="text" id="f-search" class="filter-input" placeholder="🔍 Başlık veya açıklama ara..." value="${escapeHtml(booksFilters.search)}">
      <select id="f-status" class="filter-select">
        <option value="">Tüm durumlar</option>
        <option value="draft" ${booksFilters.status === 'draft' ? 'selected' : ''}>Taslak</option>
        <option value="completed" ${booksFilters.status === 'completed' ? 'selected' : ''}>Tamamlandı</option>
      </select>
      <select id="f-sort" class="filter-select">
        <option value="updated_at-desc" ${booksFilters.sort === 'updated_at' && booksFilters.order === 'desc' ? 'selected' : ''}>En son güncellenen</option>
        <option value="created_at-desc" ${booksFilters.sort === 'created_at' && booksFilters.order === 'desc' ? 'selected' : ''}>En yeni</option>
        <option value="created_at-asc" ${booksFilters.sort === 'created_at' && booksFilters.order === 'asc' ? 'selected' : ''}>En eski</option>
        <option value="title-asc" ${booksFilters.sort === 'title' && booksFilters.order === 'asc' ? 'selected' : ''}>Başlık (A-Z)</option>
        <option value="title-desc" ${booksFilters.sort === 'title' && booksFilters.order === 'desc' ? 'selected' : ''}>Başlık (Z-A)</option>
      </select>
    </div>

    <div id="books-container">
      ${renderBooksGrid(books)}
    </div>
  `;

  // Filtre eventleri
  const searchEl = document.getElementById('f-search');
  let searchTimer;
  searchEl.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      booksFilters.search = searchEl.value.trim();
      reload(app);
    }, 350);
  });

  document.getElementById('f-status').addEventListener('change', (e) => {
    booksFilters.status = e.target.value;
    reload(app);
  });

  document.getElementById('f-sort').addEventListener('change', (e) => {
    const [sort, order] = e.target.value.split('-');
    booksFilters.sort = sort;
    booksFilters.order = order;
    reload(app);
  });

  bindCardEvents(app);
}

async function reload(app) {
  const response = await booksApi.list(cleanFilters(booksFilters));
  const books = response.data || response;
  document.getElementById('books-container').innerHTML = renderBooksGrid(books);
  bindCardEvents(app);
}

function renderBooksGrid(books) {
  if (books.length === 0) {
    return `
      <div class="empty-state">
        <h2>Kitap bulunamadı</h2>
        <p>Filtreleri değiştir ya da yeni bir kitap oluştur.</p>
      </div>
    `;
  }
  return `<div class="grid">${books.map(b => bookCard(b)).join('')}</div>`;
}

function bindCardEvents(app) {
  app.querySelectorAll('.book-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.book-card-action')) return;
      navigate(`/books/${card.dataset.id}`);
    });
  });

  app.querySelectorAll('[data-edit-book]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigate(`/books/${btn.dataset.editBook}/edit`);
    });
  });

  app.querySelectorAll('[data-delete-book]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm('Bu kitabı silmek istediğine emin misin? Bölümleri de silinecek.')) {
        try {
          await booksApi.remove(btn.dataset.deleteBook);
          toast.success('Kitap silindi');
          reload(app);
        } catch (err) {
          toast.error('Silinemedi: ' + err.message);
        }
      }
    });
  });
}

function bookCard(book) {
  const statusLabel = book.status === 'completed' ? 'Tamamlandı' : 'Taslak';
  const statusClass = book.status === 'completed' ? 'badge-completed' : 'badge-draft';

  return `
    <div class="card book-card" data-id="${book.id}">
      <div class="book-card-header">
        <div class="book-card-title">${escapeHtml(book.title)}</div>
        <span class="badge ${statusClass}">${statusLabel}</span>
      </div>
      ${book.description ? `<div class="book-card-description">${escapeHtml(book.description)}</div>` : ''}
      ${book.tags && book.tags.length > 0 ? `
        <div class="book-card-tags">
          ${book.tags.map(t => `<span class="tag-chip">${escapeHtml(t.name)}</span>`).join('')}
        </div>
      ` : ''}
      <div class="book-card-actions">
        <button class="book-card-action" data-edit-book="${book.id}" title="Düzenle">✎</button>
        <button class="book-card-action book-card-action-danger" data-delete-book="${book.id}" title="Sil">🗑</button>
      </div>
    </div>
  `;
}

function cleanFilters(f) {
  const out = {};
  Object.entries(f).forEach(([k, v]) => { if (v !== '' && v != null) out[k] = v; });
  return out;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}