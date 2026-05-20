import { readingLogApi } from '../api.js';
import { navigate } from '../router.js';
import { toast } from '../components/toast.js';

let logFilters = { search: '', min_rating: '', sort: 'created_at', order: 'desc' };

export async function renderReadingLog({ app }) {
  const stats = await readingLogApi.stats();
  const response = await readingLogApi.list(cleanFilters(logFilters));
  const entries = response.data || response;

  app.innerHTML = `
    <div class="page-header">
      <h1>Okuma Günlüğü</h1>
      <a href="#/reading-log/new" class="btn btn-primary">+ Yeni Okuma</a>
    </div>

    ${renderCharts(stats)}

    <div class="filter-bar">
      <input type="text" id="lf-search" class="filter-input" placeholder="🔍 Kitap veya yazar ara..." value="${escapeHtml(logFilters.search)}">
      <select id="lf-rating" class="filter-select">
        <option value="">Tüm puanlar</option>
        <option value="5" ${logFilters.min_rating === '5' ? 'selected' : ''}>5 yıldız</option>
        <option value="4" ${logFilters.min_rating === '4' ? 'selected' : ''}>4+ yıldız</option>
        <option value="3" ${logFilters.min_rating === '3' ? 'selected' : ''}>3+ yıldız</option>
        <option value="2" ${logFilters.min_rating === '2' ? 'selected' : ''}>2+ yıldız</option>
        <option value="1" ${logFilters.min_rating === '1' ? 'selected' : ''}>1+ yıldız</option>
      </select>
      <select id="lf-sort" class="filter-select">
        <option value="created_at-desc" ${logFilters.sort === 'created_at' && logFilters.order === 'desc' ? 'selected' : ''}>En son eklenen</option>
        <option value="finished_date-desc" ${logFilters.sort === 'finished_date' && logFilters.order === 'desc' ? 'selected' : ''}>En son bitirilen</option>
        <option value="rating-desc" ${logFilters.sort === 'rating' && logFilters.order === 'desc' ? 'selected' : ''}>En yüksek puan</option>
        <option value="rating-asc" ${logFilters.sort === 'rating' && logFilters.order === 'asc' ? 'selected' : ''}>En düşük puan</option>
        <option value="title-asc" ${logFilters.sort === 'title' && logFilters.order === 'asc' ? 'selected' : ''}>Başlık (A-Z)</option>
      </select>
    </div>

    <div id="log-container">
      ${renderLogGrid(entries)}
    </div>
  `;

  const searchEl = document.getElementById('lf-search');
  let timer;
  searchEl.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      logFilters.search = searchEl.value.trim();
      reloadLog();
    }, 350);
  });

  document.getElementById('lf-rating').addEventListener('change', (e) => {
    logFilters.min_rating = e.target.value;
    reloadLog();
  });

  document.getElementById('lf-sort').addEventListener('change', (e) => {
    const [sort, order] = e.target.value.split('-');
    logFilters.sort = sort;
    logFilters.order = order;
    reloadLog();
  });

  bindLogCards();
}

function cleanFilters(f) {
  const out = {};
  Object.entries(f).forEach(([k, v]) => { if (v !== '' && v != null) out[k] = v; });
  return out;
}

async function reloadLog() {
  const response = await readingLogApi.list(cleanFilters(logFilters));
  const entries = response.data || response;
  document.getElementById('log-container').innerHTML = renderLogGrid(entries);
  bindLogCards();
}

function renderLogGrid(entries) {
  if (entries.length === 0) {
    return `
      <div class="empty-state">
        <h2>Kayıt bulunamadı</h2>
        <p>Filtreleri değiştir ya da yeni bir okuma ekle.</p>
      </div>
    `;
  }
  return `<div class="grid">${entries.map(e => readingCard(e)).join('')}</div>`;
}

function bindLogCards() {
  document.querySelectorAll('.reading-card').forEach(card => {
    card.addEventListener('click', () => {
      navigate(`/reading-log/${card.dataset.id}`);
    });
  });
}

function renderCharts(stats) {
  return `
    <div class="charts-grid">
      ${renderRatingChart(stats)}
      ${renderGenreChart(stats)}
    </div>
  `;
}

function renderRatingChart(stats) {
  const byRating = stats.byRating || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const maxCount = Math.max(...Object.values(byRating), 1);
  const totalRated = Object.values(byRating).reduce((a, b) => a + b, 0);

  return `
    <div class="chart-card">
      <div class="chart-card-title">
        <span class="chart-card-title-icon">★</span>
        Puan Dağılımı
      </div>
      ${totalRated === 0 ? `
        <div class="chart-empty">Henüz puanlı kitap yok</div>
      ` : `
        <div class="chart-rows">
          ${[5, 4, 3, 2, 1].map(rating => {
            const count = byRating[rating];
            const widthPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return `
              <div class="chart-row">
                <div class="chart-row-label stars">${'★'.repeat(rating)}</div>
                <div class="chart-row-bar">
                  <div class="chart-row-fill rating-${rating}" style="width: ${widthPercent}%;"></div>
                  <div class="chart-tooltip">${count} kitap</div>
                </div>
                <div class="chart-row-count">${count}</div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}

function renderGenreChart(stats) {
  const byGenre = stats.byGenre || {};
  const sorted = Object.entries(byGenre).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCount = sorted.length > 0 ? Math.max(...sorted.map(([_, n]) => n)) : 1;

  return `
    <div class="chart-card">
      <div class="chart-card-title">
        <span class="chart-card-title-icon">✿</span>
        En Çok Okunan Türler
      </div>
      ${sorted.length === 0 ? `
        <div class="chart-empty">Henüz tür kaydı yok</div>
      ` : `
        <div class="chart-rows">
          ${sorted.map(([genre, count], idx) => {
            const widthPercent = (count / maxCount) * 100;
            return `
              <div class="chart-row">
                <div class="chart-row-label">${escapeHtml(genre)}</div>
                <div class="chart-row-bar">
                  <div class="chart-row-fill genre-${idx}" style="width: ${widthPercent}%;"></div>
                  <div class="chart-tooltip">${count} kitap</div>
                </div>
                <div class="chart-row-count">${count}</div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
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