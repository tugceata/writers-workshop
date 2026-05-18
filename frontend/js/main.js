import { initRouter, registerRoute, navigate } from './router.js';
import { isLoggedIn, getUser, clearSession } from './auth.js';
import { renderProfile } from './views/profileView.js';
import { renderHome } from './views/homeView.js';
import { renderBooksList } from './views/booksView.js';
import { renderBookForm } from './views/bookFormView.js';
import { renderBookDetail } from './views/bookDetailView.js';
import { renderChapterEditor } from './views/chapterEditorView.js';
import { renderReadingLog } from './views/readingLogView.js';
import { renderReadingLogForm } from './views/readingLogFormView.js';
import { renderReadingLogDetail } from './views/readingLogDetailView.js';
import { renderWelcome } from './views/welcomeView.js';
import { renderLogin } from './views/loginView.js';
import { renderRegister } from './views/registerView.js';

// Auth gerektirmeyen sayfalar
const PUBLIC_ROUTES = ['/welcome', '/login', '/register'];

// Auth wrapper: gerekirse welcome'a yönlendir
function protect(handler) {
  return (ctx) => {
    if (!isLoggedIn()) {
      navigate('/welcome');
      return;
    }
    return handler(ctx);
  };
}

// Public wrapper: zaten girişli ise ana sayfaya yönlendir
function publicOnly(handler) {
  return (ctx) => {
    if (isLoggedIn()) {
      navigate('/');
      return;
    }
    return handler(ctx);
  };
}

// Public route'lar
registerRoute('/welcome',  publicOnly(renderWelcome));
registerRoute('/login',    publicOnly(renderLogin));
registerRoute('/register', publicOnly(renderRegister));

// Korumalı route'lar
registerRoute('/',                                  protect(renderHome));
registerRoute('/books',                             protect(renderBooksList));
registerRoute('/books/new',                         protect(renderBookForm));
registerRoute('/books/:id/edit',                    protect(renderBookForm));
registerRoute('/books/:bookId/chapters/:chapterId', protect(renderChapterEditor));
registerRoute('/books/:id',                         protect(renderBookDetail));
registerRoute('/profile',                           protect(renderProfile));
registerRoute('/reading-log',                       protect(renderReadingLog));
registerRoute('/reading-log/new',                   protect(renderReadingLogForm));
registerRoute('/reading-log/:id/edit',              protect(renderReadingLogForm));
registerRoute('/reading-log/:id',                   protect(renderReadingLogDetail));

function renderTopbar() {
  const userArea = document.getElementById('topbar-user-area');
  const subnav = document.getElementById('subnav-links');
  if (!userArea || !subnav) return;

  const user = getUser();
  const currentPath = window.location.hash.slice(1) || '/';

  if (user) {
    // Sağ üst: kullanıcı bilgisi
    userArea.innerHTML = `
      <div class="topbar-user">
      <a href="#/profile" class="topbar-username">${user.username ? escapeHtml(user.username) : 'Profil'}</a>
        <button class="topbar-logout" id="logout-btn">Çıkış</button>
      </div>
    `;

    // Alt menü: sayfa navigasyonu
    subnav.innerHTML = `
      <a href="#/books" class="subnav-link ${isActive(currentPath, '/books') ? 'active' : ''}">Kitaplarım</a>
      <a href="#/reading-log" class="subnav-link ${isActive(currentPath, '/reading-log') ? 'active' : ''}">Kütüphanem</a>
    `;

    document.getElementById('logout-btn').addEventListener('click', () => {
      clearSession();
      navigate('/welcome');
      renderTopbar();
    });
  } else {
    userArea.innerHTML = '';
    subnav.innerHTML = '';
  }
}

function isActive(currentPath, targetPath) {
  // /books, /books/1, /books/new → tümü "Kitaplarım"ı aktif eder
  if (targetPath === '/books') return currentPath === '/books' || currentPath.startsWith('/books/');
  if (targetPath === '/reading-log') return currentPath === '/reading-log' || currentPath.startsWith('/reading-log/');
  return currentPath === targetPath;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[c]));
}

// Her hash değişiminde topbar'ı da güncelle
window.addEventListener('hashchange', renderTopbar);

// Sayfa açıldığında
const app = document.getElementById('app');
initRouter(app);

// DOM tamamen hazır olunca topbar'ı render et
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderTopbar);
} else {
  renderTopbar();
}

// Welcome sayfasında topbar'ı tamamen sakla
function toggleTopbarVisibility() {
  const topbar = document.querySelector('.topbar');
  const subnav = document.querySelector('.subnav');
  const path = window.location.hash.slice(1) || '/';
  const hideAll = PUBLIC_ROUTES.includes(path) && !isLoggedIn();

  if (topbar) topbar.style.display = hideAll ? 'none' : '';
  if (subnav) subnav.style.display = hideAll ? 'none' : '';
}

window.addEventListener('hashchange', toggleTopbarVisibility);
window.addEventListener('load', toggleTopbarVisibility);
toggleTopbarVisibility();