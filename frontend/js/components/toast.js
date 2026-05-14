/**
 * Toast bildirim sistemi.
 * Kullanım:
 *   toast.success('Kaydedildi');
 *   toast.error('Hata oluştu');
 */

let container = null;

function ensureContainer() {
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

function show(message, type = 'success', duration = 2000) {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : '⚠'}</span>
    <span>${escapeHtml(message)}</span>
  `;

  ensureContainer().appendChild(el);

  setTimeout(() => {
    el.classList.add('fade-out');
    setTimeout(() => el.remove(), 300);
  }, duration);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export const toast = {
  success: (msg, dur) => show(msg, 'success', dur),
  error:   (msg, dur) => show(msg, 'error', dur ?? 3500),
};