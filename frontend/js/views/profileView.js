import { authApi } from '../api.js';
import { getUser, setSession, getToken, clearSession } from '../auth.js';
import { navigate } from '../router.js';
import { toast } from '../components/toast.js';
import { THEMES, getTheme, setTheme } from '../theme.js';

export async function renderProfile({ app }) {
  let user;
  try {
    user = await authApi.me();
  } catch (err) {
    user = getUser();
  }

  const createdDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('tr-TR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  const currentTheme = getTheme();

  app.innerHTML = `
    <div class="page-header">
      <h1>Profilim</h1>
    </div>

    <div class="profile-wrapper">
      <!-- Üst: Kullanıcı bilgisi -->
      <div class="profile-hero">
        <div class="profile-avatar">${getInitial(user)}</div>
        <div class="profile-info">
          <div class="profile-name">
            ${user.username ? escapeHtml(user.username) : 'İsim girilmemiş'}
          </div>
          <div class="profile-email">${escapeHtml(user.email)}</div>
          ${createdDate ? `<div class="profile-joined">Aramıza ${createdDate} tarihinde katıldın 🌸</div>` : ''}
        </div>
      </div>

      <!-- Orta: İki sütunlu formlar -->
      <div class="profile-forms">
        <!-- Sol: Bilgilerim -->
        <div class="profile-block">
          <h2 class="profile-block-title">Bilgilerimi Düzenle</h2>

          <form id="profile-form" class="form">
            <div id="profile-alert"></div>

            <div class="form-group">
              <label class="form-label" for="username">İsim</label>
              <input
                type="text"
                id="username"
                name="username"
                class="form-input"
                maxlength="50"
                value="${user.username ? escapeAttr(user.username) : ''}"
                placeholder="Sana nasıl hitap edelim?"
              />
              <small class="form-hint">Ana sayfada karşılama için kullanılır</small>
            </div>

            <div class="form-group">
              <label class="form-label">E-posta</label>
              <input
                type="email"
                class="form-input"
                value="${escapeAttr(user.email)}"
                disabled
              />
              <small class="form-hint">E-posta değiştirilemez</small>
            </div>

            <button type="submit" class="btn btn-primary">Kaydet</button>
          </form>
        </div>

        <!-- Sağ: Şifre -->
        <div class="profile-block">
          <h2 class="profile-block-title">Şifre Değiştir</h2>

          <form id="password-form" class="form">
            <div id="password-alert"></div>

            <div class="form-group">
              <label class="form-label" for="current_password">Mevcut Şifre</label>
              <input
                type="password"
                id="current_password"
                name="current_password"
                class="form-input"
                required
                autocomplete="current-password"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="new_password">Yeni Şifre</label>
              <input
                type="password"
                id="new_password"
                name="new_password"
                class="form-input"
                required
                minlength="6"
                autocomplete="new-password"
                placeholder="En az 6 karakter"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="new_password2">Yeni Şifre Tekrar</label>
              <input
                type="password"
                id="new_password2"
                name="new_password2"
                class="form-input"
                required
                minlength="6"
                autocomplete="new-password"
              />
            </div>

            <button type="submit" class="btn btn-primary">Şifreyi Güncelle</button>
          </form>
        </div>
      </div>

      <!-- Tema seçici -->
      <div class="profile-theme">
        <h2 class="profile-block-title" style="margin-bottom: 16px;">Tema</h2>
        <div class="theme-grid">
          ${Object.entries(THEMES).map(([id, theme]) => `
            <button
              type="button"
              class="theme-card ${id === currentTheme ? 'active' : ''}"
              data-theme-id="${id}"
            >
              <div class="theme-preview">
                ${theme.preview.map(color => `
                  <div class="theme-swatch" style="background: ${color};"></div>
                `).join('')}
              </div>
              <div class="theme-name">${theme.name}</div>
              <div class="theme-desc">${theme.description}</div>
              ${id === currentTheme ? '<div class="theme-active-badge">✓ Aktif</div>' : ''}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Alt: Tehlikeli alan -->
      <div class="profile-danger">
        <div class="profile-danger-info">
          <div class="profile-danger-title">Hesabı Sil</div>
          <div class="profile-danger-text">
            Bu işlem geri alınamaz. Tüm kitapların, bölümlerin ve okuma kayıtların kalıcı olarak silinir.
          </div>
        </div>
        <button id="delete-account-btn" class="btn btn-danger">Hesabı Sil</button>
      </div>
    </div>
  `;

  // İsim güncelleme
  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newUsername = formData.get('username') || '';
    const profileAlert = document.getElementById('profile-alert');

    try {
      const updatedUser = await authApi.updateUsername({ username: newUsername });
      const token = getToken();
      setSession(token, updatedUser);
      toast.success('Profil güncellendi');
      renderProfile({ app });
      window.dispatchEvent(new Event('hashchange'));
    } catch (err) {
      profileAlert.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
    }
  });

  // Şifre değiştirme
  document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const passwordAlert = document.getElementById('password-alert');

    if (data.new_password !== data.new_password2) {
      passwordAlert.innerHTML = `<div class="alert alert-error">Yeni şifreler eşleşmiyor</div>`;
      return;
    }
    if (data.current_password === data.new_password) {
      passwordAlert.innerHTML = `<div class="alert alert-error">Yeni şifre, mevcut şifre ile aynı olamaz</div>`;
      return;
    }

    delete data.new_password2;

    try {
      await authApi.changePassword(data);
      e.target.reset();
      passwordAlert.innerHTML = `<div class="profile-success">✓ Şifreniz başarıyla güncellendi</div>`;
      toast.success('Şifre güncellendi');
    } catch (err) {
      let errMsg = err.message;
      if (err.status === 401) errMsg = 'Mevcut şifre hatalı';
      passwordAlert.innerHTML = `<div class="alert alert-error">${errMsg}</div>`;
    }
  });

  // Tema seçimi
  document.querySelectorAll('.theme-card').forEach(card => {
    card.addEventListener('click', () => {
      const themeId = card.dataset.themeId;
      setTheme(themeId);
      toast.success(`${THEMES[themeId].name} teması uygulandı`);
      renderProfile({ app }); // yeniden render — aktif badge güncellensin
    });
  });

  // Hesap silme
  document.getElementById('delete-account-btn').addEventListener('click', async () => {
    const confirm1 = confirm(
      'Hesabını silmek istediğine emin misin?\n\n' +
      'Bu işlem geri alınamaz. Tüm kitapların, bölümlerin ve okuma kayıtların silinecek.'
    );
    if (!confirm1) return;

    const typed = prompt('Onaylamak için "SİL" yaz:');
    if (typed !== 'SİL') {
      toast.error('İptal edildi');
      return;
    }

    try {
      await authApi.deleteAccount();
      clearSession();
      toast.success('Hesabın silindi. Görüşmek üzere 🌸');
      setTimeout(() => navigate('/welcome'), 1500);
    } catch (err) {
      toast.error('Hesap silinemedi: ' + err.message);
    }
  });
}

function getInitial(user) {
  if (user.username && user.username.trim()) {
    return user.username.trim().charAt(0).toUpperCase();
  }
  if (user.email) {
    return user.email.charAt(0).toUpperCase();
  }
  return '✿';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(str) {
  if (!str) return '';
  return String(str).replace(/"/g, '&quot;');
}