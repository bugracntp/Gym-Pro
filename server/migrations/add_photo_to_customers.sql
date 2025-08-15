-- Müşteriler tablosuna fotoğraf sütunu ekle
ALTER TABLE musteriler ADD COLUMN fotoğraf TEXT;

-- Fotoğraf sütunu için index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_musteriler_fotograf ON musteriler(fotoğraf);

-- Mevcut kayıtlar için varsayılan değer ata
UPDATE musteriler SET fotoğraf = NULL WHERE fotoğraf IS NULL; 