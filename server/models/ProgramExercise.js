const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class ProgramExercise {
  constructor() {
    this.dbPath = path.join(__dirname, '../../database/asangym.sqlite');
    this.db = new sqlite3.Database(this.dbPath);
  }

  // Programdaki tüm egzersizleri getir
  getByProgramId(programId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          pe.*,
          e.egzersiz_adi,
          e.hedef_kas_grubu,
          e.zorluk_seviyesi,
          e.aciklama as egzersiz_aciklama,
          ek.kategori_adi
        FROM program_egzersizleri pe
        JOIN egzersizler e ON pe.egzersiz_id = e.id
        LEFT JOIN egzersiz_kategorileri ek ON e.kategori_id = ek.id
        WHERE pe.program_id = ?
        ORDER BY pe.gun, pe.id
      `;
      
      this.db.all(query, [programId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // ID'ye göre program egzersizi getir
  getById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          pe.*,
          e.egzersiz_adi,
          e.hedef_kas_grubu,
          e.zorluk_seviyesi,
          e.aciklama as egzersiz_aciklama,
          ek.kategori_adi
        FROM program_egzersizleri pe
        JOIN egzersizler e ON pe.egzersiz_id = e.id
        LEFT JOIN egzersiz_kategorileri ek ON e.kategori_id = ek.id
        WHERE pe.id = ?
      `;
      
      this.db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Günlere göre program egzersizlerini getir
  getByProgramIdAndDay(programId, day) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          pe.*,
          e.egzersiz_adi,
          e.hedef_kas_grubu,
          e.zorluk_seviyesi,
          e.aciklama as egzersiz_aciklama,
          ek.kategori_adi
        FROM program_egzersizleri pe
        JOIN egzersizler e ON pe.egzersiz_id = e.id
        LEFT JOIN egzersiz_kategorileri ek ON e.kategori_id = ek.id
        WHERE pe.program_id = ? AND pe.gun = ?
        ORDER BY pe.id
      `;
      
      this.db.all(query, [programId, day], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Program egzersizi ekle
  create(exerciseData) {
    return new Promise((resolve, reject) => {
      const { 
        program_id, 
        egzersiz_id, 
        gun, 
        set_sayisi, 
        tekrar_sayisi, 
        notlar 
      } = exerciseData;
      
      const query = `
        INSERT INTO program_egzersizleri (
          program_id, egzersiz_id, gun, set_sayisi, tekrar_sayisi, notlar
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      this.db.run(query, [
        program_id, egzersiz_id, gun, set_sayisi, tekrar_sayisi, notlar
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }

  // Program egzersizi güncelle
  update(id, exerciseData) {
    return new Promise((resolve, reject) => {
      const { 
        egzersiz_id, 
        gun, 
        set_sayisi, 
        tekrar_sayisi, 
        notlar 
      } = exerciseData;
      
      const query = `
        UPDATE program_egzersizleri 
        SET egzersiz_id = ?, gun = ?, set_sayisi = ?, tekrar_sayisi = ?, notlar = ?
        WHERE id = ?
      `;

      this.db.run(query, [
        egzersiz_id, gun, set_sayisi, tekrar_sayisi, notlar, id
      ], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Program egzersizi sil
  delete(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM program_egzersizleri WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Programdaki tüm egzersizleri sil
  deleteByProgramId(programId) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM program_egzersizleri WHERE program_id = ?', [programId], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Toplu program egzersizi ekle
  createBatch(exercisesData) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO program_egzersizleri (
          program_id, egzersiz_id, gun, set_sayisi, tekrar_sayisi, notlar
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const stmt = this.db.prepare(query);
      let successCount = 0;
      let errorCount = 0;

      exercisesData.forEach(exercise => {
        const { 
          program_id, 
          egzersiz_id, 
          gun, 
          set_sayisi, 
          tekrar_sayisi, 
          notlar 
        } = exercise;

        stmt.run([
          program_id, egzersiz_id, gun, set_sayisi, tekrar_sayisi, notlar
        ], function(err) {
          if (err) {
            errorCount++;
            console.error('Toplu ekleme hatası:', err);
          } else {
            successCount++;
          }
        });
      });

      stmt.finalize((err) => {
        if (err) {
          reject(err);
        } else {
          resolve({ successCount, errorCount });
        }
      });
    });
  }

  // Program egzersiz istatistikleri
  getProgramExerciseStats(programId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as toplam_egzersiz,
          COUNT(CASE WHEN gun = 'Pazartesi' THEN 1 END) as pazartesi_egzersiz,
          COUNT(CASE WHEN gun = 'Salı' THEN 1 END) as sali_egzersiz,
          COUNT(CASE WHEN gun = 'Çarşamba' THEN 1 END) as carsamba_egzersiz,
          COUNT(CASE WHEN gun = 'Perşembe' THEN 1 END) as persembe_egzersiz,
          COUNT(CASE WHEN gun = 'Cuma' THEN 1 END) as cuma_egzersiz,
          COUNT(CASE WHEN gun = 'Cumartesi' THEN 1 END) as cumartesi_egzersiz,
          COUNT(CASE WHEN gun = 'Pazar' THEN 1 END) as pazar_egzersiz,
          AVG(set_sayisi) as ortalama_set,
          SUM(set_sayisi) as toplam_set
        FROM program_egzersizleri
        WHERE program_id = ?
      `;
      
      this.db.get(query, [programId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Veritabanı bağlantısını kapat
  close() {
    this.db.close();
  }
}

module.exports = ProgramExercise; 