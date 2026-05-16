import { initRouter, registerRoute, navigate } from './router.js';
import { isLoggedIn, getUser, clearSession } from './auth.js';

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

registerRoute('/reading-log',                       protect(renderReadingLog));
registerRoute('/reading-log/new',                   protect(renderReadingLogForm));
registerRoute('/reading-log/:id/edit',              protect(renderReadingLogForm));
registerRoute('/reading-log/:id',                   protect(renderReadingLogDetail));

// Üst menüyü render et (giriş durumuna göre)
function renderTopbar() {
  const navEl = document.querySelector('.topbar .nav');
  if (!navEl) return;

  const user = getUser();
  if (user) {
    navEl.innerHTML = `
      <a href="#/books" class="nav-link">Kitaplarım</a>
      <a href="#/reading-log" class="nav-link">Okuma Günlüğü</a>
      <div class="topbar-user">
        ${user.username ? `<span class="topbar-username">${escapeHtml(user.username)}</span>` : ''}
        <button class="topbar-logout" id="logout-btn">Çıkış</button>
      </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', () => {
      clearSession();
      navigate('/welcome');
      renderTopbar();
    });
  } else {
    navEl.innerHTML = ''; // login değilse boş
  }
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
renderTopbar();

// Welcome sayfasında topbar'ı tamamen sakla
function toggleTopbarVisibility() {
  const topbar = document.querySelector('.topbar');
  const path = window.location.hash.slice(1) || '/';
  if (PUBLIC_ROUTES.includes(path) && !isLoggedIn()) {
    topbar.style.display = 'none';
  } else {
    topbar.style.display = '';
  }
}
window.addEventListener('hashchange', toggleTopbarVisibility);
window.addEventListener('load', toggleTopbarVisibility);
toggleTopbarVisibility();