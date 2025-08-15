const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Migration script'ini çalıştır
async function runMigration() {
  const dbPath = path.join(__dirname, '../../database/asangym.sqlite');
  const db = new sqlite3.Database(dbPath);
  
  console.log('🚀 Migration başlatılıyor...');
  
  try {
    // 1. odemeler tablosuna odeme_durumu sütunu ekle
    console.log('📝 odemeler tablosuna odeme_durumu sütunu ekleniyor...');
    await new Promise((resolve, reject) => {
      db.run(`ALTER TABLE odemeler ADD COLUMN odeme_durumu INTEGER DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          reject(err);
        } else {
          console.log('✅ odeme_durumu sütunu eklendi (veya zaten mevcut)');
          resolve();
        }
      });
    });
    
    // 2. Mevcut ödemeleri kontrol et ve varsayılan değer ata
    console.log('🔍 Mevcut ödemeler kontrol ediliyor...');
    const payments = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM odemeler", (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    if (payments.length > 0) {
      console.log(`📊 ${payments.length} ödeme bulundu`);
      // Mevcut ödemeleri varsayılan olarak ödenmemiş (0) olarak işaretle
      await new Promise((resolve, reject) => {
        db.run("UPDATE odemeler SET odeme_durumu = 0 WHERE odeme_durumu IS NULL", (err) => {
          if (err) reject(err);
          else {
            console.log('✅ Mevcut ödemeler güncellendi');
            resolve();
          }
        });
      });
    }
    
    // 3. uyelikler tablosundan odeme_durumu sütununu kaldır
    console.log('🗑️ uyelikler tablosundan odeme_durumu sütunu kaldırılıyor...');
    
    // SQLite'ta DROP COLUMN desteklenmediği için tabloyu yeniden oluştur
    await new Promise((resolve, reject) => {
      db.run(`
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
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Verileri kopyala
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO uyelikler_temp 
        SELECT id, musteri_id, uyelik_tipi_id, baslangic_tarihi, bitis_tarihi, ucret, aktif, kayit_tarihi
        FROM uyelikler
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Eski tabloyu sil
    await new Promise((resolve, reject) => {
      db.run("DROP TABLE uyelikler", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Yeni tabloyu yeniden adlandır
    await new Promise((resolve, reject) => {
      db.run("ALTER TABLE uyelikler_temp RENAME TO uyelikler", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // İndeksleri yeniden oluştur
    await new Promise((resolve, reject) => {
      db.run("CREATE INDEX IF NOT EXISTS idx_uyelikler_musteri_id ON uyelikler(musteri_id)", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run("CREATE INDEX IF NOT EXISTS idx_uyelikler_uyelik_tipi_id ON uyelikler(uyelik_tipi_id)", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run("CREATE INDEX IF NOT EXISTS idx_uyelikler_aktif ON uyelikler(aktif)", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // 4. musteriler tablosuna fotoğraf sütunu ekle
    console.log('📸 musteriler tablosuna fotoğraf sütunu ekleniyor...');
    await new Promise((resolve, reject) => {
      db.run(`ALTER TABLE musteriler ADD COLUMN fotoğraf TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          reject(err);
        } else {
          console.log('✅ fotoğraf sütunu eklendi (veya zaten mevcut)');
          resolve();
        }
      });
    });

    // 5. Fotoğraf sütunu için index ekle
    console.log('🔍 Fotoğraf sütunu için index ekleniyor...');
    await new Promise((resolve, reject) => {
      db.run(`CREATE INDEX IF NOT EXISTS idx_musteriler_fotograf ON musteriler(fotoğraf)`, (err) => {
        if (err) reject(err);
        else {
          console.log('✅ Fotoğraf index\'i eklendi');
          resolve();
        }
      });
    });

    // 6. Mevcut kayıtlar için varsayılan değer ata
    console.log('📝 Mevcut kayıtlar güncelleniyor...');
    await new Promise((resolve, reject) => {
      db.run(`UPDATE musteriler SET fotoğraf = NULL WHERE fotoğraf IS NULL`, (err) => {
        if (err) reject(err);
        else {
          console.log('✅ Mevcut kayıtlar güncellendi');
          resolve();
        }
      });
    });
    
    console.log('✅ Migration başarıyla tamamlandı!');
    console.log('📋 Yapılan değişiklikler:');
    console.log('   - odemeler tablosuna odeme_durumu sütunu eklendi');
    console.log('   - uyelikler tablosundan odeme_durumu sütunu kaldırıldı');
    console.log('   - musteriler tablosuna fotoğraf sütunu eklendi');
    console.log('   - Artık ödeme durumu sadece odemeler tablosundan takip ediliyor');
    console.log('   - Müşteri fotoğrafları veritabanında saklanabiliyor');
    
  } catch (error) {
    console.error('❌ Migration hatası:', error);
  } finally {
    db.close();
  }
}

// Migration'ı çalıştır
runMigration(); 