const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class MemberProgram {
  constructor() {
    this.dbPath = path.join(__dirname, '../../database/asangym.sqlite');
    this.db = new sqlite3.Database(this.dbPath);
  }

  // Tüm üye programlarını getir
  getAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          ap.*,
          m.ad || ' ' || m.soyad as musteri_adi,
          m.telefon as musteri_telefon,
          m.email as musteri_email
        FROM antrenman_programlari ap
        JOIN musteriler m ON ap.musteri_id = m.id
        ORDER BY ap.olusturma_tarihi DESC
      `;
      
      this.db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // ID'ye göre program getir
  getById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          ap.*,
          m.ad || ' ' || m.soyad as musteri_adi,
          m.telefon as musteri_telefon,
          m.email as musteri_email
        FROM antrenman_programlari ap
        JOIN musteriler m ON ap.musteri_id = m.id
        WHERE ap.id = ?
      `;
      
      this.db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Müşteriye göre programları getir
  getByCustomerId(customerId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          ap.*,
          m.ad || ' ' || m.soyad as musteri_adi,
          m.telefon as musteri_telefon,
          m.email as musteri_email
        FROM antrenman_programlari ap
        JOIN musteriler m ON ap.musteri_id = m.id
        WHERE ap.musteri_id = ?
        ORDER BY ap.olusturma_tarihi DESC
      `;
      
      this.db.all(query, [customerId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Aktif programları getir
  getActive() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          ap.*,
          m.ad || ' ' || m.soyad as musteri_adi,
          m.telefon as musteri_telefon,
          m.email as musteri_email
        FROM antrenman_programlari ap
        JOIN musteriler m ON ap.musteri_id = m.id
        WHERE ap.aktif = 1
        ORDER BY ap.olusturma_tarihi DESC
      `;
      
      this.db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Pasif programları getir
  getInactive() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          ap.*,
          m.ad || ' ' || m.soyad as musteri_adi,
          m.telefon as musteri_telefon,
          m.email as musteri_email
        FROM antrenman_programlari ap
        JOIN musteriler m ON ap.musteri_id = m.id
        WHERE ap.aktif = 0
        ORDER BY ap.olusturma_tarihi DESC
      `;
      
      this.db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Program ekle
  create(programData) {
    return new Promise((resolve, reject) => {
      const { musteri_id, program_adi, baslangic_tarihi, bitis_tarihi, hedef, aktif } = programData;
      
      const query = `
        INSERT INTO antrenman_programlari (musteri_id, program_adi, baslangic_tarihi, bitis_tarihi, hedef, aktif)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      this.db.run(query, [musteri_id, program_adi, baslangic_tarihi, bitis_tarihi, hedef, aktif], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }

  // Program güncelle
  update(id, programData) {
    return new Promise((resolve, reject) => {
      const { musteri_id, program_adi, baslangic_tarihi, bitis_tarihi, hedef, aktif } = programData;
      
      const query = `
        UPDATE antrenman_programlari 
        SET musteri_id = ?, program_adi = ?, baslangic_tarihi = ?, bitis_tarihi = ?, hedef = ?, aktif = ?
        WHERE id = ?
      `;

      this.db.run(query, [musteri_id, program_adi, baslangic_tarihi, bitis_tarihi, hedef, aktif, id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Program sil
  delete(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM antrenman_programlari WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Program durumunu güncelle
  updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      this.db.run('UPDATE antrenman_programlari SET aktif = ? WHERE id = ?', [status, id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Program arama
  search(searchTerm) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          ap.*,
          m.ad || ' ' || m.soyad as musteri_adi,
          m.telefon as musteri_telefon,
          m.email as musteri_email
        FROM antrenman_programlari ap
        JOIN musteriler m ON ap.musteri_id = m.id
        WHERE ap.program_adi LIKE ? OR m.ad LIKE ? OR m.soyad LIKE ? OR ap.hedef LIKE ?
        ORDER BY ap.olusturma_tarihi DESC
      `;
      
      const searchPattern = `%${searchTerm}%`;
      this.db.all(query, [searchPattern, searchPattern, searchPattern, searchPattern], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Program istatistikleri
  getProgramStats() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as toplam_program,
          COUNT(CASE WHEN aktif = 1 THEN 1 END) as aktif_program,
          COUNT(CASE WHEN aktif = 0 THEN 1 END) as pasif_program,
          COUNT(CASE WHEN bitis_tarihi >= DATE('now') THEN 1 END) as devam_eden_program
        FROM antrenman_programlari
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

module.exports = MemberProgram; 