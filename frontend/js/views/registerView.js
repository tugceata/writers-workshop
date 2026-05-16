import { authApi } from '../api.js';
import { setSession } from '../auth.js';
import { navigate } from '../router.js';
import { toast } from '../components/toast.js';

export function renderRegister({ app }) {
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-card-header">
          <div class="auth-card-title">Aramıza katıl</div>
          <div class="auth-card-subtitle">Yazma yolculuğun başlasın</div>
        </div>

        <form id="register-form" class="auth-form">
          <div id="form-alert"></div>

          <div class="form-group">
            <label class="form-label" for="email">E-posta *</label>
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
            <label class="form-label" for="username">İsim (opsiyonel)</label>
            <input
              type="text"
              id="username"
              name="username"
              class="form-input"
              maxlength="50"
              autocomplete="given-name"
              placeholder="Sana nasıl hitap edelim?"
            />
            <small style="color: var(--gray-500); font-size: 12px; display: block; margin-top: 4px;">
              Ana sayfada karşılama için kullanılır
            </small>
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Şifre *</label>
            <input
              type="password"
              id="password"
              name="password"
              class="form-input"
              required
              minlength="6"
              autocomplete="new-password"
              placeholder="En az 6 karakter"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="password2">Şifre Tekrar *</label>
            <input
              type="password"
              id="password2"
              name="password2"
              class="form-input"
              required
              minlength="6"
              autocomplete="new-password"
              placeholder="Şifreni tekrar yaz"
            />
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Kayıt Ol</button>
          </div>
        </form>

        <div class="auth-footer">
          Zaten hesabın var mı? <a href="#/login">Giriş yap</a>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById('register-form');
  const alertBox = document.getElementById('form-alert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Şifre eşleşmesi kontrolü
    if (data.password !== data.password2) {
      alertBox.innerHTML = `<div class="alert alert-error">Şifreler eşleşmiyor</div>`;
      return;
    }

    // password2'yi gönderme
    delete data.password2;

    // Username boşsa null olarak gönder
    if (!data.username || data.username.trim() === '') {
      delete data.username;
    }

    try {
      const { token, user } = await authApi.register(data);
      setSession(token, user);
      toast.success('Hoş geldin' + (user.username ? `, ${user.username}` : '') + '!');
      navigate('/');
    } catch (err) {
      let errMsg = err.message;
      if (err.status === 409) {
        errMsg = 'Bu e-posta zaten kayıtlı. Giriş yapmayı dener misin?';
      }
      alertBox.innerHTML = `<div class="alert alert-error">${errMsg}</div>`;
    }
  });
}