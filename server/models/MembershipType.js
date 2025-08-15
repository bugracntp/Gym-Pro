const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class MembershipType {
  constructor() {
    this.dbPath = path.join(__dirname, '../../database/asangym.sqlite');
    this.db = new sqlite3.Database(this.dbPath);
  }

  // Tüm üyelik tiplerini getir
  getAll() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM uyelik_tipleri WHERE aktif = 1 ORDER BY sure_ay ASC';
      
      this.db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Tüm üyelik tiplerini getir (aktif ve pasif dahil)
  getAllWithInactive() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM uyelik_tipleri ORDER BY sure_ay ASC';
      
      this.db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Aktif üyelik tiplerini getir
  getActive() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM uyelik_tipleri WHERE aktif = 1 ORDER BY sure_ay ASC';
      
      this.db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Pasif üyelik tiplerini getir
  getInactive() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM uyelik_tipleri WHERE aktif = 0 ORDER BY sure_ay ASC';
      
      this.db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // ID'ye göre üyelik tipi getir
  getById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM uyelik_tipleri WHERE id = ? AND aktif = 1';
      
      this.db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Üyelik tipi ekle
  create(membershipTypeData) {
    return new Promise((resolve, reject) => {
      const { tip_adi, sure_ay, fiyat, aciklama } = membershipTypeData;
      
      const query = `
        INSERT INTO uyelik_tipleri (tip_adi, sure_ay, fiyat, aciklama)
        VALUES (?, ?, ?, ?)
      `;

      this.db.run(query, [tip_adi, sure_ay, fiyat, aciklama], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }

  // Üyelik tipi güncelle
  update(id, typeData) {
    return new Promise((resolve, reject) => {
      const { tip_adi, sure_ay, fiyat, aciklama, aktif } = typeData;
      
      const query = `
        UPDATE uyelik_tipleri 
        SET tip_adi = ?, sure_ay = ?, fiyat = ?, aciklama = ?, aktif = ?
        WHERE id = ?
      `;

      this.db.run(query, [tip_adi, sure_ay, fiyat, aciklama, aktif, id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Üyelik tipi durumunu güncelle
  updateStatus(id, aktif) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE uyelik_tipleri 
        SET aktif = ?
        WHERE id = ?
      `;

      this.db.run(query, [aktif, id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Üyelik tipi sil (hard delete)
  delete(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM uyelik_tipleri WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Üyelik tipi pasif yap (soft delete)
  softDelete(id) {
    return new Promise((resolve, reject) => {
      this.db.run('UPDATE uyelik_tipleri SET aktif = 0 WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Fiyata göre üyelik tipi getir
  getByPrice(price) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM uyelik_tipleri WHERE fiyat = ? AND aktif = 1';
      
      this.db.all(query, [price], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Aylık süreye göre üyelik tipi getir
  getByMonths(months) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM uyelik_tipleri WHERE sure_ay = ? AND aktif = 1';
      
      this.db.get(query, [months], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // En popüler üyelik tiplerini getir
  getPopularTypes(limit = 5) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT ut.*, COUNT(u.id) as kullanım_sayısı
        FROM uyelik_tipleri ut
        LEFT JOIN uyelikler u ON ut.id = u.uyelik_tipi_id
        WHERE ut.aktif = 1
        GROUP BY ut.id
        ORDER BY kullanım_sayısı DESC
        LIMIT ?
      `;
      
      this.db.all(query, [limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Fiyat aralığına göre üyelik tiplerini getir
  getByPriceRange(minPrice, maxPrice) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM uyelik_tipleri 
        WHERE fiyat BETWEEN ? AND ? AND aktif = 1
        ORDER BY fiyat
      `;
      
      this.db.all(query, [minPrice, maxPrice], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Süre aralığına göre üyelik tiplerini getir
  getByDurationRange(minMonths, maxMonths) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM uyelik_tipleri 
        WHERE sure_ay BETWEEN ? AND ? AND aktif = 1
        ORDER BY sure_ay
      `;
      
      this.db.all(query, [minMonths, maxMonths], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Veritabanı bağlantısını kapat
  close() {
    this.db.close();
  }
}

module.exports = MembershipType; 