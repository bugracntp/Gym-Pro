const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Customer {
  constructor() {
    this.dbPath = path.join(__dirname, '../../database/asangym.sqlite');
    this.db = new sqlite3.Database(this.dbPath);
  }

  // Tüm müşterileri getir
  getAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT m.*, 
               u.bitis_tarihi as uyelik_bitis_tarihi,
               COALESCE(o.odeme_durumu, 0) as odeme_durumu,
               ut.tip_adi as uyelik_tipi,
               ut.fiyat as uyelik_fiyati,
               mo.boy_cm, mo.kilo_kg, mo.olcum_tarihi as son_olcum_tarihi
        FROM musteriler m
        LEFT JOIN uyelikler u ON m.id = u.musteri_id AND u.aktif = 1
        LEFT JOIN uyelik_tipleri ut ON u.uyelik_tipi_id = ut.id
        LEFT JOIN (
          SELECT 
            uyelik_id,
            CASE 
              WHEN SUM(CASE WHEN odeme_durumu = 1 THEN 1 ELSE 0 END) > 0 THEN 1
              ELSE 0
            END as odeme_durumu
          FROM odemeler 
          GROUP BY uyelik_id
        ) o ON u.id = o.uyelik_id
        LEFT JOIN (
          SELECT musteri_id, boy_cm, kilo_kg, olcum_tarihi,
                 ROW_NUMBER() OVER (PARTITION BY musteri_id ORDER BY olcum_tarihi DESC) as rn
          FROM musteri_olculeri
        ) mo ON m.id = mo.musteri_id AND mo.rn = 1
        WHERE m.aktif = 1
        ORDER BY m.ad, m.soyad
      `;
      
      this.db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // ID'ye göre müşteri getir
  getById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT m.*, 
               u.bitis_tarihi as uyelik_bitis_tarihi,
               u.odeme_durumu,
               ut.tip_adi as uyelik_tipi,
               ut.fiyat as uyelik_fiyati
        FROM musteriler m
        LEFT JOIN uyelikler u ON m.id = u.musteri_id AND u.aktif = 1
        LEFT JOIN uyelik_tipleri ut ON u.uyelik_tipi_id = ut.id
        WHERE m.id = ? AND m.aktif = 1
      `;
      
      this.db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Müşteri ekle
  create(customerData) {
    return new Promise((resolve, reject) => {
      const { 
        ad, soyad, telefon, email, tc_no, dogum_tarihi, 
        cinsiyet, adres, acil_durum_kisi, acil_durum_telefon, notlar, fotoğraf 
      } = customerData;
      
      const query = `
        INSERT INTO musteriler (ad, soyad, telefon, email, tc_no, dogum_tarihi, 
                               cinsiyet, adres, acil_durum_kisi, acil_durum_telefon, notlar, fotoğraf)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(query, [
        ad, soyad, telefon, email, tc_no, dogum_tarihi, 
        cinsiyet, adres, acil_durum_kisi, acil_durum_telefon, notlar, fotoğraf
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }

  // Müşteri güncelle
  update(id, customerData) {
    return new Promise((resolve, reject) => {
      const { 
        ad, soyad, telefon, email, tc_no, dogum_tarihi, 
        cinsiyet, adres, acil_durum_kisi, acil_durum_telefon, notlar, fotoğraf 
      } = customerData;
      
      const query = `
        UPDATE musteriler 
        SET ad = ?, soyad = ?, telefon = ?, email = ?, tc_no = ?, 
            dogum_tarihi = ?, cinsiyet = ?, adres = ?, acil_durum_kisi = ?, 
            acil_durum_telefon = ?, notlar = ?, fotoğraf = ?
        WHERE id = ?
      `;

      this.db.run(query, [
        ad, soyad, telefon, email, tc_no, dogum_tarihi, 
        cinsiyet, adres, acil_durum_kisi, acil_durum_telefon, notlar, fotoğraf, id
      ], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Müşteri sil (soft delete)
  delete(id) {
    return new Promise((resolve, reject) => {
      this.db.run('UPDATE musteriler SET aktif = 0 WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Müşteri arama
  search(searchTerm) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT m.*, 
               u.bitis_tarihi as uyelik_bitis_tarihi,
               u.odeme_durumu,
               ut.tip_adi as uyelik_tipi
        FROM musteriler m
        LEFT JOIN uyelikler u ON m.id = u.musteri_id AND u.aktif = 1
        LEFT JOIN uyelik_tipleri ut ON u.uyelik_tipi_id = ut.id
        WHERE m.aktif = 1 AND (
          m.ad LIKE ? OR 
          m.soyad LIKE ? OR 
          m.telefon LIKE ? OR
          m.tc_no LIKE ?
        )
        ORDER BY m.ad, m.soyad
      `;
      
      const searchPattern = `%${searchTerm}%`;
      this.db.all(query, [searchPattern, searchPattern, searchPattern, searchPattern], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Aktif müşteri sayısını getir
  getActiveCount() {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT COUNT(*) as count FROM musteriler WHERE aktif = 1', [], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.count : 0);
      });
    });
  }

  // Toplam müşteri sayısını getir
  getTotalCount() {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT COUNT(*) as count FROM musteriler', [], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.count : 0);
      });
    });
  }

  // Üyelik süresi dolmak üzere olan müşterileri getir
  getExpiringMemberships(days = 7) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT m.id, m.ad, m.soyad, m.telefon, m.email,
               u.bitis_tarihi, u.odeme_durumu,
               ut.tip_adi as uyelik_tipi
        FROM musteriler m
        JOIN uyelikler u ON m.id = u.musteri_id
        JOIN uyelik_tipleri ut ON u.uyelik_tipi_id = ut.id
        WHERE m.aktif = 1 AND u.aktif = 1 
        AND u.bitis_tarihi BETWEEN DATE('now') AND DATE('now', '+' || ? || ' days')
        ORDER BY u.bitis_tarihi
      `;
      
      this.db.all(query, [days], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Cinsiyete göre müşteri dağılımı
  getGenderDistribution() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT cinsiyet, COUNT(*) as count
        FROM musteriler
        WHERE aktif = 1
        GROUP BY cinsiyet
      `;
      
      this.db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Yaş gruplarına göre müşteri dağılımı
  getAgeDistribution() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          CASE 
            WHEN (julianday('now') - julianday(dogum_tarihi)) / 365.25 < 18 THEN '18 altı'
            WHEN (julianday('now') - julianday(dogum_tarihi)) / 365.25 < 25 THEN '18-24'
            WHEN (julianday('now') - julianday(dogum_tarihi)) / 365.25 < 35 THEN '25-34'
            WHEN (julianday('now') - julianday(dogum_tarihi)) / 365.25 < 45 THEN '35-44'
            WHEN (julianday('now') - julianday(dogum_tarihi)) / 365.25 < 55 THEN '45-54'
            ELSE '55+'
          END as yas_grubu,
          COUNT(*) as count
        FROM musteriler
        WHERE aktif = 1 AND dogum_tarihi IS NOT NULL
        GROUP BY yas_grubu
        ORDER BY yas_grubu
      `;
      
      this.db.all(query, [], (err, rows) => {
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

module.exports = Customer; 