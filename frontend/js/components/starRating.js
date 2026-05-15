/**
 * Yıldız puanlama bileşeni.
 * Mod 1: interaktif (form için) — tıklanabilir yıldızlar
 * Mod 2: salt-okunur (listede gösterim) — sadece dolu/boş yıldızlar
 *
 * Kullanım:
 *   const stars = new StarRating({ value: 4, readonly: false, onChange: v => ... });
 *   container.appendChild(stars.element);
 */
export class StarRating {
  constructor({ value = 0, readonly = false, size = 'md', onChange = () => {} } = {}) {
    this.value = value;
    this.readonly = readonly;
    this.size = size;
    this.onChange = onChange;
    this.hover = 0;
    this.element = this.render();
    if (!readonly) this.bindEvents();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.className = `star-rating star-rating-${this.size} ${this.readonly ? 'readonly' : ''}`;
    wrapper.innerHTML = `
      <div class="stars">
        ${[1, 2, 3, 4, 5].map(n => `
          <button type="button" class="star" data-value="${n}" ${this.readonly ? 'disabled' : ''}>
            <span class="star-icon">★</span>
          </button>
        `).join('')}
      </div>
      ${!this.readonly ? `<div class="star-label" id="star-label-${this.uniqueId()}"></div>` : ''}
    `;
    this.updateVisual(wrapper);
    return wrapper;
  }

  uniqueId() {
    if (!this._id) this._id = Math.random().toString(36).slice(2, 8);
    return this._id;
  }

  bindEvents() {
    const stars = this.element.querySelectorAll('.star');
    stars.forEach(star => {
      const n = parseInt(star.dataset.value, 10);

      star.addEventListener('mouseenter', () => {
        this.hover = n;
        this.updateVisual();
      });

      star.addEventListener('mouseleave', () => {
        this.hover = 0;
        this.updateVisual();
      });

      star.addEventListener('click', () => {
        // Aynı yıldıza tekrar tıklarsa sıfırla (puanı kaldır)
        this.value = this.value === n ? 0 : n;
        this.onChange(this.value);
        this.updateVisual();
      });
    });
  }

  updateVisual(root = this.element) {
    const display = this.hover || this.value;
    root.querySelectorAll('.star').forEach(star => {
      const n = parseInt(star.dataset.value, 10);
      star.classList.toggle('filled', n <= display);
    });
    const label = root.querySelector(`#star-label-${this._id || this.uniqueId()}`);
    if (label) {
      label.textContent = this.getLabel(this.hover || this.value);
    }
  }

  getLabel(value) {
    const labels = {
      0: 'Henüz puan verilmedi',
      1: 'Kötü',
      2: 'Vasat',
      3: 'Fena değil',
      4: 'İyi',
      5: 'Mükemmel',
    };
    return labels[value] || '';
  }

  getValue() {
    return this.value;
  }
}