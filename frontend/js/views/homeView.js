import { booksApi, readingLogApi } from '../api.js';

export async function renderHome({ app }) {
  const [books, stats] = await Promise.all([
    booksApi.list(),
    readingLogApi.stats(),
  ]);

  const draftCount = books.filter(b => b.status === 'draft').length;
  const completedCount = books.filter(b => b.status === 'completed').length;

  app.innerHTML = `
    <div class="page-header">
      <h1>Slm cnm 🌸</h1>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-title">Kitaplarım</div>
        <div style="font-size: 36px; font-weight: 700; color: var(--pink-600);">
          ${books.length}
        </div>
        <div class="card-meta" style="margin-top: 8px;">
          <div>Taslak Kitaplar: <strong>${draftCount}</strong></div>
          <div>Tamamlanmış Kitaplar: <strong>${completedCount}</strong></div>
        </div>
        <div class="card-actions">
          <a href="#/books" class="btn btn-primary btn-sm">Kitaplarım</a>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Kütüphanem</div>
        <div style="font-size: 36px; font-weight: 700; color: var(--pink-600);">
          ${stats.total}
        </div>
        <div class="card-meta" style="margin-top: 8px;">
          Ortalama puan: <strong>${stats.averageRating}</strong> / 5
        </div>
        <div class="card-actions">
          <a href="#/reading-log" class="btn btn-primary btn-sm">Okuma Günlüğü</a>
        </div>
      </div>
    </div>
  `;
}