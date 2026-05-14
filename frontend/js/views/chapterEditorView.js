import { chaptersApi, booksApi } from '../api.js';
import { navigate } from '../router.js';
import { toast } from '../components/toast.js'; 

export async function renderChapterEditor({ params, app }) {
  const { bookId, chapterId } = params;

  const [book, chapter] = await Promise.all([
    booksApi.get(bookId),
    chaptersApi.get(bookId, chapterId),
  ]);

  app.innerHTML = `
    <div style="margin-bottom: 12px;">
      <a href="#/books/${bookId}" class="btn btn-secondary btn-sm">
        ← ${escapeHtml(book.title)}
      </a>
    </div>

    <div class="editor-page">
      <div class="editor-header">
        <input
          id="chapter-title-input"
          type="text"
          class="editor-title-input"
          value="${escapeAttr(chapter.title)}"
          maxlength="200"
          placeholder="Bölüm başlığı..."
        />
        <div class="editor-meta">
          <span id="save-status" class="saved">Kaydedildi</span>
        </div>
      </div>

      <div id="quill-editor"></div>

      <div class="editor-footer">
        <div class="editor-stats">
          <span>Bölüm <strong>${chapter.chapter_order}</strong></span>
          <span>Kelime: <strong id="word-count">${chapter.word_count}</strong></span>
        </div>
        <div>
          <button id="manual-save-btn" class="btn btn-primary btn-sm">Kaydet</button>
        </div>
      </div>
    </div>
  `;

  // Quill başlat
  const quill = new Quill('#quill-editor', {
    theme: 'snow',
    placeholder: 'Burada yazmaya başla...',
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote'],
        [{ align: [] }],
        ['link'],
        ['clean'],
      ],
    },
  });

  if (chapter.content) {
    quill.clipboard.dangerouslyPasteHTML(chapter.content);
  }

  const titleInput = document.getElementById('chapter-title-input');
  const saveStatus = document.getElementById('save-status');
  const wordCountEl = document.getElementById('word-count');
  const manualSaveBtn = document.getElementById('manual-save-btn');

  function updateLocalWordCount() {
    const text = quill.getText().trim();
    const words = text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;
    wordCountEl.textContent = words;
  }

  let saveTimer = null;
  function scheduleSave() {
    saveStatus.textContent = 'Kaydediliyor...';
    saveStatus.className = 'saving';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 1000);
  }

async function save() {
  try {
    const content = quill.root.innerHTML;
    const title = titleInput.value.trim() || `Bölüm ${chapter.chapter_order}`;
    const updated = await chaptersApi.update(bookId, chapterId, {
      title,
      content,
      chapter_order: chapter.chapter_order,
      notes: chapter.notes,
    });
    saveStatus.textContent = `Kaydedildi · ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
    saveStatus.className = 'saved';
    wordCountEl.textContent = updated.word_count;
  } catch (err) {
    saveStatus.textContent = 'Hata: ' + err.message;
    saveStatus.className = '';
    throw err; // butona tıklayan fonksiyon yakalasın
  }
}

  quill.on('text-change', () => {
    updateLocalWordCount();
    scheduleSave();
  });

  titleInput.addEventListener('input', scheduleSave);
manualSaveBtn.addEventListener('click', async () => {
  try {
    await save();
    toast.success('Kaydedildi');
  } catch (err) {
    toast.error('Kaydedilemedi: ' + err.message);
  }
});

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      save();
    }
  });
}

function escapeAttr(str) {
  if (!str) return '';
  return str.replace(/"/g, '&quot;');
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