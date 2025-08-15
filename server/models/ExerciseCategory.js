const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class ExerciseCategory {
  constructor() {
    this.dbPath = path.join(__dirname, '../../database/asangym.sqlite');
    this.db = new sqlite3.Database(this.dbPath);
  }

  // Tüm kategorileri getir
  getAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM egzersiz_kategorileri
        ORDER BY kategori_adi
      `;
      
      this.db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // ID'ye göre kategori getir
  getById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM egzersiz_kategorileri
        WHERE id = ?
      `;
      
      this.db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Kategori ekle
  create(categoryData) {
    return new Promise((resolve, reject) => {
      const { kategori_adi, aciklama } = categoryData;
      
      const query = `
        INSERT INTO egzersiz_kategorileri (kategori_adi, aciklama)
        VALUES (?, ?)
      `;

      this.db.run(query, [kategori_adi, aciklama], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }

  // Kategori güncelle
  update(id, categoryData) {
    return new Promise((resolve, reject) => {
      const { kategori_adi, aciklama } = categoryData;
      
      const query = `
        UPDATE egzersiz_kategorileri 
        SET kategori_adi = ?, aciklama = ?
        WHERE id = ?
      `;

      this.db.run(query, [kategori_adi, aciklama, id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Kategori sil
  delete(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM egzersiz_kategorileri WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Kategori adına göre ara
  searchByName(searchTerm) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM egzersiz_kategorileri
        WHERE kategori_adi LIKE ?
        ORDER BY kategori_adi
      `;
      
      const searchPattern = `%${searchTerm}%`;
      this.db.all(query, [searchPattern], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Kategori istatistikleri
  getCategoryStats() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as toplam_kategori,
          COUNT(CASE WHEN aciklama IS NOT NULL AND aciklama != '' THEN 1 END) as aciklamali_kategori
        FROM egzersiz_kategorileri
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

module.exports = ExerciseCategory; 