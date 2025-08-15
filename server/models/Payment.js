const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Payment {
  constructor() {
    this.dbPath = path.join(__dirname, '../../database/asangym.sqlite');
    this.db = new sqlite3.Database(this.dbPath);
    this.initTable();
  }

  // Tablo yapısını başlat ve gerekirse güncelle
  initTable() {
    return new Promise((resolve, reject) => {
      // Ödeme durumu sütunu var mı kontrol et
      this.db.get("PRAGMA table_info(odemeler)", [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        
        // odeme_durumu sütunu yoksa ekle
        this.db.run(`
          ALTER TABLE odemeler 
          ADD COLUMN odeme_durumu INTEGER DEFAULT 0
        `, [], (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.log('Ödeme durumu sütunu zaten mevcut veya eklendi');
          }
          resolve();
        });
      });
    });
  }

  // Tüm ödemeleri getir
  getAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT o.*, 
               m.ad, m.soyad, m.telefon,
               u.uyelik_tipi_id, ut.tip_adi as uyelik_tipi,
               CASE WHEN o.odeme_durumu = 1 THEN 'Ödendi' ELSE 'Ödenmedi' END as odeme_durumu_text
        FROM odemeler o
        JOIN musteriler m ON o.musteri_id = m.id
        JOIN uyelikler u ON o.uyelik_id = u.id
        JOIN uyelik_tipleri ut ON u.uyelik_tipi_id = ut.id
        ORDER BY o.odeme_tarihi DESC
      `;
      
      this.db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // ID'ye göre ödeme getir
  getById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT o.*, 
               m.ad, m.soyad, m.telefon,
               u.uyelik_tipi_id, ut.tip_adi as uyelik_tipi,
               CASE WHEN o.odeme_durumu = 1 THEN 'Ödendi' ELSE 'Ödenmedi' END as odeme_durumu_text
        FROM odemeler o
        JOIN musteriler m ON o.musteri_id = m.id
        JOIN uyelikler u ON o.uyelik_id = u.id
        JOIN uyelik_tipleri ut ON u.uyelik_tipi_id = ut.id
        WHERE o.id = ?
      `;
      
      this.db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Ödeme ekle
  create(paymentData) {
    return new Promise((resolve, reject) => {
      const { musteri_id, uyelik_id, odenen_tutar, odeme_yontemi, aciklama, odeme_durumu = 0 } = paymentData;
      
      // uyelik_id null olabilir, bu durumda NULL olarak kaydet
      const query = `
        INSERT INTO odemeler (musteri_id, uyelik_id, odenen_tutar, odeme_yontemi, aciklama, odeme_durumu)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      this.db.run(query, [musteri_id, uyelik_id || null, odenen_tutar, odeme_yontemi, aciklama, odeme_durumu], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }

  // Ödeme güncelle
  update(id, paymentData) {
    return new Promise((resolve, reject) => {
      const { musteri_id, uyelik_id, odenen_tutar, odeme_yontemi, aciklama, odeme_durumu } = paymentData;
      
      const query = `
        UPDATE odemeler 
        SET musteri_id = ?, uyelik_id = ?, odenen_tutar = ?, odeme_yontemi = ?, aciklama = ?, odeme_durumu = ?
        WHERE id = ?
      `;

      this.db.run(query, [musteri_id, uyelik_id, odenen_tutar, odeme_yontemi, aciklama, odeme_durumu, id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Ödeme durumunu güncelle
  updatePaymentStatus(id, odeme_durumu) {
    return new Promise((resolve, reject) => {
      const query = `UPDATE odemeler SET odeme_durumu = ? WHERE id = ?`;
      
      this.db.run(query, [odeme_durumu, id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Ödeme sil
  delete(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM odemeler WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Aylık gelir hesapla (sadece ödenen ödemeler)
  getMonthlyIncome(month, year) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT SUM(odenen_tutar) as total
        FROM odemeler 
        WHERE strftime('%m', odeme_tarihi) = ? AND strftime('%Y', odeme_tarihi) = ? AND odeme_durumu = 1
      `;
      
      this.db.get(query, [String(month).padStart(2, '0'), String(year)], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.total || 0 : 0);
      });
    });
  }

  // Müşteriye göre ödemeleri getir
  getByCustomerId(customerId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT o.*, 
               COALESCE(u.uyelik_tipi_id, 0) as uyelik_tipi_id, 
               COALESCE(ut.tip_adi, 'Bilinmeyen') as uyelik_tipi,
               CASE WHEN o.odeme_durumu = 1 THEN 'Ödendi' ELSE 'Ödenmedi' END as odeme_durumu_text
        FROM odemeler o
        LEFT JOIN uyelikler u ON o.uyelik_id = u.id
        LEFT JOIN uyelik_tipleri ut ON u.uyelik_tipi_id = ut.id
        WHERE o.musteri_id = ?
        ORDER BY o.odeme_tarihi DESC
      `;
      
      this.db.all(query, [customerId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Üyeliğe göre ödemeleri getir
  getByMembershipId(membershipId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT o.*, 
               m.ad, m.soyad, m.telefon,
               CASE WHEN o.odeme_durumu = 1 THEN 'Ödendi' ELSE 'Ödenmedi' END as odeme_durumu_text
        FROM odemeler o
        JOIN musteriler m ON o.musteri_id = m.id
        WHERE o.uyelik_id = ?
        ORDER BY o.odeme_tarihi DESC
      `;
      
      this.db.all(query, [membershipId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Ödeme yöntemine göre ödemeleri getir
  getByPaymentMethod(method) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT o.*, 
               m.ad, m.soyad, m.telefon,
               u.uyelik_tipi_id, ut.tip_adi as uyelik_tipi,
               CASE WHEN o.odeme_durumu = 1 THEN 'Ödendi' ELSE 'Ödenmedi' END as odeme_durumu_text
        FROM odemeler o
        JOIN musteriler m ON o.musteri_id = m.id
        JOIN uyelikler u ON o.uyelik_id = u.id
        JOIN uyelik_tipleri ut ON u.uyelik_tipi_id = ut.id
        WHERE o.odeme_yontemi = ?
        ORDER BY o.odeme_tarihi DESC
      `;
      
      this.db.all(query, [method], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Ödeme durumuna göre ödemeleri getir
  getByPaymentStatus(status) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT o.*, 
               m.ad, m.soyad, m.telefon,
               u.uyelik_tipi_id, ut.tip_adi as uyelik_tipi,
               CASE WHEN o.odeme_durumu = 1 THEN 'Ödendi' ELSE 'Ödenmedi' END as odeme_durumu_text
        FROM odemeler o
        JOIN musteriler m ON o.musteri_id = m.id
        JOIN uyelikler u ON o.uyelik_id = u.id
        JOIN uyelik_tipleri ut ON u.uyelik_tipi_id = ut.id
        WHERE o.odeme_durumu = ?
        ORDER BY o.odeme_tarihi DESC
      `;
      
      this.db.all(query, [status], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Ödenmemiş ödemeleri getir
  getUnpaidPayments() {
    return this.getByPaymentStatus(0);
  }

  // Ödenmiş ödemeleri getir
  getPaidPayments() {
    return this.getByPaymentStatus(1);
  }

  // Veritabanı bağlantısını kapat
  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Veritabanı kapatılırken hata:', err.message);
        }
      });
    }
  }
}

module.exports = Payment; 