-- ═══════════════════════════════════════════════
-- ÖRNEK VERİ (development için)
-- ═══════════════════════════════════════════════

-- Kavram tipleri (pembe tonları)
INSERT INTO concept_types (name, color) VALUES
    ('symbol',    '#FFD1DC'),
    ('emotion',   '#FFB6C1'),
    ('place',     '#FF8FAB'),
    ('object',    '#E91E63'),
    ('archetype', '#AD1457');

-- Kitap türü etiketleri (sabit liste)
INSERT INTO tags (name) VALUES
    ('fantastik'), ('bilim-kurgu'), ('genç-kurgu'), ('distopya'),
    ('ütopya'), ('roman'), ('öykü'), ('novella'), ('polisiye'),
    ('gerilim'), ('korku'), ('romantik'), ('tarihsel'), ('biyografi'),
    ('anı'), ('deneme'), ('şiir'), ('çocuk'), ('mitoloji'),
    ('gizem'), ('macera'), ('büyülü-gerçekçilik')
ON CONFLICT (name) DO NOTHING;