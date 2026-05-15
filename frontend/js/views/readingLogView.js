import { readingLogApi } from '../api.js';
import { navigate } from '../router.js';
import { toast } from '../components/toast.js';

export async function renderReadingLog({ app }) {
  const [entries, stats] = await Promise.all([
    readingLogApi.list(),
    readingLogApi.stats(),
  ]);

  app.innerHTML = `
    <div class="page-header">
      <h1>Okuma Günlüğü</h1>
      <a href="#/reading-log/new" class="btn btn-primary">+ Yeni Okuma</a>
    </div>

    ${entries.length > 0 ? `
      <div class="reading-stats-bar">
        <div class="reading-stat">
          <div class="reading-stat-value">${stats.total}</div>
          <div class="reading-stat-label">Toplam Kitap</div>
        </div>
        <div class="reading-stat">
          <div class="reading-stat-value">${stats.averageRating}</div>
          <div class="reading-stat-label">Ortalama Puan</div>
        </div>
        ${Object.keys(stats.byGenre).length > 0 ? `
          <div class="reading-stat">
            <div class="reading-stat-value">${Object.keys(stats.byGenre).length}</div>
            <div class="reading-stat-label">Farklı Tür</div>
          </div>
        ` : ''}
      </div>
    ` : ''}

    ${entries.length === 0 ? `
      <div class="empty-state">
        <h2>Henüz okuma kaydı yok</h2>
        <p>Okuduğun ilk kitabı eklemek için yukarıdaki butona tıkla.</p>
      </div>
    ` : `
      <div class="grid">
        ${entries.map(e => readingCard(e)).join('')}
      </div>
    `}
  `;

  app.querySelectorAll('.reading-card').forEach(card => {
    card.addEventListener('click', () => {
      navigate(`/reading-log/${card.dataset.id}`);
    });
  });
}

function readingCard(entry) {
  const ratingClass = entry.rating ? `has-rating-${entry.rating}` : '';
  const stars = renderStars(entry.rating || 0);
  const dateText = entry.finished_date
    ? new Date(entry.finished_date).toLocaleDateString('tr-TR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  return `
    <div class="reading-card ${ratingClass}" data-id="${entry.id}">
      <div class="reading-card-title">${escapeHtml(entry.title)}</div>
      ${entry.author ? `
        <div class="reading-card-author">${escapeHtml(entry.author)}</div>
      ` : ''}
      <div class="star-rating star-rating-sm readonly">
        <div class="stars">${stars}</div>
      </div>
      ${entry.review ? `
        <div class="reading-card-review">${escapeHtml(entry.review)}</div>
      ` : ''}
      <div class="reading-card-meta">
        ${entry.genre ? `<span class="badge">${escapeHtml(entry.genre)}</span>` : '<span></span>'}
        ${dateText ? `<span>${dateText}</span>` : ''}
      </div>
    </div>
  `;
}

function renderStars(value) {
  return [1, 2, 3, 4, 5].map(n => `
    <span class="star ${n <= value ? 'filled' : ''}">
      <span class="star-icon">★</span>
    </span>
  `).join('');
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