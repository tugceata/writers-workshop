---

## Kurulum

### Gereksinimler
- Node.js 18+
- Docker Desktop
- Python 3 (frontend için basit HTTP server)

### Adımlar

**1. Repository'yi klonla:**

```bash
git clone https://github.com/tugceata/writers-workshop.git
cd writers-workshop
```

**2. Backend bağımlılıklarını yükle:**

```bash
cd backend
npm install
```

**3. `.env` dosyasını oluştur:**

`.env.example` dosyasını `.env` olarak kopyala, içindeki değerleri doldur:

```bash
cp .env.example .env
```

Önemli: `JWT_SECRET` için güçlü bir değer üret:

```bash
openssl rand -hex 64
```

Çıkan değeri `JWT_SECRET=` satırına yaz.

**4. PostgreSQL'i Docker ile başlat:**

```bash
docker compose up -d
```

Veritabanı `localhost:5434` portunda çalışır.

**5. Backend'i başlat:**

```bash
npm run dev
```

Sunucu `http://localhost:3000` adresinde çalışır.
API dokümantasyonu: `http://localhost:3000/api-docs`

**6. Frontend'i başlat:**

Ayrı bir terminalde:

```bash
cd frontend
python3 -m http.server 8000
```

Tarayıcıda aç: `http://localhost:8000`

---

## API Endpoint'leri

Detaylı dokümantasyon için backend çalışırken `http://localhost:3000/api-docs` adresini ziyaret edin.

### Auth (giriş gerekmez)
- `POST /api/auth/register` — Yeni kullanıcı kaydı
- `POST /api/auth/login` — Giriş yap (token döner)

### Auth (giriş gerekir)
- `GET /api/auth/me` — Mevcut kullanıcı bilgisi
- `PATCH /api/auth/me` — Kullanıcı ismini güncelle

### Books (giriş gerekir)
- `GET /api/books` — Kitapları listele
- `GET /api/books/:id` — Tek kitap detayı
- `POST /api/books` — Yeni kitap oluştur
- `PUT /api/books/:id` — Kitabı güncelle
- `DELETE /api/books/:id` — Kitabı sil

### Chapters (giriş gerekir)
- `GET /api/books/:bookId/chapters` — Bölümleri listele
- `GET /api/books/:bookId/chapters/:id` — Tek bölüm
- `POST /api/books/:bookId/chapters` — Yeni bölüm
- `PUT /api/books/:bookId/chapters/:id` — Bölümü güncelle
- `DELETE /api/books/:bookId/chapters/:id` — Bölümü sil

### Reading Log (giriş gerekir)
- `GET /api/reading-log` — Okumaları listele
- `GET /api/reading-log/stats` — İstatistikler
- `GET /api/reading-log/:id` — Tek okuma detayı
- `POST /api/reading-log` — Yeni okuma kaydı
- `PUT /api/reading-log/:id` — Okumayı güncelle
- `DELETE /api/reading-log/:id` — Okumayı sil

### Tags
- `GET /api/tags` — Tüm etiketleri listele

---

## Veritabanı Şeması

Temel tablolar:

- **users** — Kullanıcılar (email, username, password_hash)
- **books** — Kitap projeleri (user_id ile ilişkili)
- **chapters** — Bölümler (book_id ile ilişkili)
- **reading_log** — Okuma kayıtları (user_id ile ilişkili)
- **tags** — Etiketler (sabit liste)
- **book_tags** — Kitap-etiket bağlantı tablosu (çok-çok ilişki)

Tüm user-specific veriler `user_id` kolonu ile filtrelenir. Bir kullanıcı diğer kullanıcının verilerine erişemez (404 döner).

---

## Testler

Backend unit testleri Jest ile yazılmıştır. Saf fonksiyonlar test edilmiştir (kelime sayımı, ortalama puan, tag doğrulama, JWT vb.).

Testleri çalıştırmak için:

```bash
cd backend
npm test
```

---

## Geliştirme Notları

### Saf Fonksiyon Yaklaşımı
İş mantığı `service` katmanında saf fonksiyonlara ayrılmıştır. Bu sayede DB veya HTTP olmadan unit test yazılabilir. Örnek:
- `countWords(htmlContent)` — HTML temizleyip kelime sayar
- `calculateAverageRating(entries)` — Ortalama puan hesaplar
- `validateTagIds(ids)` — Tag listesini doğrular (max 3, integer)

### Multi-Tenant Tasarım
Her tablonun ilgili kolonunda `user_id` vardır. Repository sorguları her zaman `WHERE user_id = $1` ile filtreler. Service katmanı `req.user.id` parametresi alır. Böylece bir kullanıcı sadece kendi içeriğini görür ve düzenleyebilir.

### Token Yönetimi
JWT token `localStorage`'da `ww_token` anahtarıyla saklanır. Her API isteğine `Authorization: Bearer <token>` header'ı otomatik eklenir. 401 alındığında otomatik logout ve welcome sayfasına yönlendirme yapılır (auth endpoint'leri hariç).

---

## Lisans

MIT