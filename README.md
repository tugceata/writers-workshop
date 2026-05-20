# Writers Workshop 

**Writers Workshop**, yazarlar ve okurlar için tasarlanmış kişisel bir yaratıcı yazarlık platformudur. Kullanıcı kendi kitap projelerini oluşturur, bölüm bölüm yazar, okuduğu kitapları puanlı yorumlarla bir günlükte saklar. Tüm veriler kişiye özeldir — her kullanıcının kendi dünyası vardır.

İstanbul Arel Üniversitesi Bilgisayar Mühendisliği, **Sistem Analizi ve Tasarımı** dersi (Bahar 2026) için geliştirilmiştir.

---

## Genel Bakış

Projenin iki ana modülü vardır:

**1. Yazma Atölyesi** — Kullanıcı kitap projeleri açar, her kitap için bölümler yazar. Bölümler Word benzeri bir editörle düzenlenir, otomatik kaydedilir, sürükle-bırak ile sıralanır. Her bölüm için kelime sayısı otomatik hesaplanır.

**2. Kütüphane (Okuma Günlüğü)** — Kullanıcı okuduğu kitapları kaydeder. Her kayıt için 5 yıldız puanlama, yorum, başlangıç/bitiş tarihi ve tür etiketleri eklenir. İstatistik grafikleri ile puan dağılımı ve en çok okunan türler görselleştirilir.

Ana sayfada kullanıcıyı kişiselleştirilmiş bir karşılama bekler: Alice in Wonderland'dan rastgele bir alıntı, son yazılan bölüme tek tıkla dönüş, toplam kelime ve bölüm istatistikleri, son çalışılan kitaplar ve son okunan kitaplar.

---

## Özellikler

### Kitap Yönetimi
- Başlık, açıklama, hedefler ve durum (taslak/tamamlandı) ile kitap projesi oluşturma
- Tag sistemi — her kitap için 22 önceden tanımlı türden en fazla 3 etiket, autocomplete ile
- Karakter sayaçları (başlık 200, açıklama 500)
- Liste görünümünde kart tabanlı arayüz, hover'da düzenle/sil butonları
- Tek tıklama ile detay sayfasına geçiş

### Bölüm Yönetimi
- Quill.js tabanlı zengin metin editörü (kalın, italik, başlık, liste, alıntı...)
- 1 saniye debounce ile **otomatik kayıt** — kullanıcı yazmayı bıraktığı an sessizce kaydedilir
- Manuel kayıt + toast bildirim, **Cmd+S** kısayolu
- Otomatik kelime sayımı (HTML etiketleri sayıma dahil edilmez)
- SortableJS ile sürükle-bırak sıralama
- Otomatik bölüm numaralandırma ("Bölüm 1", "Bölüm 2"...)

### Okuma Günlüğü (Kütüphane)
- Kitap başlığı, yazar, tür etiketleri, 5 yıldız puanlama, yorum, başlangıç/bitiş tarihi
- İnteraktif yıldız bileşeni — hover'da bir önceki yıldızlara kadar dolar, altta etiket ("Mükemmel", "İyi", "Vasat"...)
- Liste görünümünde kart tabanlı arayüz, puan rengine göre sol kenar göstergesi
- İki grafik:
  - **Puan dağılımı** — 1'den 5'e kadar yıldız sayılarına göre yatay barlar
  - **En çok okunan türler** — sıralı çubuk grafik
- Tooltip ile hover'da kesin sayı

### Okuma Modları
- **Bölüm okuma sayfası** — bölümü salt-okunur, kitap tipografisinde (Playfair, drop cap, justify) gösterir; üstte scroll ile dolan ilerleme barı ve kelime sayısına göre okuma süresi tahmini
- **Kitap önizleme** — tüm kitabı gerçek bir kitap gibi sayfalara böler (sayfa başına ~280 kelime), sol/sağ oklar ve klavye (← →) ile sayfa çevirme, geçiş animasyonu, her bölüm için ayrı başlık sayfası, üstte tüm kitabı kapsayan ilerleme barı

