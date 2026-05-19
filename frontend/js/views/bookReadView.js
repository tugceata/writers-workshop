import { booksApi, chaptersApi } from '../api.js';

const WORDS_PER_PAGE = 280;
const READ_SPEED_WPM = 200;

export async function renderBookRead({ params, app }) {
  const { id } = params;

  const [book, chapters] = await Promise.all([
    booksApi.get(id),
    chaptersApi.list(id),
  ]);

  // Bölümleri sayfa sayfa böl
  const pages = paginateBook(book, chapters);

  if (pages.length === 0) {
    app.innerHTML = `
      <div class="page-header">
        <h1>${escapeHtml(book.title)}</h1>
        <a href="#/books/${id}" class="btn btn-secondary">← Geri</a>
      </div>
      <div class="empty-state">
        <h2>Henüz okunacak içerik yok</h2>
        <p>Bu kitapta hiç bölüm bulunmuyor.</p>
      </div>
    `;
    return;
  }

  let currentPage = 0;

  function render() {
    const page = pages[currentPage];
    const progress = ((currentPage + 1) / pages.length) * 100;
    const totalWords = pages.reduce((sum, p) => sum + (p.wordCount || 0), 0);
    const readingMinutes = Math.max(1, Math.round(totalWords / READ_SPEED_WPM));

    app.innerHTML = `
      <div class="read-progress-track">
        <div class="read-progress-bar" style="width: ${progress}%"></div>
      </div>

      <div class="book-read-page">
        <div class="book-read-header">
          <a href="#/books/${id}" class="read-back">← ${escapeHtml(book.title)}</a>
          <div class="book-read-meta">
            Sayfa ${currentPage + 1} / ${pages.length} · ${readingMinutes} dk
          </div>
        </div>

        <div class="book-page-wrapper">
          <button class="book-page-nav book-page-nav-left ${currentPage === 0 ? 'disabled' : ''}" id="prev-btn" aria-label="Önceki sayfa">
            ‹
          </button>

          <article class="book-page" id="book-page">
            ${renderPage(page)}
          </article>

          <button class="book-page-nav book-page-nav-right ${currentPage === pages.length - 1 ? 'disabled' : ''}" id="next-btn" aria-label="Sonraki sayfa">
            ›
          </button>
        </div>

        <div class="book-read-footer">
          <span class="book-page-indicator">${currentPage + 1} / ${pages.length}</span>
        </div>
      </div>
    `;

    const pageEl = document.getElementById('book-page');
    pageEl.classList.add('page-enter');
    requestAnimationFrame(() => {
      pageEl.classList.add('page-enter-active');
    });

    bindEvents();
  }

  function bindEvents() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (prevBtn) {
      prevBtn.onclick = () => goToPage(currentPage - 1);
    }
    if (nextBtn) {
      nextBtn.onclick = () => goToPage(currentPage + 1);
    }
  }

  function goToPage(idx) {
    if (idx < 0 || idx >= pages.length) return;
    const direction = idx > currentPage ? 'next' : 'prev';
    currentPage = idx;

    const pageEl = document.getElementById('book-page');
    if (pageEl) {
      pageEl.classList.add(direction === 'next' ? 'page-exit-left' : 'page-exit-right');
      setTimeout(() => render(), 200);
    } else {
      render();
    }
  }

  // Klavye kısayolları
  function handleKeyboard(e) {
    if (e.key === 'ArrowLeft') goToPage(currentPage - 1);
    if (e.key === 'ArrowRight') goToPage(currentPage + 1);
  }
  window.addEventListener('keydown', handleKeyboard);

  render();
}

// ═══════════════════════════════════════════════
// SAYFA BÖLME MANTIĞI
// ═══════════════════════════════════════════════

function paginateBook(book, chapters) {
  const pages = [];

  // İlk sayfa: kitap kapağı
  pages.push({
    type: 'cover',
    book: book,
  });

  // Her bölüm için: önce kapak sayfası, sonra içerik sayfaları
  for (const chapter of chapters) {
    if (!chapter.content || chapter.content.trim() === '') continue;

    // Bölüm kapak sayfası
    pages.push({
      type: 'chapter-title',
      chapter: chapter,
      wordCount: 0,
    });

    // İçerik HTML'i parse et, paragrafları al
    const paragraphs = splitIntoParagraphs(chapter.content);
    const chunks = chunkParagraphs(paragraphs, WORDS_PER_PAGE);

    chunks.forEach((chunk, idx) => {
      pages.push({
        type: 'content',
        chapter: chapter,
        html: chunk.html,
        wordCount: chunk.wordCount,
        pageNumber: idx + 1,
        totalPages: chunks.length,
      });
    });
  }

  return pages;
}

function splitIntoParagraphs(html) {
  // HTML'i geçici bir DOM elemanına koy
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Tüm üst seviye blok elemanlarını topla
  const blocks = [];
  temp.childNodes.forEach(node => {
    if (node.nodeType === 1) { // element
      blocks.push(node.outerHTML);
    } else if (node.nodeType === 3 && node.textContent.trim()) { // text
      blocks.push(`<p>${node.textContent}</p>`);
    }
  });

  if (blocks.length === 0 && temp.textContent.trim()) {
    // Tek satırlık metin varsa
    blocks.push(`<p>${temp.textContent}</p>`);
  }

  return blocks;
}

function chunkParagraphs(paragraphs, wordsPerPage) {
  const chunks = [];
  let currentChunk = { html: '', wordCount: 0 };

  for (const p of paragraphs) {
    const words = countWords(p);

    if (currentChunk.wordCount + words > wordsPerPage && currentChunk.html) {
      // Mevcut chunk dolu, kaydet
      chunks.push(currentChunk);
      currentChunk = { html: '', wordCount: 0 };
    }

    currentChunk.html += p;
    currentChunk.wordCount += words;
  }

  if (currentChunk.html) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function countWords(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const text = temp.textContent || '';
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

// ═══════════════════════════════════════════════
// SAYFA RENDER
// ═══════════════════════════════════════════════

function renderPage(page) {
  if (page.type === 'cover') {
    return `
      <div class="book-cover">
        <div class="book-cover-deco">✿</div>
        <h1 class="book-cover-title">${escapeHtml(page.book.title)}</h1>
        ${page.book.tags && page.book.tags.length > 0 ? `
          <div class="book-cover-tags">
            ${page.book.tags.map(t => escapeHtml(t.name)).join(' · ')}
          </div>
        ` : ''}
        <div class="book-cover-hint">Sayfayı çevirmek için → tuşuna bas</div>
      </div>
    `;
  }

  if (page.type === 'chapter-title') {
    const wc = page.chapter.word_count || 0;
    const minutes = Math.max(1, Math.round(wc / READ_SPEED_WPM));
    return `
      <div class="book-chapter-title">
        <div class="chapter-number-label">Bölüm ${page.chapter.chapter_order}</div>
        <h2 class="chapter-title-text">${escapeHtml(page.chapter.title)}</h2>
        <div class="chapter-info-line"></div>
        <div class="chapter-info-text">${wc.toLocaleString('tr-TR')} kelime · ${minutes} dakika</div>
      </div>
    `;
  }

  // Content page
  return `
    <div class="book-content-page">
      <div class="book-content-chapter-label">${escapeHtml(page.chapter.title)}</div>
      <div class="book-content-body">
        ${page.html}
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