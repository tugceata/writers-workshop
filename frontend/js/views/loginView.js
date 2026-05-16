import { authApi } from '../api.js';
import { setSession } from '../auth.js';
import { navigate } from '../router.js';
import { toast } from '../components/toast.js';

export function renderLogin({ app }) {
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-card-header">
          <div class="auth-card-title">Tekrar hoş geldin</div>
          <div class="auth-card-subtitle">Hikâyene devam etmek için giriş yap</div>
        </div>

        <form id="login-form" class="auth-form">
          <div id="form-alert"></div>

          <div class="form-group">
            <label class="form-label" for="email">E-posta</label>
            <input
              type="email"
              id="email"
              name="email"
              class="form-input"
              required
              autocomplete="email"
              placeholder="ornek@email.com"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Şifre</label>
            <input
              type="password"
              id="password"
              name="password"
              class="form-input"
              required
              autocomplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Giriş Yap</button>
          </div>
        </form>

        <div class="auth-footer">
          Hesabın yok mu? <a href="#/register">Kayıt ol</a>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById('login-form');
  const alertBox = document.getElementById('form-alert');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  try {
    const { token, user } = await authApi.login(data);
    setSession(token, user);
    toast.success('Hoş geldin' + (user.username ? `, ${user.username}` : ''));
    navigate('/');
  } catch (err) {
    let errMsg = err.message;
    // 401 → e-posta veya şifre yanlış
    if (err.status === 401) {
      errMsg = 'E-posta veya şifre hatalı';
    } else if (err.details && err.details.length > 0) {
      // Joi doğrulama hatası (geçersiz email formatı vs.)
      errMsg = err.details.join(', ');
    }
    alertBox.innerHTML = `
      <div class="alert alert-error">
        ${errMsg}
      </div>
    `;
  }
}); }