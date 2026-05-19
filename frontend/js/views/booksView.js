import { booksApi } from '../api.js';
import { navigate } from '../router.js';
import { toast } from '../components/toast.js';

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
        <p>İlk kitap projeni oluşturmak için yukarıdaki butona tıkla.</p>
      </div>
    ` : `
      <div class="grid">
        ${books.map(b => bookCard(b)).join('')}
      </div>
    `}
  `;

  // Kart tıklaması — detay sayfasına git
  app.querySelectorAll('.book-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Eğer düzenle veya sil butonuna tıklandıysa, kartın click'i çalışmasın
      if (e.target.closest('.book-card-action')) return;
      navigate(`/books/${card.dataset.id}`);
    });
  });

  // Düzenle butonu
  app.querySelectorAll('[data-edit-book]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // kart click'ini engelle
      navigate(`/books/${btn.dataset.editBook}/edit`);
    });
  });

  // Sil butonu
  app.querySelectorAll('[data-delete-book]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation(); // kart click'ini engelle
      if (confirm('Bu kitabı silmek istediğine emin misin? Bölümleri de silinecek.')) {
        try {
          await booksApi.remove(btn.dataset.deleteBook);
          toast.success('Kitap silindi');
          renderBooksList({ app });
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

      ${book.description ? `
        <div class="book-card-description">${escapeHtml(book.description)}</div>
      ` : ''}

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

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}