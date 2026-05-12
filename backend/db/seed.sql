-- ═══════════════════════════════════════════════
-- ÖRNEK VERİ
-- ═══════════════════════════════════════════════

-- Kavram tipleri (renkler ile)
INSERT INTO concept_types (name, color) VALUES
    ('symbol',    '#FFD1DC'),  -- soft pembe (baby pink)
    ('emotion',   '#FFB6C1'),  -- açık pembe (light pink)
    ('place',     '#FF8FAB'),  -- orta pembe
    ('object',    '#E91E63'),  -- canlı pembe (raspberry)
    ('archetype', '#AD1457');  -- koyu pembe (deep magenta)

-- Örnek kitap
INSERT INTO books (title, genre, description, goals, status) VALUES
    ('Vortex', 'fantasy', 'Ölümün durduğu bir dünyada bekleyişin hikayesi.', '80000 kelime, 25 bölüm', 'active');

-- Örnek bölüm
INSERT INTO chapters (book_id, title, content, chapter_order, word_count) VALUES
    (1, 'Ara Durak', '<p>Mira istasyonda durdu, saatler işlemiyordu.</p>', 1, 8);

-- Örnek karakter
INSERT INTO story_entities (book_id, name, entity_type, description, metadata) VALUES
    (1, 'Mira', 'character', 'Ara durakta bekleyen genç kadın.', '{"age": 23, "role": "protagonist"}');

-- Örnek kavramlar
INSERT INTO concepts (book_id, name, type_id, description) VALUES
    (1, 'beklevi',  1, 'Ölümsüzlük halinde bekleme eşiği'),
    (1, 'istasyon', 3, 'Zamanın durduğu mekan'),
    (1, 'saat',     4, 'Durmuş zamanın simgesi');

-- Örnek okuma
INSERT INTO reading_log (title, author, genre, rating, review, finished_date) VALUES
    ('Sonsuza Giden Bahçeler', 'Jorge Luis Borges', 'kısa öykü', 5,
     'Zaman ve labirent kavramları üzerine müthiş bir eser.', '2026-04-12');

-- Örnek etiketler
INSERT INTO tags (name) VALUES ('giriş'), ('atmosferik'), ('zaman');

-- Bölüm-etiket bağı
INSERT INTO chapter_tags VALUES (1, 1), (1, 2);