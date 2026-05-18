import { authApi } from '../api.js';
import { getUser, setSession, getToken } from '../auth.js';
import { toast } from '../components/toast.js';

export async function renderProfile({ app }) {
  // Önce server'dan güncel kullanıcı bilgisini çekelim
  let user;
  try {
    user = await authApi.me();
  } catch (err) {
    user = getUser(); // server hatası olursa cache'den göster
  }

  const createdDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('tr-TR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  app.innerHTML = `
    <div class="page-header">
      <h1>Profilim</h1>
    </div>

    <div class="profile-card">
      <div class="profile-avatar">
        ${getInitial(user)}
      </div>

      <div class="profile-info">
        <div class="profile-name">
          ${user.username ? escapeHtml(user.username) : 'İsim girilmemiş'}
        </div>
        <div class="profile-email">${escapeHtml(user.email)}</div>
        ${createdDate ? `<div class="profile-joined">${createdDate} tarihinde katıldın</div>` : ''}
      </div>
    </div>

    <div class="profile-section">
      <h2 class="profile-section-title">Bilgilerimi Düzenle</h2>

      <form id="profile-form" class="form">
        <div id="form-alert"></div>

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
          <small style="color: var(--gray-500); font-size: 12px; display: block; margin-top: 4px;">
            Ana sayfada karşılama için kullanılır. Boş bırakabilirsin.
          </small>
        </div>

        <div class="form-group">
          <label class="form-label">E-posta</label>
          <input
            type="email"
            class="form-input"
            value="${escapeAttr(user.email)}"
            disabled
            style="opacity: 0.6; cursor: not-allowed;"
          />
          <small style="color: var(--gray-500); font-size: 12px; display: block; margin-top: 4px;">
            E-posta değiştirilemez
          </small>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Kaydet</button>
        </div>
      </form>
    </div>
  `;

  const form = document.getElementById('profile-form');
  const alertBox = document.getElementById('form-alert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const newUsername = formData.get('username') || '';

    try {
      const updatedUser = await authApi.updateUsername({ username: newUsername });

      // localStorage'daki user'ı güncelle (token aynı kalır)
      const token = getToken();
      setSession(token, updatedUser);

      toast.success('Profil güncellendi');

      // Sayfayı yeniden render et ki yeni veriler görünsün
      renderProfile({ app });

      // Topbar'ı da yenile (isim değişti)
      window.dispatchEvent(new Event('hashchange'));
    } catch (err) {
      alertBox.innerHTML = `
        <div class="alert alert-error">
          ${err.message}
        </div>
      `;
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