export function renderWelcome({ app }) {
  app.innerHTML = `
    <div class="auth-page">
      <div class="welcome-card">
        <div class="welcome-logo">Writers Workshop</div>
        <div class="welcome-tagline">
          Hikayeni yaz, okuduklarını sakla, yolculuğunu izle.
        </div>
        <div class="welcome-actions">
          <a href="#/login" class="btn btn-primary">Giriş Yap</a>
          <a href="#/register" class="btn btn-secondary">Kayıt Ol</a>
        </div>
      </div>
    </div>
  `;
}