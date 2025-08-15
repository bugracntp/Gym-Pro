-- Migration: Remove odeme_durumu from uyelikler table and add to odemeler table
-- Date: 2024-01-01

-- 1. Add odeme_durumu column to odemeler table if it doesn't exist
ALTER TABLE odemeler ADD COLUMN odeme_durumu INTEGER DEFAULT 0;

-- 2. Update existing payments to set odeme_durumu based on existing data
-- If there are existing payments, you might want to set them as paid (1)
-- UPDATE odemeler SET odeme_durumu = 1 WHERE odeme_tarihi IS NOT NULL;

-- 3. Remove odeme_durumu column from uyelikler table
-- Note: SQLite doesn't support DROP COLUMN directly, so we need to recreate the table

-- Create temporary table without odeme_durumu
CREATE TABLE uyelikler_temp (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  musteri_id INTEGER NOT NULL,
  uyelik_tipi_id INTEGER NOT NULL,
  baslangic_tarihi DATE NOT NULL,
  bitis_tarihi DATE NOT NULL,
  ucret DECIMAL(10,2) NOT NULL,
  aktif INTEGER DEFAULT 1,
  kayit_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (musteri_id) REFERENCES musteriler(id),
  FOREIGN KEY (uyelik_tipi_id) REFERENCES uyelik_tipleri(id)
);

-- Copy data from old table to new table
INSERT INTO uyelikler_temp 
SELECT id, musteri_id, uyelik_tipi_id, baslangic_tarihi, bitis_tarihi, ucret, aktif, kayit_tarihi
FROM uyelikler;

-- Drop old table
DROP TABLE uyelikler;

-- Rename new table
ALTER TABLE uyelikler_temp RENAME TO uyelikler;

-- Recreate indexes if any
CREATE INDEX IF NOT EXISTS idx_uyelikler_musteri_id ON uyelikler(musteri_id);
CREATE INDEX IF NOT EXISTS idx_uyelikler_uyelik_tipi_id ON uyelikler(uyelik_tipi_id);
CREATE INDEX IF NOT EXISTS idx_uyelikler_aktif ON uyelikler(aktif);

-- Add constraint to odemeler table
-- Note: SQLite doesn't support CHECK constraints in ALTER TABLE, so this is just for reference
-- The constraint should be: CHECK(odeme_durumu IN (0, 1)) 