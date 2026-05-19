import { booksApi, chaptersApi } from '../api.js';
import { navigate } from '../router.js';
import { toast } from '../components/toast.js';

export async function renderBookDetail({ params, app }) {
  const [book, chapters] = await Promise.all([
    booksApi.get(params.id),
    chaptersApi.list(params.id),
  ]);

  const statusLabels = {
    draft: 'Taslak', active: 'Aktif',
    completed: 'Tamamlandı', paused: 'Beklemede',
  };

  app.innerHTML = `
    <div class="page-header">
      <h1>${escapeHtml(book.title)}</h1>
      <div style="display: flex; gap: 8px;">
  <a href="#/books/${book.id}/read" class="btn btn-primary">Önizleme</a>
  <a href="#/books/${book.id}/edit" class="btn btn-secondary">Düzenle</a>
  <a href="#/books" class="btn btn-secondary">← Kitaplarım</a>
</div>
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
    </div>

    <div class="chapters-section">
      <div class="chapters-header">
        <h2>Bölümler (${chapters.length})</h2>
        <button id="new-chapter-btn" class="btn btn-primary">+ Yeni Bölüm</button>
      </div>

      ${chapters.length === 0 ? `
        <div class="empty-state">
          <h2>Henüz bölüm yok</h2>
          <p>İlk bölümü yazmaya başlamak için yukarıdaki butona tıkla.</p>
        </div>
      ` : `
        <ul id="chapters-list" class="chapters-list">
          ${chapters.map(c => chapterItem(c, book.id)).join('')}
        </ul>
      `}
    </div>
  `;

  // Yeni bölüm butonu
  document.getElementById('new-chapter-btn').addEventListener('click', async () => {
    const nextNumber = chapters.length + 1;
    const newChapter = await chaptersApi.create(book.id, {
      title: `Bölüm ${nextNumber}`,
      content: '',
    });
    navigate(`/books/${book.id}/chapters/${newChapter.id}`);
  });

  // Bölüm listesine event'ler
  const listEl = document.getElementById('chapters-list');
  if (listEl) {
    // Sürükle-bırak
    Sortable.create(listEl, {
      handle: '.chapter-drag-handle',
      animation: 200,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      onEnd: async () => {
        // Yeni sıraya göre her bölümün chapter_order'ını güncelle
        const items = listEl.querySelectorAll('.chapter-item');
        const updates = Array.from(items).map((el, idx) => ({
          id: el.dataset.chapterId,
          order: idx + 1,
        }));

        // Her bölümü tek tek güncelle (önce mevcut veriyi çek, sonra order'ı değiştir)
        for (const u of updates) {
          const ch = await chaptersApi.get(book.id, u.id);
          await chaptersApi.update(book.id, u.id, {
            title: ch.title,
            content: ch.content,
            chapter_order: u.order,
            notes: ch.notes,
          });
        }

        // Yeniden render et (numaraları yenilemek için)
        renderBookDetail({ params, app });
      },
    });

    // Tıklama → editöre git
    listEl.querySelectorAll('.chapter-item').forEach(el => {
      el.addEventListener('click', (e) => {
        // Aksiyon butonlarına ya da sürükleme tutamağına tıklarsa açma
        if (e.target.closest('.chapter-actions, .chapter-drag-handle')) return;
        const chId = el.dataset.chapterId;
        navigate(`/books/${book.id}/chapters/${chId}`);
      });
    });

    // Sil butonları
    listEl.querySelectorAll('[data-delete-chapter]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const chId = btn.dataset.deleteChapter;
        if (confirm('Bu bölümü silmek istediğine emin misin?')) {
          await chaptersApi.remove(book.id, chId);
          renderBookDetail({ params, app });
          toast.success('Bölüm silindi');
        }
      });
    });
  }
}

function chapterItem(chapter, bookId) {
  const wordsText = chapter.word_count > 0
    ? `${chapter.word_count} kelime`
    : 'Henüz yazılmadı';

  return `
    <li class="chapter-item" data-chapter-id="${chapter.id}">
      <span class="chapter-drag-handle" title="Sürükle">⋮⋮</span>
      <span class="chapter-number">${chapter.chapter_order}</span>
      <div class="chapter-info">
        <div class="chapter-title">${escapeHtml(chapter.title)}</div>
        <div class="chapter-meta">${wordsText}</div>
      </div>
      <div class="chapter-actions">
        <a href="#/books/${bookId}/chapters/${chapter.id}/read" class="btn btn-secondary btn-sm" title="Oku">
          Oku
        </a>
        <button class="btn btn-danger btn-sm" data-delete-chapter="${chapter.id}" title="Sil">
          Sil
        </button>
      </div>
    </li>
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