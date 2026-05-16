-- ═══════════════════════════════════════════════
-- WRITERS WORKSHOP - VERİTABANI ŞEMASI
-- ═══════════════════════════════════════════════
-- ═══════════════════════════════════════════════
-- KULLANICILAR
-- ═══════════════════════════════════════════════
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(150) UNIQUE NOT NULL,
    username      VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
-- ───────────────────────────────────────────────
-- KİTAPLAR (yazarın yazdığı kitap projeleri)
-- ───────────────────────────────────────────────
CREATE TABLE books (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    genre       VARCHAR(50),
    description TEXT,
    goals       TEXT,
    status      VARCHAR(20) DEFAULT 'draft'
                CHECK (status IN ('draft', 'active', 'completed', 'paused')),
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_books_user ON books(user_id);

-- ───────────────────────────────────────────────
-- BÖLÜMLER (kitabın bölümleri, içerik HTML olarak)
-- ───────────────────────────────────────────────
CREATE TABLE chapters (
    id            SERIAL PRIMARY KEY,
    book_id       INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    title         VARCHAR(200) NOT NULL,
    content       TEXT DEFAULT '',
    chapter_order INTEGER NOT NULL DEFAULT 0,
    notes         TEXT,
    word_count    INTEGER DEFAULT 0,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chapters_book ON chapters(book_id, chapter_order);

-- ───────────────────────────────────────────────
-- KİTAP EVRENİ ÖĞELERİ (karakter, mekan, kavram)
-- ───────────────────────────────────────────────
CREATE TABLE story_entities (
    id          SERIAL PRIMARY KEY,
    book_id     INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    name        VARCHAR(150) NOT NULL,
    entity_type VARCHAR(30) NOT NULL
                CHECK (entity_type IN ('character', 'scene', 'location', 'concept')),
    description TEXT,
    metadata    JSONB DEFAULT '{}'::JSONB,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_entities_book ON story_entities(book_id);
CREATE INDEX idx_entities_type ON story_entities(book_id, entity_type);

-- ───────────────────────────────────────────────
-- OKUMA GÜNLÜĞÜ (okunan kitaplar, puanlamalar)
-- ───────────────────────────────────────────────
CREATE TABLE reading_log (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title         VARCHAR(200) NOT NULL,
    author        VARCHAR(150),
    genre         VARCHAR(50),
    rating        INTEGER CHECK (rating BETWEEN 1 AND 5),
    review        TEXT,
    started_date  DATE,
    finished_date DATE,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reading_log_user ON reading_log(user_id);

-- ───────────────────────────────────────────────
-- İLHAM BAĞLARI (okuma → bölüm veya karakter)
-- ───────────────────────────────────────────────
CREATE TABLE inspirations (
    id             SERIAL PRIMARY KEY,
    reading_log_id INTEGER NOT NULL REFERENCES reading_log(id) ON DELETE CASCADE,
    target_type    VARCHAR(20) NOT NULL
                   CHECK (target_type IN ('chapter', 'story_entity', 'book')),
    target_id      INTEGER NOT NULL,
    note           TEXT,
    strength       INTEGER CHECK (strength BETWEEN 1 AND 5) DEFAULT 3,
    created_at     TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_inspirations_reading ON inspirations(reading_log_id);
CREATE INDEX idx_inspirations_target ON inspirations(target_type, target_id);

-- ───────────────────────────────────────────────
-- KAVRAM TİPLERİ (knowledge graph node renkleri)
-- ───────────────────────────────────────────────
CREATE TABLE concept_types (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#888888'
);

-- ───────────────────────────────────────────────
-- KAVRAMLAR (knowledge graph node'ları)
-- ───────────────────────────────────────────────
CREATE TABLE concepts (
    id          SERIAL PRIMARY KEY,
    book_id     INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    type_id     INTEGER REFERENCES concept_types(id) ON DELETE SET NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE (book_id, name)
);

CREATE INDEX idx_concepts_book ON concepts(book_id);

-- ───────────────────────────────────────────────
-- KAVRAM GEÇİŞLERİ (graph edge'leri)
-- ───────────────────────────────────────────────
CREATE TABLE mentions (
    id           SERIAL PRIMARY KEY,
    concept_id   INTEGER NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    source_type  VARCHAR(20) NOT NULL
                 CHECK (source_type IN ('chapter', 'story_entity')),
    source_id    INTEGER NOT NULL,
    extracted_by VARCHAR(20) DEFAULT 'manual'
                 CHECK (extracted_by IN ('manual', 'auto_bracket', 'auto_match')),
    created_at   TIMESTAMP DEFAULT NOW(),
    UNIQUE (concept_id, source_type, source_id)
);

CREATE INDEX idx_mentions_concept ON mentions(concept_id);
CREATE INDEX idx_mentions_source ON mentions(source_type, source_id);

-- ───────────────────────────────────────────────
-- ETİKETLER
-- ───────────────────────────────────────────────
CREATE TABLE tags (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(50) UNIQUE NOT NULL
);

-- Bölüm-etiket bağlantısı (çok-çok)
CREATE TABLE chapter_tags (
    chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
    tag_id     INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (chapter_id, tag_id)
);

-- Okuma-etiket bağlantısı (çok-çok)
CREATE TABLE reading_log_tags (
    reading_log_id INTEGER REFERENCES reading_log(id) ON DELETE CASCADE,
    tag_id         INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (reading_log_id, tag_id)
);

-- ───────────────────────────────────────────────
-- CO-OCCURRENCE VIEW (aynı kaynakta beraber geçen kavramlar)
-- ───────────────────────────────────────────────
CREATE VIEW concept_cooccurrences AS
SELECT 
    LEAST(m1.concept_id, m2.concept_id)    AS concept_a_id,
    GREATEST(m1.concept_id, m2.concept_id) AS concept_b_id,
    COUNT(*) AS weight
FROM mentions m1
JOIN mentions m2 
    ON m1.source_id = m2.source_id 
    AND m1.source_type = m2.source_type
    AND m1.concept_id < m2.concept_id
GROUP BY concept_a_id, concept_b_id;

-- Kitap-etiket bağlantısı (çok-çok)
CREATE TABLE book_tags (
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    tag_id  INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, tag_id)
);