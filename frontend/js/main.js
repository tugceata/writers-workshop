import { initRouter, registerRoute } from './router.js';
import { renderHome } from './views/homeView.js';
import { renderBooksList } from './views/booksView.js';
import { renderBookForm } from './views/bookFormView.js';
import { renderBookDetail } from './views/bookDetailView.js';

// Route'ları kaydet
registerRoute('/',              renderHome);
registerRoute('/books',         renderBooksList);
registerRoute('/books/new',     renderBookForm);
registerRoute('/books/:id',     renderBookDetail);

// Router'ı başlat
const app = document.getElementById('app');
initRouter(app);