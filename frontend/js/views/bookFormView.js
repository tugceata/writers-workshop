import { booksApi, tagsApi } from '../api.js';
import { navigate } from '../router.js';
import { TagInput } from '../components/tagInput.js';

export async function renderBookForm({ app }) {
  // Tüm tag'leri önceden çek
  const allTags = await tagsApi.list();

  app.innerHTML = `
    <div class="page-header">
      <h1>Yeni Kitap</h1>
      <a href="#/books" class="btn btn-secondary">İptal</a>
    </div>

    <form id="book-form" class="form">
      <div id="form-alert"></div>

      <div class="form-group">
        <label class="form-label" for="title">Başlık *</label>
        <input
          type="text"
          id="title"
          name="title"
          class="form-input"
          required
          maxlength="200"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Tür (en fazla 3 etiket)</label>
        <div id="tag-input-container"></div>
      </div>

      <div class="form-group">
        <label class="form-label" for="description">Açıklama</label>
        <textarea
          id="description"
          name="description"
          class="form-textarea"
          placeholder="Kitabının ne hakkında olduğunu kısaca anlat..."
        ></textarea>
      </div>

      <div class="form-group">
        <label class="form-label" for="goals">Hedefler</label>
        <textarea
          id="goals"
          name="goals"
          class="form-textarea"
          placeholder="örn. 80000 kelime, 25 bölüm"
        ></textarea>
      </div>

      <div class="form-group">
        <label class="form-label" for="status">Durum</label>
        <select id="status" name="status" class="form-select">
          <option value="draft">Taslak</option>
          <option value="active" selected>Aktif</option>
          <option value="paused">Beklemede</option>
          <option value="completed">Tamamlandı</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Kitabı Oluştur</button>
        <a href="#/books" class="btn btn-secondary">İptal</a>
      </div>
    </form>
  `;

  // Tag input
  let selectedTagIds = [];
  const tagInput = new TagInput({
    allTags,
    selectedIds: [],
    maxCount: 3,
    onChange: (ids) => { selectedTagIds = ids; },
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

    // Tag'leri ekle
    data.tag_ids = tagInput.getSelectedIds();
    // genre alanını çıkar (artık tag kullanıyoruz)
    delete data.genre;

    try {
      const newBook = await booksApi.create(data);
      navigate(`/books/${newBook.id}`);
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