import { readingLogApi } from '../api.js';
import { navigate } from '../router.js';
import { toast } from '../components/toast.js';

export async function renderReadingLogDetail({ params, app }) {
  const entry = await readingLogApi.get(params.id);

  const stars = renderStars(entry.rating || 0);
  const ratingLabels = {
    0: '', 1: 'Kötü', 2: 'Vasat', 3: 'Fena değil', 4: 'İyi', 5: 'Mükemmel',
  };

  const startedText = entry.started_date
    ? new Date(entry.started_date).toLocaleDateString('tr-TR')
    : 'Belirtilmemiş';
  const finishedText = entry.finished_date
    ? new Date(entry.finished_date).toLocaleDateString('tr-TR')
    : 'Belirtilmemiş';

  app.innerHTML = `
    <div class="page-header">
      <h1>Okuma Detayı</h1>
      <div style="display: flex; gap: 8px;">
        <a href="#/reading-log/${entry.id}/edit" class="btn btn-secondary">Düzenle</a>
        <a href="#/reading-log" class="btn btn-secondary">← Geri</a>
      </div>
    </div>

    <div class="reading-detail">
      <div class="reading-detail-title">${escapeHtml(entry.title)}</div>
      ${entry.author ? `
        <div class="reading-detail-author">${escapeHtml(entry.author)}</div>
      ` : ''}

      <div class="star-rating star-rating-lg readonly">
        <div class="stars">${stars}</div>
        ${entry.rating ? `
          <div class="star-label">${ratingLabels[entry.rating]}</div>
        ` : ''}
      </div>

      ${entry.review ? `
        <div class="reading-detail-review">${escapeHtml(entry.review)}</div>
      ` : ''}

      <div class="reading-detail-meta">
        ${entry.genre ? `
          <div class="reading-detail-meta-item">
            <div class="reading-detail-meta-label">Tür</div>
            <div class="reading-detail-meta-value">${escapeHtml(entry.genre)}</div>
          </div>
        ` : ''}
        <div class="reading-detail-meta-item">
          <div class="reading-detail-meta-label">Başlangıç</div>
          <div class="reading-detail-meta-value">${startedText}</div>
        </div>
        <div class="reading-detail-meta-item">
          <div class="reading-detail-meta-label">Bitiş</div>
          <div class="reading-detail-meta-value">${finishedText}</div>
        </div>
      </div>

      <div style="margin-top: 24px; display: flex; gap: 8px; justify-content: flex-end;">
        <button id="delete-btn" class="btn btn-danger btn-sm">Kaydı Sil</button>
      </div>
    </div>
  `;

  document.getElementById('delete-btn').addEventListener('click', async () => {
    if (confirm('Bu okuma kaydını silmek istediğine emin misin?')) {
      await readingLogApi.remove(entry.id);
      toast.success('Kayıt silindi');
      navigate('/reading-log');
    }
  });
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