### Kullanıcı Sistemi
- E-posta + şifre ile kayıt ve giriş
- JWT token bazlı kimlik doğrulama
- `bcrypt` ile güvenli şifre saklama (10 round salt)
- Her kullanıcının kendi içeriği — tam veri izolasyonu (multi-tenant tasarım)
- A kullanıcısı B'nin kitabını ya da okumasını **göremez** (sanki yokmuş gibi davranılır, 404 döner)
- Profil sayfası:
  - İsim güncelleme (opsiyonel — boş bırakılırsa "Profil" görünür)
  - Şifre değiştirme (mevcut şifre doğrulanır)
  - Hesap silme (çift onay + "SİL" yazma gereksinimi, cascade delete ile tüm veriler silinir)

### Kişiselleştirme
- **4 tema seçeneği**: Gül (pembe), Erik (mor), Lacivert (mavi), Çam (yeşil)
- Tema seçimi **kullanıcı hesabına bağlıdır** — veritabanında `users.theme` kolonunda saklanır, böylece kullanıcı hangi cihazdan girerse girsin kendi temasını görür. Giriş yapılmamış sayfalar (welcome/login/register) her zaman varsayılan temayı gösterir
- Tüm sayfa renkleri tema değişkenlerine bağlı — bir tıkla tüm site yeniden boyanır
- Ana sayfada Lewis Carroll alıntıları (15 farklı Alice quote'u rastgele döner)

### Ana Sayfa (Dashboard)
- Kişiye özel karşılama ("Hoş geldin, [isim]" veya isim yoksa sadece "Hoş geldin")
- "Kaldığın yerden devam et" kartı — en son yazılan bölüme tek tıkla erişim, kelime ve tarih bilgisi
- 4 istatistik kartı: toplam kitap, bölüm, kelime, okunan kitap
- Son çalışılan kitaplar listesi (tarihe göre sıralı, "az önce / X saat önce / X gün önce" gibi göreceli zaman)
- Son okunan kitaplar listesi (yıldızlı kompakt görünüm)

### Genel
- Üst menü: Marka (ana sayfaya link) + kullanıcı adı (profile link) + Çıkış butonu
- Alt menü: Kitaplarım, Kütüphanem (aktif sayfanın altında çizgi göstergesi)
- Toast bildirimler (başarı/hata)
- Tüm formlar Joi şemaları ile doğrulanır, hata mesajları kullanıcı dostudur
- Türkiye saati ile uyumlu (PostgreSQL container'ı Europe/Istanbul timezone'unda)
- Kitap ve okuma listelerinde **arama, filtreleme ve sıralama** (başlık/yazar araması, durum/puan filtresi, çeşitli sıralama seçenekleri)

---

## Mimari

### Backend — Katmanlı Mimari

Backend, her isteği şu katmanlardan geçirir:

```
HTTP İsteği
    ↓
Route Katmanı       → URL'leri dinler, HTTP'yi anlar
    ↓
Auth Middleware     → JWT token doğrular, req.user'a kullanıcıyı koyar
    ↓
Validation          → Joi şemaları ile gelen veriyi doğrular
    ↓
Service Katmanı     → İş mantığı (saf fonksiyonlar test edilebilir)
    ↓
Repository Katmanı  → Raw SQL sorguları (parametreli, injection güvenli)
    ↓
PostgreSQL
```

Bu yapı:
- Her dosyanın **tek bir sorumluluğu** olmasını sağlar
- İş mantığını DB'den ve HTTP'den ayırır → **unit test** yazmayı kolaylaştırır
- Yeniden kullanılabilirlik sağlar (servisler birden çok route tarafından çağrılabilir)

### Frontend — Vanilla JS SPA

Framework kullanılmamıştır (ders kuralı). Tek `index.html` dosyası vardır, JavaScript ile içerik dinamik olarak `<main id="app">` içine render edilir.

Hash bazlı router (`#/books`, `#/profile`, `#/books/3/chapters/7` gibi) sayfa değişimini sağlar. URL'deki hash değiştiğinde:
1. Router kayıtlı pattern'lere bakar
2. Eşleşen route'u bulur (parametreleri çıkarır)
3. Önce token kontrolü yapar (auth wrapper)
4. View fonksiyonunu çağırır
5. View, API'den veriyi çeker ve HTML render eder

### Veri İzolasyonu (Multi-Tenant)

Her kullanıcı sadece kendi verilerine erişebilir. Bu, **veritabanı seviyesinde** sağlanır:

- `books` ve `reading_log` tablolarında `user_id` kolonu vardır
- Repository sorgu örneği: `SELECT * FROM books WHERE user_id = $1`
- `chapters` tablosunda `user_id` yoktur (kitaba bağlı) ama service katmanı önce **kitabın kullanıcıya ait olup olmadığını kontrol eder**
- Eğer A kullanıcısı B'nin kitabının URL'sini tahmin edip istek atarsa → "Kitap bulunamadı" (404) cevabı alır

Bu, hem güvenlik hem gizlilik açısından önemlidir.

---

## API Referansı

Tam Swagger dokümantasyonu sunucu çalışırken `http://localhost:3000/api-docs` adresinde mevcuttur.

### Kimlik Doğrulama

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| POST   | `/api/auth/register` | Yeni kullanıcı kaydı | ❌ |
| POST   | `/api/auth/login` | Giriş yap, token döner | ❌ |
| GET    | `/api/auth/me` | Mevcut kullanıcı bilgisi | ✅ |
| PATCH  | `/api/auth/me` | İsim güncelle | ✅ |
| POST   | `/api/auth/change-password` | Şifre değiştir | ✅ |
| DELETE | `/api/auth/me` | Hesabı kalıcı sil | ✅ |
| PATCH  | `/api/auth/theme` | Tema tercihini güncelle | ✅ |

### Kitaplar

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET    | `/api/books` | Kitapları listele (sayfalama, filtreleme, sıralama destekler) |
| GET    | `/api/books/:id` | Tek kitap detayı |
| POST   | `/api/books` | Yeni kitap oluştur |
| PUT    | `/api/books/:id` | Kitabı güncelle |
| DELETE | `/api/books/:id` | Kitabı sil (bölümler de silinir, cascade) |

### Bölümler

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET    | `/api/books/:bookId/chapters` | Kitabın bölümlerini listele |
| GET    | `/api/books/:bookId/chapters/:id` | Tek bölüm |
| POST   | `/api/books/:bookId/chapters` | Yeni bölüm oluştur |
| PUT    | `/api/books/:bookId/chapters/:id` | Bölümü güncelle |
| DELETE | `/api/books/:bookId/chapters/:id` | Bölümü sil |

### Okuma Günlüğü

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET    | `/api/reading-log` | Okumaları listele (sayfalama, filtreleme, sıralama destekler) |
| GET    | `/api/reading-log/stats` | İstatistikler (toplam, ortalama, türler, puan dağılımı) |
| GET    | `/api/reading-log/:id` | Tek okuma kaydı |
| POST   | `/api/reading-log` | Yeni okuma kaydı |
| PUT    | `/api/reading-log/:id` | Okumayı güncelle |
| DELETE | `/api/reading-log/:id` | Okumayı sil |

### Diğer

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET    | `/api/tags` | Tüm tag'leri listele (22 sabit etiket) |

### Listeleme Parametreleri

`GET /api/books` ve `GET /api/reading-log` şu query parametrelerini kabul eder:

| Parametre | Açıklama |
|-----------|----------|
| `page`, `limit` | Sayfalama (varsayılan: page 1, limit 50) |
| `sort`, `order` | Sıralama alanı ve yönü (asc/desc) |
| `search` | Başlık/yazar/açıklamada metin araması |
| `status` | Kitaplar için durum filtresi (draft/completed) |
| `min_rating` | Okumalar için minimum puan filtresi (1-5) |

Cevap formatı:
```json
{
  "data": [ ... ],
  "pagination": { "page": 1, "limit": 50, "total": 12, "totalPages": 1 }
}
```

---

## Teknoloji Seçimleri ve Sebepleri

### Backend
- **Node.js + Express** — Hafif, modüler, REST API'ler için endüstri standardı
- **PostgreSQL 16** — İlişkisel veriler için güçlü, ACID uyumlu, JSON desteği
- **JWT + bcrypt** — Stateless kimlik doğrulama, güvenli şifre hash'leme
- **Joi** — Bildirim tabanlı doğrulama, hata mesajları özelleştirilebilir
- **Jest** — Saf fonksiyonlar için hızlı unit test framework'ü
- **Swagger UI** — JSDoc yorumlarından otomatik API dokümantasyonu

### Frontend
- **Vanilla JavaScript (ES Modules)** — Ders kuralı: framework yok. Modern tarayıcılar zaten module sistemi destekler.
- **Quill.js** — Zengin metin editörü, kütüphane (framework değil)
- **SortableJS** — Sürükle-bırak için minimal kütüphane
- **Google Fonts (Playfair Display)** — Kitap kapağı hissi veren klasik serif font

### DevOps
- **Docker Compose** — PostgreSQL container'ı, geliştirme ortamı tutarlılığı
- **nodemon** — Backend otomatik yeniden başlatma
- **Git** — Versiyon kontrolü

---

## Veritabanı Tasarımı

```
users          ← Kullanıcılar
  ↓ 1-N
books          ← Kitap projeleri
  ↓ 1-N
chapters       ← Bölümler

users
  ↓ 1-N
reading_log    ← Okuma kayıtları

books ↔ tags   ← Çok-çok ilişki (book_tags tablosu üzerinden)
```

**Temel tablolar:**

| Tablo | Açıklama | Anahtar Alanlar |
|-------|----------|-----------------|
| `users` | Kullanıcılar | `id`, `email` (unique), `username` (opsiyonel), `password_hash`, `theme` |
| `books` | Kitap projeleri | `id`, `user_id` (FK), `title`, `description`, `status` |
| `chapters` | Bölümler | `id`, `book_id` (FK), `title`, `content` (HTML), `chapter_order`, `word_count` |
| `reading_log` | Okuma kayıtları | `id`, `user_id` (FK), `title`, `author`, `rating`, `review` |
| `tags` | Etiketler | `id`, `name` (22 sabit etiket) |
| `book_tags` | Kitap-etiket bağlantısı | `book_id`, `tag_id` |

**Otomatik trigger:** Bölüm değiştiğinde kitabın `updated_at` alanı otomatik güncellenir — "son çalışılan kitaplar" listesinin doğru sıralanması için.

---

## Test

Backend'de **67 unit test** vardır (Jest). Saf fonksiyonlar ve doğrulama şemaları test edilmiştir:

- `countWords(htmlContent)` — HTML temizleyip kelime sayar
- `calculateAverageRating(entries)` — Ortalama puan
- `groupByGenre(entries)` — Türlere göre gruplama
- `groupByRating(entries)` — Puan dağılımı
- `calculateReadingDays(entry)` — Okuma süresi (gün)
- `validateTagIds(ids)` — Tag doğrulama (max 3, integer, dedupe)
- `nextChapterOrder(currentMax)` — Sıradaki bölüm numarası
- `generateToken(user)` — JWT üretimi
- `verifyToken(token)` — JWT doğrulama
- `calculateBookProgress(book, total, written)` — Yüzde hesaplama
- `registerSchema / loginSchema / changePasswordSchema` — Joi doğrulama kuralları (email formatı, şifre uzunluğu, zorunlu alanlar)
- Token üretiminin geçerlilik, süre ve imza doğrulaması

Çalıştırmak için: `cd backend && npm test`

---

## Geliştirme Notları

### Saf Fonksiyon Yaklaşımı
Service katmanındaki iş mantığı **saf fonksiyonlar** olarak yazılmıştır. Bu, DB veya HTTP olmadan unit test yazmayı sağlar ve kodu daha kolay anlaşılır hale getirir.

### SQL Injection Koruması
Tüm SQL sorguları **parametreli sorgular** kullanır (`$1`, `$2`...). Asla string concatenation ile sorgu oluşturulmaz.

### Token Yönetimi
JWT token `localStorage`'da `ww_token` anahtarıyla saklanır. Her API isteğine `Authorization: Bearer <token>` header'ı otomatik eklenir. 401 alındığında otomatik logout ve welcome sayfasına yönlendirme yapılır (auth endpoint'leri hariç — onlar kendi hata mesajını gösterir).

### Sayfa Yönlendirmesi
Hash bazlı router kullanılır. `protect()` ve `publicOnly()` wrapper'ları sayfalara erişim kontrolü yapar:
- Korunmuş route'lar (örn. `/books`) → giriş yapmamışsa welcome'a yönlendir
- Public route'lar (örn. `/login`) → zaten girişliyse ana sayfaya yönlendir

### CSS Tema Sistemi
Tüm renkler CSS custom property (`--theme-50`'den `--theme-700`'e) olarak tanımlanır. Kullanıcının teması veritabanından okunup `data-theme` attribute'una yazılır; değiştiğinde tüm site renkleri anlık güncellenir.

---

## Proje Bilgisi

**Geliştirici:** Tuğçe Ata
**Üniversite:** İstanbul Arel Üniversitesi — Bilgisayar Mühendisliği
**Ders:** Sistem Analizi ve Tasarımı, Bahar 2026

---

## Lisans

MIT
