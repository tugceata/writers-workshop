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
          <button id="history-btn" class="history-icon-btn" title="Sürüm geçmişi"><img src="img/noun-revise-202110.svg" alt="Geçmiş" width="24" height="24"></button>
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

    <div id="history-panel" class="history-panel hidden">
      <div class="history-panel-header">
        <h3>Sürüm Geçmişi</h3>
        <button id="history-close" class="history-close">×</button>
      </div>
      <div class="history-panel-hint">Manuel kaydettiğin sürümler burada saklanır.</div>
      <div id="history-list" class="history-list"></div>
    </div>
    <div id="history-overlay" class="history-overlay hidden"></div>
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
    saveTimer = setTimeout(() => save(false), 1000);
  }

  async function save(isManual = false) {
    try {
      const content = quill.root.innerHTML;
      const title = titleInput.value.trim() || `Bölüm ${chapter.chapter_order}`;
      const updated = await chaptersApi.update(bookId, chapterId, {
        title,
        content,
        chapter_order: chapter.chapter_order,
        notes: chapter.notes,
        createRevision: isManual,
      });
      saveStatus.textContent = `Kaydedildi · ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
      saveStatus.className = 'saved';
      wordCountEl.textContent = updated.word_count;
    } catch (err) {
      saveStatus.textContent = 'Hata: ' + err.message;
      saveStatus.className = '';
      throw err;
    }
  }

  quill.on('text-change', () => {
    updateLocalWordCount();
    scheduleSave();
  });

  titleInput.addEventListener('input', scheduleSave);

  manualSaveBtn.addEventListener('click', async () => {
    try {
      await save(true);
      toast.success('Kaydedildi');
    } catch (err) {
      toast.error('Kaydedilemedi: ' + err.message);
    }
  });

  // Klavye kısayolu (Cmd/Ctrl+S)
  function handleKeydown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      save(true)
        .then(() => toast.success('Kaydedildi'))
        .catch((err) => toast.error('Kaydedilemedi: ' + err.message));
    }
  }
  document.addEventListener('keydown', handleKeydown);

  // Editör DOM'dan kalkınca keydown listener'ını temizle (birikmeyi önle)
  const cleanupObserver = new MutationObserver(() => {
    if (!document.getElementById('quill-editor')) {
      document.removeEventListener('keydown', handleKeydown);
      cleanupObserver.disconnect();
    }
  });
  cleanupObserver.observe(app, { childList: true, subtree: true });

  // ── Sürüm geçmişi ──
  const historyBtn = document.getElementById('history-btn');
  const historyPanel = document.getElementById('history-panel');
  const historyOverlay = document.getElementById('history-overlay');
  const historyList = document.getElementById('history-list');

  function closeHistory() {
    historyPanel.classList.add('hidden');
    historyOverlay.classList.add('hidden');
  }

  async function openHistory() {
    historyPanel.classList.remove('hidden');
    historyOverlay.classList.remove('hidden');
    historyList.innerHTML = '<div class="history-loading">Yükleniyor...</div>';
    try {
      const revisions = await chaptersApi.revisions(bookId, chapterId);
      if (revisions.length === 0) {
        historyList.innerHTML = '<div class="history-empty">Henüz kayıtlı sürüm yok.<br>Kaydet butonuna bastığında sürüm oluşur.</div>';
        return;
      }
      historyList.innerHTML = revisions.map(r => `
        <div class="history-item" data-rev-id="${r.id}">
          <div class="history-item-info">
            <div class="history-item-date">${formatRevDate(r.created_at)}</div>
            <div class="history-item-meta">${r.word_count || 0} kelime · ${escapeHtml(r.title)}</div>
          </div>
          <button class="history-preview-toggle" data-toggle="${r.id}">Önizle ▾</button>
        </div>
        <div class="history-preview hidden" data-preview="${r.id}">
          <div class="history-preview-content">${r.content || '<em>Boş içerik</em>'}</div>
          <button class="btn btn-primary btn-sm" data-restore="${r.id}">Bu sürüme dön</button>
        </div>
      `).join('');

      // Önizleme aç/kapat
      historyList.querySelectorAll('[data-toggle]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.toggle;
          const preview = historyList.querySelector(`[data-preview="${id}"]`);
          const isOpen = !preview.classList.contains('hidden');
          // Önce hepsini kapat
          historyList.querySelectorAll('.history-preview').forEach(p => p.classList.add('hidden'));
          historyList.querySelectorAll('[data-toggle]').forEach(b => b.textContent = 'Önizle ▾');
          // Tıklanan kapalıysa aç
          if (!isOpen) {
            preview.classList.remove('hidden');
            btn.textContent = 'Gizle ▴';
          }
        });
      });

      // Geri yükle
      historyList.querySelectorAll('[data-restore]').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Bu sürüme dönmek istediğine emin misin? Mevcut hâlin de geçmişe kaydedilecek.')) return;
          try {
            await chaptersApi.restoreRevision(bookId, chapterId, btn.dataset.restore);
            toast.success('Sürüm geri yüklendi');
            closeHistory();
            renderChapterEditor({ params, app });
          } catch (err) {
            toast.error('Geri yüklenemedi: ' + err.message);
          }
        });
      });
    } catch (err) {
      historyList.innerHTML = '<div class="history-empty">Geçmiş yüklenemedi.</div>';
    }
  }

  historyBtn.addEventListener('click', openHistory);
  document.getElementById('history-close').addEventListener('click', closeHistory);
  historyOverlay.addEventListener('click', closeHistory);
}

function formatRevDate(d) {
  const date = new Date(d);
  return date.toLocaleString('tr-TR', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
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