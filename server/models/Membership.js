const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Membership {
  constructor() {
    this.dbPath = path.join(__dirname, '../../database/asangym.sqlite');
    this.db = new sqlite3.Database(this.dbPath);
  }

  // Tüm üyelikleri getir
  getAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT u.*, 
               m.ad, m.soyad, m.telefon, m.email,
               ut.tip_adi, ut.sure_ay, ut.fiyat as tip_fiyati
        FROM uyelikler u
        JOIN musteriler m ON u.musteri_id = m.id
        JOIN uyelik_tipleri ut ON u.uyelik_tipi_id = ut.id
        WHERE u.aktif = 1
        ORDER BY u.baslangic_tarihi DESC
      `;
      
      this.db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // ID'ye göre üyelik getir
  getById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT u.*, 
               m.ad, m.soyad, m.telefon, m.email,
               ut.tip_adi, ut.sure_ay, ut.fiyat as tip_fiyati
        FROM uyelikler u
        JOIN musteriler m ON u.musteri_id = m.id
        JOIN uyelik_tipleri ut ON u.uyelik_tipi_id = ut.id
        WHERE u.id = ? AND u.aktif = 1
      `;
      
      this.db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Müşteriye göre üyelikleri getir
  getByCustomerId(customerId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT u.*, 
               ut.tip_adi, ut.sure_ay, ut.fiyat as tip_fiyati
        FROM uyelikler u
        JOIN uyelik_tipleri ut ON u.uyelik_tipi_id = ut.id
        WHERE u.musteri_id = ? AND u.aktif = 1
        ORDER BY u.baslangic_tarihi DESC
      `;
      
      this.db.all(query, [customerId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Üyelik ekle
  create(membershipData) {
    return new Promise((resolve, reject) => {
      const { 
        musteri_id, uyelik_tipi_id, baslangic_tarihi, 
        bitis_tarihi, ucret, odeme_durumu 
      } = membershipData;
      
      // odeme_durumu sütunu yoksa sadece temel alanları kullan
      const query = `
        INSERT INTO uyelikler (musteri_id, uyelik_tipi_id, baslangic_tarihi, 
                              bitis_tarihi, ucret)
        VALUES (?, ?, ?, ?, ?)
      `;

      this.db.run(query, [
        musteri_id, uyelik_tipi_id, baslangic_tarihi, 
        bitis_tarihi, ucret
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }

  // Üyelik güncelle
  update(id, membershipData) {
    return new Promise((resolve, reject) => {
      const { 
        musteri_id, uyelik_tipi_id, baslangic_tarihi, 
        bitis_tarihi, ucret, odeme_durumu 
      } = membershipData;
      
      const query = `
        UPDATE uyelikler 
        SET musteri_id = ?, uyelik_tipi_id = ?, baslangic_tarihi = ?, 
            bitis_tarihi = ?, ucret = ?, odeme_durumu = ?
        WHERE id = ?
      `;

      this.db.run(query, [
        musteri_id, uyelik_tipi_id, baslangic_tarihi, 
        bitis_tarihi, ucret, odeme_durumu, id
      ], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Üyelik sil (soft delete)
  delete(id) {
    return new Promise((resolve, reject) => {
      this.db.run('UPDATE uyelikler SET aktif = 0 WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Aktif üyelikleri getir
  getActiveMemberships() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT u.*, 
               m.ad, m.soyad, m.telefon, m.email,
               ut.tip_adi
        FROM uyelikler u
        JOIN musteriler m ON u.musteri_id = m.id
        JOIN uyelik_tipleri ut ON u.uyelik_tipi_id = ut.id
        WHERE u.aktif = 1 AND u.bitis_tarihi >= DATE('now')
        ORDER BY u.bitis_tarihi
      `;
      
      this.db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Süresi dolmak üzere olan üyelikleri getir
  getExpiringMemberships(days = 7) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT u.*, 
               m.ad, m.soyad, m.telefon, m.email,
               ut.tip_adi
        FROM uyelikler u
        JOIN musteriler m ON u.musteri_id = m.id
        JOIN uyelik_tipleri ut ON u.uyelik_tipi_id = ut.id
        WHERE u.aktif = 1 
        AND u.bitis_tarihi BETWEEN DATE('now') AND DATE('now', '+' || ? || ' days')
        ORDER BY u.bitis_tarihi
      `;
      
      this.db.all(query, [days], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Süresi dolmuş üyelikleri getir
  getExpiredMemberships() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT u.*, 
               m.ad, m.soyad, m.telefon, m.email,
               ut.tip_adi
        FROM uyelikler u
        JOIN musteriler m ON u.musteri_id = m.id
        JOIN uyelik_tipleri ut ON u.uyelik_tipi_id = ut.id
        WHERE u.aktif = 1 AND u.bitis_tarihi < DATE('now')
        ORDER BY u.bitis_tarihi DESC
      `;
      
      this.db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Ödeme durumuna göre üyelikleri getir
  getByPaymentStatus(status) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT u.*, 
               m.ad, m.soyad, m.telefon, m.email,
               ut.tip_adi,
               COALESCE(o.odeme_durumu, 0) as odeme_durumu
        FROM uyelikler u
        JOIN musteriler m ON u.musteri_id = m.id
        JOIN uyelik_tipleri ut ON u.uyelik_tipi_id = ut.id
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
        WHERE u.aktif = 1 AND (o.odeme_durumu = ? OR (o.odeme_durumu IS NULL AND ? = 0))
        ORDER BY u.kayit_tarihi DESC
      `;
      
      this.db.all(query, [status, status], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Üyelik istatistikleri
  getMembershipStats() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as toplam_uyelik,
          COUNT(CASE WHEN u.bitis_tarihi >= DATE('now') THEN 1 END) as aktif_uyelik,
          COUNT(CASE WHEN u.bitis_tarihi < DATE('now') THEN 1 END) as sureli_dolmus,
          COUNT(CASE WHEN o.odeme_durumu = 1 THEN 1 END) as odendi,
          COUNT(CASE WHEN o.odeme_durumu = 0 OR o.odeme_durumu IS NULL THEN 1 END) as bekliyor,
          COUNT(CASE WHEN u.bitis_tarihi < DATE('now') AND (o.odeme_durumu = 0 OR o.odeme_durumu IS NULL) THEN 1 END) as gecikmis
        FROM uyelikler u
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
        WHERE u.aktif = 1
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

module.exports = Membership; 