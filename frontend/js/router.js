const routes = [];
let appElement = null;

export function registerRoute(pattern, handler) {
  const paramNames = [];
  const regexPattern = pattern.replace(/:(\w+)/g, (_, name) => {
    paramNames.push(name);
    return '([^/]+)';
  });
  const regex = new RegExp('^' + regexPattern + '$');
  routes.push({ regex, paramNames, handler });
}

export function navigate(path) {
  // Eğer aynı path'teysek hashchange tetiklenmez, manuel render et
  const target = path.startsWith('#') ? path : '#' + path;
  if (window.location.hash === target) {
    render();
  } else {
    window.location.hash = path;
  }
}

function parseHash() {
  let hash = window.location.hash.slice(1) || '/';
  if (!hash.startsWith('/')) hash = '/' + hash;
  return hash;
}

async function render() {
  const path = parseHash();

  for (const { regex, paramNames, handler } of routes) {
    const match = path.match(regex);
    if (match) {
      const params = {};
      paramNames.forEach((name, i) => {
        params[name] = match[i + 1];
      });

      appElement.innerHTML = '<div class="loading">Yükleniyor...</div>';
      try {
        await handler({ params, app: appElement });
      } catch (err) {
        console.error(err);
        appElement.innerHTML = `
          <div class="alert alert-error">
            <strong>Hata:</strong> ${err.message}
          </div>
        `;
      }
      return;
    }
  }

  appElement.innerHTML = `
    <div class="empty-state">
      <h2>Sayfa bulunamadı</h2>
      <p><a href="#/">Ana sayfaya dön</a></p>
    </div>
  `;
}

export function initRouter(element) {
  appElement = element;
  window.addEventListener('hashchange', render);
  window.addEventListener('load', render);
  render();
}