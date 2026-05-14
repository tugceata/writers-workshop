/**
 * Tag autocomplete bileşeni.
 * Kullanım:
 *   const tagInput = new TagInput({
 *     allTags: [...],          // tüm tag'lerin listesi
 *     selectedIds: [1, 2],     // başlangıçta seçili olanlar
 *     maxCount: 3,
 *     onChange: (ids) => {...} // değişimde çağrılır
 *   });
 *   container.appendChild(tagInput.element);
 */
export class TagInput {
  constructor({ allTags = [], selectedIds = [], maxCount = 3, onChange = () => {} }) {
    this.allTags = allTags;
    this.selected = allTags.filter(t => selectedIds.includes(t.id));
    this.maxCount = maxCount;
    this.onChange = onChange;
    this.element = this.render();
    this.bindEvents();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'tag-input';
    wrapper.innerHTML = `
      <div class="tag-input-pills"></div>
      <div class="tag-input-search" ${this.selected.length >= this.maxCount ? 'style="display:none"' : ''}>
        <input
          type="text"
          class="tag-input-field"
          placeholder="Tür ara (örn. f → fantastik)..."
          autocomplete="off"
        />
        <div class="tag-input-dropdown" style="display:none"></div>
      </div>
      <small class="tag-input-hint">En fazla ${this.maxCount} tür seçebilirsin (${this.selected.length}/${this.maxCount})</small>
    `;
    this.refreshPills(wrapper);
    return wrapper;
  }

  refreshPills(root = this.element) {
    const pillsContainer = root.querySelector('.tag-input-pills');
    pillsContainer.innerHTML = this.selected.map(t => `
      <span class="tag-pill">
        ${this.escape(t.name)}
        <button type="button" class="tag-pill-remove" data-tag-id="${t.id}">×</button>
      </span>
    `).join('');

    // Hint güncelle
    const hint = root.querySelector('.tag-input-hint');
    hint.textContent = `En fazla ${this.maxCount} tür seçebilirsin (${this.selected.length}/${this.maxCount})`;

    // Search alanını göster/gizle
    const search = root.querySelector('.tag-input-search');
    search.style.display = this.selected.length >= this.maxCount ? 'none' : '';
  }

  bindEvents() {
    const input = this.element.querySelector('.tag-input-field');
    const dropdown = this.element.querySelector('.tag-input-dropdown');

    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      if (!query) {
        dropdown.style.display = 'none';
        return;
      }
      const matches = this.allTags
        .filter(t => !this.selected.some(s => s.id === t.id))
        .filter(t => t.name.toLowerCase().includes(query))
        .slice(0, 8);

      if (matches.length === 0) {
        dropdown.innerHTML = '<div class="tag-dropdown-empty">Sonuç yok</div>';
      } else {
        dropdown.innerHTML = matches.map(t => `
          <button type="button" class="tag-dropdown-item" data-tag-id="${t.id}">
            ${this.escape(t.name)}
          </button>
        `).join('');
      }
      dropdown.style.display = 'block';
    });

    input.addEventListener('blur', () => {
      // 200ms bekle ki tıklamayı yakalayabilsin
      setTimeout(() => dropdown.style.display = 'none', 200);
    });

    // Dropdown'dan tag seç
    this.element.addEventListener('click', (e) => {
      const item = e.target.closest('.tag-dropdown-item');
      if (item) {
        const id = parseInt(item.dataset.tagId, 10);
        const tag = this.allTags.find(t => t.id === id);
        if (tag && this.selected.length < this.maxCount) {
          this.selected.push(tag);
          this.refreshPills();
          input.value = '';
          dropdown.style.display = 'none';
          this.onChange(this.selected.map(t => t.id));
        }
      }

      // Pill'den kaldır
      const removeBtn = e.target.closest('.tag-pill-remove');
      if (removeBtn) {
        const id = parseInt(removeBtn.dataset.tagId, 10);
        this.selected = this.selected.filter(t => t.id !== id);
        this.refreshPills();
        this.onChange(this.selected.map(t => t.id));
      }
    });
  }

  getSelectedIds() {
    return this.selected.map(t => t.id);
  }

  escape(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }
}