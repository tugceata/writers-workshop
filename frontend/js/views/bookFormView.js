import { booksApi, tagsApi } from '../api.js';
import { navigate } from '../router.js';
import { TagInput } from '../components/tagInput.js';

export async function renderBookForm({ app, params }) {
  const isEdit = !!params?.id;
  const allTags = await tagsApi.list();

  // Düzenleme modunda mevcut kitabı çek
  let book = null;
  if (isEdit) {
    book = await booksApi.get(params.id);
  }

  const initialTitle       = book?.title || '';
  const initialDescription = book?.description || '';
  const initialStatus      = book?.status || 'draft';
  const initialTagIds      = book?.tags?.map(t => t.id) || [];

  app.innerHTML = `
    <div class="page-header">
      <h1>${isEdit ? 'Kitabı Düzenle' : 'Yeni Kitap'}</h1>
      <a href="#/books" class="btn btn-secondary">İptal</a>
    </div>

    <form id="book-form" class="form">
      <div id="form-alert"></div>

      <div class="form-group">
        <div class="form-label-row">
          <label class="form-label" for="title">Başlık *</label>
          <span class="form-counter" id="title-counter">0/200</span>
        </div>
        <input
          type="text"
          id="title"
          name="title"
          class="form-input"
          required
          maxlength="200"
          value="${escapeAttr(initialTitle)}"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Tür (en fazla 3 etiket)</label>
        <div id="tag-input-container"></div>
      </div>

      <div class="form-group">
        <div class="form-label-row">
          <label class="form-label" for="description">Açıklama</label>
          <span class="form-counter" id="description-counter">0/500</span>
        </div>
        <textarea
          id="description"
          name="description"
          class="form-textarea"
          maxlength="500"
          placeholder="Kitabının ne hakkında olduğunu kısaca anlat..."
        >${escapeText(initialDescription)}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label" for="status">Durum</label>
        <select id="status" name="status" class="form-select">
          <option value="draft" ${initialStatus === 'draft' ? 'selected' : ''}>Taslak</option>
          <option value="completed" ${initialStatus === 'completed' ? 'selected' : ''}>Tamamlandı</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">
          ${isEdit ? 'Değişiklikleri Kaydet' : 'Kitabı Oluştur'}
        </button>
        <a href="#/books" class="btn btn-secondary">İptal</a>
      </div>
    </form>
  `;

  // Karakter sayaçları
  setupCounter('title', 'title-counter', 200);
  setupCounter('description', 'description-counter', 500);

  // Tag input
  const tagInput = new TagInput({
    allTags,
    selectedIds: initialTagIds,
    maxCount: 3,
    onChange: () => {},
  });
  document.getElementById('tag-input-container').appendChild(tagInput.element);

  // Form submit
  const form = document.getElementById('book-form');
  const alertBox = document.getElementById('form-alert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    Object.keys(data).forEach(k => {
      if (data[k] === '') data[k] = null;
    });

    data.tag_ids = tagInput.getSelectedIds();

    try {
      let saved;
      if (isEdit) {
        saved = await booksApi.update(params.id, data);
      } else {
        saved = await booksApi.create(data);
      }
      navigate(`/books/${saved.id}`);
    } catch (err) {
      alertBox.innerHTML = `
        <div class="alert alert-error">
          <strong>Hata:</strong> ${err.message}
          ${err.details ? `<ul>${err.details.map(d => `<li>${d}</li>`).join('')}</ul>` : ''}
        </div>
      `;
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
  return str.replace(/"/g, '&quot;');
}

function escapeText(str) {
  if (!str) return '';
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}