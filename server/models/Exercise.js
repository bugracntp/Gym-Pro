const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Exercise {
  constructor() {
    this.dbPath = path.join(__dirname, '../../database/asangym.sqlite');
    this.db = new sqlite3.Database(this.dbPath);
  }

  // Tüm egzersizleri getir
  getAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT e.*, ek.kategori_adi
        FROM egzersizler e
        LEFT JOIN egzersiz_kategorileri ek ON e.kategori_id = ek.id
        ORDER BY e.egzersiz_adi
      `;
      
      this.db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // ID'ye göre egzersiz getir
  getById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT e.*, ek.kategori_adi
        FROM egzersizler e
        LEFT JOIN egzersiz_kategorileri ek ON e.kategori_id = ek.id
        WHERE e.id = ?
      `;
      
      this.db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Egzersiz ekle
  create(exerciseData) {
    return new Promise((resolve, reject) => {
      const { egzersiz_adi, kategori_id, aciklama, hedef_kas_grubu, zorluk_seviyesi } = exerciseData;
      
      const query = `
        INSERT INTO egzersizler (egzersiz_adi, kategori_id, aciklama, hedef_kas_grubu, zorluk_seviyesi)
        VALUES (?, ?, ?, ?, ?)
      `;

      this.db.run(query, [egzersiz_adi, kategori_id, aciklama, hedef_kas_grubu, zorluk_seviyesi], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }

  // Egzersiz güncelle
  update(id, exerciseData) {
    return new Promise((resolve, reject) => {
      const { egzersiz_adi, kategori_id, aciklama, hedef_kas_grubu, zorluk_seviyesi } = exerciseData;
      
      const query = `
        UPDATE egzersizler 
        SET egzersiz_adi = ?, kategori_id = ?, aciklama = ?, hedef_kas_grubu = ?, zorluk_seviyesi = ?
        WHERE id = ?
      `;

      this.db.run(query, [egzersiz_adi, kategori_id, aciklama, hedef_kas_grubu, zorluk_seviyesi, id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Egzersiz sil
  delete(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM egzersizler WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Kategoriye göre egzersizleri getir
  getByCategory(categoryId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT e.*, ek.kategori_adi
        FROM egzersizler e
        LEFT JOIN egzersiz_kategorileri ek ON e.kategori_id = ek.id
        WHERE e.kategori_id = ?
        ORDER BY e.egzersiz_adi
      `;
      
      this.db.all(query, [categoryId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Zorluk seviyesine göre egzersizleri getir
  getByDifficulty(difficulty) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT e.*, ek.kategori_adi
        FROM egzersizler e
        LEFT JOIN egzersiz_kategorileri ek ON e.kategori_id = ek.id
        WHERE e.zorluk_seviyesi = ?
        ORDER BY e.egzersiz_adi
      `;
      
      this.db.all(query, [difficulty], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Hedef kas grubuna göre egzersizleri getir
  getByTargetMuscle(muscleGroup) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT e.*, ek.kategori_adi
        FROM egzersizler e
        LEFT JOIN egzersiz_kategorileri ek ON e.kategori_id = ek.id
        WHERE e.hedef_kas_grubu LIKE ?
        ORDER BY e.egzersiz_adi
      `;
      
      this.db.all(query, [`%${muscleGroup}%`], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Egzersiz arama
  search(searchTerm) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT e.*, ek.kategori_adi
        FROM egzersizler e
        LEFT JOIN egzersiz_kategorileri ek ON e.kategori_id = ek.id
        WHERE e.egzersiz_adi LIKE ? OR e.aciklama LIKE ? OR e.hedef_kas_grubu LIKE ?
        ORDER BY e.egzersiz_adi
      `;
      
      const searchPattern = `%${searchTerm}%`;
      this.db.all(query, [searchPattern, searchPattern, searchPattern], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Egzersiz istatistikleri
  getExerciseStats() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as toplam_egzersiz,
          COUNT(CASE WHEN zorluk_seviyesi = 'Başlangıç' THEN 1 END) as baslangic_seviye,
          COUNT(CASE WHEN zorluk_seviyesi = 'Orta' THEN 1 END) as orta_seviye,
          COUNT(CASE WHEN zorluk_seviyesi = 'İleri' THEN 1 END) as ileri_seviye
        FROM egzersizler
      `;
      
      this.db.get(query, [], (err, row) => {
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

module.exports = Exercise; 