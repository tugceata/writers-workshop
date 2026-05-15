import { readingLogApi, tagsApi } from '../api.js';
import { navigate } from '../router.js';
import { StarRating } from '../components/starRating.js';
import { TagInput } from '../components/tagInput.js';
import { toast } from '../components/toast.js';

export async function renderReadingLogForm({ app, params }) {
  const isEdit = !!params?.id;

  // Tüm tag'leri ve mevcut kaydı paralel çek
  const [allTags, entry] = await Promise.all([
    tagsApi.list(),
    isEdit ? readingLogApi.get(params.id) : Promise.resolve(null),
  ]);

  const initial = {
    title:         entry?.title || '',
    author:        entry?.author || '',
    genre:         entry?.genre || '',
    rating:        entry?.rating || 0,
    review:        entry?.review || '',
    started_date:  entry?.started_date ? entry.started_date.split('T')[0] : '',
    finished_date: entry?.finished_date ? entry.finished_date.split('T')[0] : '',
  };

  app.innerHTML = `
    <div class="page-header">
      <h1>${isEdit ? 'Okumayı Düzenle' : 'Yeni Okuma'}</h1>
      <a href="#/reading-log" class="btn btn-secondary">İptal</a>
    </div>

    <form id="reading-form" class="form">
      <div id="form-alert"></div>

      <div class="form-group">
        <div class="form-label-row">
          <label class="form-label" for="title">Kitap Başlığı *</label>
          <span class="form-counter" id="title-counter">0/200</span>
        </div>
        <input
          type="text"
          id="title"
          name="title"
          class="form-input"
          required
          maxlength="200"
          value="${escapeAttr(initial.title)}"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="author">Yazar</label>
        <input
          type="text"
          id="author"
          name="author"
          class="form-input"
          maxlength="150"
          value="${escapeAttr(initial.author)}"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Tür (en fazla 3 etiket)</label>
        <div id="tag-input-container"></div>
      </div>

      <div class="form-group">
        <label class="form-label">Puanın *</label>
        <div id="star-container"></div>
      </div>

      <div class="form-group">
        <div class="form-label-row">
          <label class="form-label" for="review">Yorumun</label>
          <span class="form-counter" id="review-counter">0/1000</span>
        </div>
        <textarea
          id="review"
          name="review"
          class="form-textarea"
          rows="5"
          maxlength="1000"
          placeholder="Kitap hakkında ne düşünüyorsun? Hangi kısmı sevdin, ne hissettin..."
        >${escapeText(initial.review)}</textarea>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div class="form-group">
          <label class="form-label" for="started_date">Başlangıç Tarihi</label>
          <input
            type="date"
            id="started_date"
            name="started_date"
            class="form-input"
            value="${initial.started_date}"
          />
        </div>
        <div class="form-group">
          <label class="form-label" for="finished_date">Bitiş Tarihi</label>
          <input
            type="date"
            id="finished_date"
            name="finished_date"
            class="form-input"
            value="${initial.finished_date}"
          />
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">
          ${isEdit ? 'Değişiklikleri Kaydet' : 'Kaydet'}
        </button>
        <a href="#/reading-log" class="btn btn-secondary">İptal</a>
      </div>
    </form>
  `;

  // Karakter sayaçları
  setupCounter('title', 'title-counter', 200);
  setupCounter('review', 'review-counter', 1000);

  // Yıldız puanlama
  let currentRating = initial.rating;
  const starRating = new StarRating({
    value: initial.rating,
    size: 'lg',
    onChange: (v) => { currentRating = v; },
  });
  document.getElementById('star-container').appendChild(starRating.element);

  // Tag input (kitap formundaki gibi)
  const tagInput = new TagInput({
    allTags,
    selectedIds: [],
    maxCount: 3,
    onChange: () => {},
  });
  document.getElementById('tag-input-container').appendChild(tagInput.element);

  // Form gönderimi
  const form = document.getElementById('reading-form');
  const alertBox = document.getElementById('form-alert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    Object.keys(data).forEach(k => {
      if (data[k] === '') data[k] = null;
    });

    // Puan zorunluluk kontrolü (frontend)
    if (!currentRating || currentRating < 1) {
      alertBox.innerHTML = `
        <div class="alert alert-error">
          <strong>Hata:</strong> Lütfen bir puan ver (1-5 yıldız arası).
        </div>
      `;
      // Sayfayı yukarı kaydır
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    data.rating = currentRating;

    // Tag'leri tür olarak ekle (virgülle birleştirip genre alanına yaz)
    const selectedTags = tagInput.getSelectedIds()
      .map(id => allTags.find(t => t.id === id))
      .filter(Boolean)
      .map(t => t.name);
    data.genre = selectedTags.length > 0 ? selectedTags.join(', ') : null;

    try {
      let saved;
      if (isEdit) {
        saved = await readingLogApi.update(params.id, data);
        toast.success('Güncellendi');
      } else {
        saved = await readingLogApi.create(data);
        toast.success('Okuma eklendi');
      }
      navigate(`/reading-log/${saved.id}`);
    } catch (err) {
      alertBox.innerHTML = `
        <div class="alert alert-error">
          <strong>Hata:</strong> ${err.message}
          ${err.details ? `<ul>${err.details.map(d => `<li>${d}</li>`).join('')}</ul>` : ''}
        </div>
      `;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

function setupCounter(inputId, counterId, max) {
  const input = document.getElementById(inputId);
  const counter = document.getElementById(counterId);
  const update = () => {
    const len = input.value.length;
    counter.textContent = `${len}/${max}`;
    if (len > max) counter.classList.add('over-limit');
    else counter.classList.remove('over-limit');
  };
  input.addEventListener('input', update);
  update();
}

function escapeAttr(str) {
  if (!str) return '';
  return String(str).replace(/"/g, '&quot;');
}

function escapeText(str) {
  if (!str) return '';
  return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;');
}