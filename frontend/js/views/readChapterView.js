import { booksApi, chaptersApi } from '../api.js';
import { navigate } from '../router.js';

export async function renderReadChapter({ params, app }) {
  const { bookId, chapterId } = params;

  const [book, chapter] = await Promise.all([
    booksApi.get(bookId),
    chaptersApi.get(bookId, chapterId),
  ]);

  // Okuma süresi tahmini: ortalama yetişkin dakikada 200-250 kelime okur
  const wordCount = chapter.word_count || 0;
  const readingMinutes = Math.max(1, Math.round(wordCount / 200));

  app.innerHTML = `
    <div class="read-progress-track">
      <div class="read-progress-bar" id="read-progress-bar"></div>
    </div>

    <div class="read-page">
      <div class="read-header">
        <a href="#/books/${bookId}" class="read-back">← ${escapeHtml(book.title)}</a>
        <div class="read-actions">
          <a href="#/books/${bookId}/chapters/${chapterId}" class="btn btn-secondary btn-sm">
            ✎ Düzenle
          </a>
        </div>
      </div>

      <article class="read-article">
        <header class="read-article-header">
          <div class="read-meta">
            <span>Bölüm ${chapter.chapter_order}</span>
            <span>·</span>
            <span>${wordCount.toLocaleString('tr-TR')} kelime</span>
            <span>·</span>
            <span>${readingMinutes} dakikalık okuma</span>
          </div>
          <h1 class="read-title">${escapeHtml(chapter.title)}</h1>
        </header>

        <div class="read-content">
          ${chapter.content || '<p class="read-empty">Bu bölüm henüz boş.</p>'}
        </div>

        <footer class="read-footer">
          <div class="read-footer-line"></div>
          <div class="read-footer-text">✿ Bölüm sonu ✿</div>
        </footer>
      </article>
    </div>
  `;

  // Scroll ilerleme barı
  const progressBar = document.getElementById('read-progress-bar');

  function updateProgress() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  }

  window.addEventListener('scroll', updateProgress);
  updateProgress();

  // Sayfa kapanırken event listener'ı temizle (memory leak önle)
  // Router otomatik halleder ama temiz olalım
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