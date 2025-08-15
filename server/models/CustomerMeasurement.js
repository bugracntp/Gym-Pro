const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class CustomerMeasurement {
  constructor() {
    this.dbPath = path.join(__dirname, '../../database/asangym.sqlite');
    this.db = new sqlite3.Database(this.dbPath);
  }

  // Tüm ölçümleri getir
  getAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT mo.*, m.ad, m.soyad 
        FROM musteri_olculeri mo
        JOIN musteriler m ON mo.musteri_id = m.id
        ORDER BY mo.olcum_tarihi DESC
      `;
      
      this.db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Müşterinin tüm ölçülerini getir
  getByCustomerId(customerId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM musteri_olculeri 
        WHERE musteri_id = ? 
        ORDER BY olcum_tarihi DESC
      `;
      
      this.db.all(query, [customerId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // ID'ye göre ölçü getir
  getById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM musteri_olculeri WHERE id = ?';
      
      this.db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Yeni ölçü ekle
  create(measurementData) {
    return new Promise((resolve, reject) => {
      const { 
        musteri_id, olcum_tarihi, boy_cm, kilo_kg, bel_cevresi_cm, 
        kalca_cevresi_cm, kol_cevresi_cm, boyun_cevresi_cm, notlar 
      } = measurementData;
      
      const query = `
        INSERT INTO musteri_olculeri (
          musteri_id, olcum_tarihi, boy_cm, kilo_kg, 
          bel_cevresi_cm, kalca_cevresi_cm, kol_cevresi_cm, boyun_cevresi_cm, notlar
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(query, [
        musteri_id, olcum_tarihi, boy_cm, kilo_kg, 
        bel_cevresi_cm, kalca_cevresi_cm, kol_cevresi_cm, boyun_cevresi_cm, notlar
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }

  // Ölçü güncelle
  update(id, measurementData) {
    return new Promise((resolve, reject) => {
      const { 
        olcum_tarihi, boy_cm, kilo_kg, bel_cevresi_cm, 
        kalca_cevresi_cm, kol_cevresi_cm, boyun_cevresi_cm, notlar 
      } = measurementData;
      
      const query = `
        UPDATE musteri_olculeri 
        SET olcum_tarihi = ?, boy_cm = ?, kilo_kg = ?, 
            bel_cevresi_cm = ?, kalca_cevresi_cm = ?, 
            kol_cevresi_cm = ?, boyun_cevresi_cm = ?, notlar = ?
        WHERE id = ?
      `;

      const params = [
        olcum_tarihi, boy_cm, kilo_kg, bel_cevresi_cm, 
        kalca_cevresi_cm, kol_cevresi_cm, boyun_cevresi_cm, notlar, id
      ];

      this.db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  // Ölçü sil
  delete(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM musteri_olculeri WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Müşterinin en son ölçüsünü getir
  getLatestByCustomerId(customerId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM musteri_olculeri 
        WHERE musteri_id = ? 
        ORDER BY olcum_tarihi DESC 
        LIMIT 1
      `;
      
      this.db.get(query, [customerId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Ölçü istatistikleri
  getMeasurementStats(customerId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as toplam_olcum,
          MIN(olcum_tarihi) as ilk_olcum_tarihi,
          MAX(olcum_tarihi) as son_olcum_tarihi,
          AVG(kilo_kg) as ortalama_kilo,
          MIN(kilo_kg) as min_kilo,
          MAX(kilo_kg) as max_kilo
        FROM musteri_olculeri 
        WHERE musteri_id = ?
      `;
      
      this.db.get(query, [customerId], (err, row) => {
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

module.exports = CustomerMeasurement; 