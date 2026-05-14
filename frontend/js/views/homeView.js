import { booksApi, readingLogApi } from '../api.js';

export async function renderHome({ app }) {
  const [books, stats] = await Promise.all([
    booksApi.list(),
    readingLogApi.stats(),
  ]);

  app.innerHTML = `
    <div class="page-header">
      <h1>Merhaba 🌸</h1>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-title">Aktif Kitaplar</div>
        <div style="font-size: 36px; font-weight: 700; color: var(--pink-600);">
          ${books.filter(b => b.status === 'active').length}
        </div>
        <div class="card-meta">Toplam ${books.length} kitap projesi</div>
        <div class="card-actions">
          <a href="#/books" class="btn btn-primary btn-sm">Kitaplarım</a>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Okuduğum Kitaplar</div>
        <div style="font-size: 36px; font-weight: 700; color: var(--pink-600);">
          ${stats.total}
        </div>
        <div class="card-meta">
          Ortalama puan: ${stats.averageRating} / 5
        </div>
        <div class="card-actions">
          <a href="#/reading-log" class="btn btn-primary btn-sm">Okuma Günlüğü</a>
        </div>
      </div>
    </div>
  `;
}