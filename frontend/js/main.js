import { initRouter, registerRoute } from './router.js';
import { renderHome } from './views/homeView.js';
import { renderBooksList } from './views/booksView.js';
import { renderBookForm } from './views/bookFormView.js';
import { renderBookDetail } from './views/bookDetailView.js';

// Route'ları kaydet
registerRoute('/',                renderHome);
registerRoute('/books',           renderBooksList);
registerRoute('/books/new',       renderBookForm);
registerRoute('/books/:id/edit',  renderBookForm);  // YENİ
registerRoute('/books/:id',       renderBookDetail);

const app = document.getElementById('app');
initRouter(app);