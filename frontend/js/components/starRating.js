/**
 * Yıldız puanlama bileşeni.
 * Mod 1: interaktif (form için) — tıklanabilir yıldızlar
 * Mod 2: salt-okunur (listede gösterim) — sadece dolu/boş yıldızlar
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
    `;
    this.updateVisual(wrapper);
    return wrapper;
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
  }

  getValue() {
    return this.value;
  }
}