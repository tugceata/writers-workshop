import { booksApi, readingLogApi, chaptersApi } from '../api.js';

export async function renderHome({ app }) {
  // Tüm verileri paralel çek
  const [booksResponse, readingsResponse, readingStats] = await Promise.all([
    booksApi.list(),
    readingLogApi.list(),
    readingLogApi.stats(),
  ]);
  const books = booksResponse.data || booksResponse;
  const readings = readingsResponse.data || readingsResponse;
  const totalReadings = readingStats.totalBooks ?? readingStats.total ?? 0;
  const avgRating = readingStats.averageRating ?? 0;

  const draftCount = books.filter(b => b.status === 'draft').length;
  const completedCount = books.filter(b => b.status === 'completed').length;

  // En son güncellenen kitabın son bölümünü bul (devam et)
  let continueData = null;
  let totalWords = 0;
  let totalChapters = 0;

  if (books.length > 0) {
    // Tüm kitapların bölümlerini paralel çek
    const allChaptersByBook = await Promise.all(
      books.map(b => chaptersApi.list(b.id).then(ch => ({ book: b, chapters: ch })))
    );

    // Toplam kelime ve bölüm
    allChaptersByBook.forEach(({ chapters }) => {
      totalChapters += chapters.length;
      chapters.forEach(c => totalWords += (c.word_count || 0));
    });

    // En son güncellenen bölümü bul
    let latest = null;
    allChaptersByBook.forEach(({ book, chapters }) => {
      chapters.forEach(ch => {
        if (!latest || new Date(ch.updated_at) > new Date(latest.chapter.updated_at)) {
          latest = { book, chapter: ch };
        }
      });
    });

    if (latest) {
      continueData = latest;
    }
  }

  // Son 3 okuma
  const recentReadings = readings.slice(0, 3);

  // Son 3 kitap (en yeni güncellenen)
  const recentBooks = [...books]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 3);

  // Tarih formatlama
  const fmtDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    if (diffMin < 1) return 'az önce';
    if (diffMin < 60) return `${diffMin} dakika önce`;
    if (diffHr < 24) return `${diffHr} saat önce`;
    if (diffDay < 7) return `${diffDay} gün önce`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  app.innerHTML = `
    <div class="home">
      <!-- Karşılama bandı -->
      <div class="home-hero">
       <div class="home-hero-title">${getGreeting()}</div>
        ${renderQuote()}
      </div>

      <!-- Devam Et kartı -->
      ${continueData ? `
        <a href="#/books/${continueData.book.id}/chapters/${continueData.chapter.id}" style="text-decoration: none; display: block;">
          <div class="continue-card">
            <div style="z-index: 1;">
              <div class="continue-card-label">Kaldığın yerden devam et</div>
              <div class="continue-card-book">${escapeHtml(continueData.book.title)}</div>
              <div class="continue-card-chapter">Bölüm ${continueData.chapter.chapter_order}: ${escapeHtml(continueData.chapter.title)}</div>
              <div class="continue-card-meta">
                ${continueData.chapter.word_count || 0} kelime · son düzenleme ${fmtDate(continueData.chapter.updated_at)}
              </div>
            </div>
            <div class="continue-card-arrow">→</div>
          </div>
        </a>
      ` : ''}

      <!-- İstatistikler -->
      <div class="home-stats">
        <div class="home-stat-card">
          <div class="home-stat-icon">✎</div>
          <div class="home-stat-value">${books.length}</div>
          <div class="home-stat-label">Kitap Projesi</div>
          <div class="home-stat-sub">${draftCount} taslak · ${completedCount} tamamlanmış</div>
        </div>

        <div class="home-stat-card">
          <div class="home-stat-icon">❋</div>
          <div class="home-stat-value">${totalChapters}</div>
          <div class="home-stat-label">Bölüm</div>
          <div class="home-stat-sub">Tüm kitaplar dahil</div>
        </div>

        <div class="home-stat-card">
          <div class="home-stat-icon">✿</div>
          <div class="home-stat-value">${totalWords.toLocaleString('tr-TR')}</div>
          <div class="home-stat-label">Toplam Kelime</div>
          <div class="home-stat-sub">Yazdığın tüm metin</div>
        </div>

        <div class="home-stat-card">
          <div class="home-stat-icon">★</div>
          <div class="home-stat-value">${totalReadings}</div>
          <div class="home-stat-label">Okuduğum Kitap</div>
          <div class="home-stat-sub">Ortalama ${avgRating} / 5</div>
        </div>
      </div>

      <!-- İki sütun -->
      <div class="home-grid">
        <!-- Son yazdığım kitaplar -->
        <div class="home-section">
          <div class="home-section-header">
            <div class="home-section-title">
              <span class="home-section-title-icon">✎</span>
              Son Çalışılan Kitaplar
            </div>
            <a href="#/books" class="home-section-link">Tümü →</a>
          </div>
          ${recentBooks.length === 0 ? `
            <div class="home-empty">
              Henüz kitap yok.<br>
              <a href="#/books/new">İlk kitabını oluştur →</a>
            </div>
          ` : recentBooks.map(b => `
            <a href="#/books/${b.id}" style="text-decoration: none; color: inherit;">
              <div class="home-mini-item">
                <div class="home-mini-item-info">
                  <div class="home-mini-item-title">${escapeHtml(b.title)}</div>
                  <div class="home-mini-item-sub">
                    ${b.status === 'completed' ? 'Tamamlandı' : 'Taslak'}
                    ${b.tags && b.tags.length > 0 ? ' · ' + b.tags.slice(0, 2).map(t => escapeHtml(t.name)).join(', ') : ''}
                  </div>
                </div>
                <div class="home-mini-item-meta">${fmtDate(b.updated_at)}</div>
              </div>
            </a>
          `).join('')}
        </div>

        <!-- Son okuduğum kitaplar -->
        <div class="home-section">
          <div class="home-section-header">
            <div class="home-section-title">
              <span class="home-section-title-icon">★</span>
              Son Okuduklarım
            </div>
            <a href="#/reading-log" class="home-section-link">Tümü →</a>
          </div>
          ${recentReadings.length === 0 ? `
            <div class="home-empty">
              Henüz okuma yok.<br>
              <a href="#/reading-log/new">İlk okumayı ekle →</a>
            </div>
          ` : recentReadings.map(r => `
            <a href="#/reading-log/${r.id}" style="text-decoration: none; color: inherit;">
              <div class="home-mini-item">
                <div class="home-mini-item-info">
                  <div class="home-mini-item-title">${escapeHtml(r.title)}</div>
                  <div class="home-mini-item-sub">
                    ${r.author ? escapeHtml(r.author) : 'Yazar belirtilmemiş'}
                    ${r.rating ? ' · ' + '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating) : ''}
                  </div>
                </div>
                <div class="home-mini-item-meta">${fmtDate(r.finished_date || r.created_at)}</div>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderQuote() {
  const quotes = [
    {
      text: "Why, sometimes I've believed as many as six impossible things before breakfast.",
      source: "Through the Looking-Glass",
    },
    {
      text: "If you don't know where you are going, any road will get you there.",
      source: "Alice's Adventures in Wonderland",
    },
    {
      text: "We're all mad here. I'm mad. You're mad.",
      source: "Cheshire Cat",
    },
    {
      text: "I knew who I was this morning, but I've changed a few times since then.",
      source: "Alice's Adventures in Wonderland",
    },
    {
      text: "Imagination is the only weapon in the war against reality.",
      source: "Lewis Carroll",
    },
    {
      text: "Begin at the beginning, and go on till you come to the end: then stop.",
      source: "Alice's Adventures in Wonderland",
    },
    {
      text: "It's no use going back to yesterday, because I was a different person then.",
      source: "Alice's Adventures in Wonderland",
    },
    {
      text: "Curiouser and curiouser!",
      source: "Alice's Adventures in Wonderland",
    },
    {
      text: "But I don't want to go among mad people, Alice remarked. Oh, you can't help that, said the Cat. We're all mad here.",
      source: "Alice's Adventures in Wonderland",
    },
    {
      text: "Who in the world am I? Ah, that's the great puzzle.",
      source: "Alice's Adventures in Wonderland",
    },
    {
      text: "It would be so nice if something made sense for a change.",
      source: "Alice's Adventures in Wonderland",
    },
    {
      text: "If everybody minded their own business, the world would go around a great deal faster than it does.",
      source: "The Duchess",
    },
    {
      text: "I can't go back to yesterday because I was a different person then.",
      source: "Alice's Adventures in Wonderland",
    },
    {
      text: "Take care of the sense, and the sounds will take care of themselves.",
      source: "Alice's Adventures in Wonderland",
    },
    {
      text: "Every adventure requires a first step.",
      source: "Cheshire Cat",
    },
  ];
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  return `
    <div class="home-hero-subtitle">
      "${q.text}"
      <span class="home-hero-source">— ${q.source}</span>
    </div>
  `;
}

function getGreeting() {
  const userRaw = localStorage.getItem('ww_user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  if (user && user.username) {
    return `Hoş geldin, ${escapeHtml(user.username)}`;
  }
  return 'Hoş geldin ';
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