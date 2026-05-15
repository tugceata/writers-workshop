import { initRouter, registerRoute } from './router.js';
import { renderHome } from './views/homeView.js';
import { renderBooksList } from './views/booksView.js';
import { renderBookForm } from './views/bookFormView.js';
import { renderBookDetail } from './views/bookDetailView.js';
import { renderChapterEditor } from './views/chapterEditorView.js';
import { renderReadingLog } from './views/readingLogView.js';
import { renderReadingLogForm } from './views/readingLogFormView.js';
import { renderReadingLogDetail } from './views/readingLogDetailView.js';

// Route'ları kaydet (sıra önemli — özel olanlar genelden önce)
registerRoute('/',                                  renderHome);

// Books
registerRoute('/books',                             renderBooksList);
registerRoute('/books/new',                         renderBookForm);
registerRoute('/books/:id/edit',                    renderBookForm);
registerRoute('/books/:bookId/chapters/:chapterId', renderChapterEditor);
registerRoute('/books/:id',                         renderBookDetail);

// Reading Log
registerRoute('/reading-log',                       renderReadingLog);
registerRoute('/reading-log/new',                   renderReadingLogForm);
registerRoute('/reading-log/:id/edit',              renderReadingLogForm);
registerRoute('/reading-log/:id',                   renderReadingLogDetail);

const app = document.getElementById('app');
initRouter(app);