const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Veritabanı bağlantısı
const dbPath = path.join(__dirname, '../database/asangym.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Test verisi ekleniyor...');

// Test üyelik tipleri ekle
const insertMembershipTypes = `
  INSERT OR REPLACE INTO uyelik_tipleri (id, tip_adi, sure_ay, fiyat, aciklama, aktif) VALUES
  (1, 'Aylık Üyelik', 1, 150.00, '1 aylık üyelik', 1),
  (2, '3 Aylık Üyelik', 3, 400.00, '3 aylık üyelik', 1),
  (3, '6 Aylık Üyelik', 6, 750.00, '6 aylık üyelik', 1),
  (4, 'Yıllık Üyelik', 12, 1200.00, 'Yıllık üyelik', 1)
`;

// Test müşterileri ekle
const insertCustomers = `
  INSERT OR REPLACE INTO musteriler (id, ad, soyad, telefon, email, dogum_tarihi, cinsiyet, aktif, kayit_tarihi) VALUES
  (1001, 'Test', 'Müşteri 1', '555-0001', 'test1@example.com', '1990-01-01', 'Erkek', 1, DATE('now')),
  (1002, 'Test', 'Müşteri 2', '555-0002', 'test2@example.com', '1985-05-15', 'Kadın', 1, DATE('now')),
  (1003, 'Test', 'Müşteri 3', '555-0003', 'test3@example.com', '1992-12-20', 'Erkek', 1, DATE('now')),
  (1004, 'Test', 'Müşteri 4', '555-0004', 'test4@example.com', '1988-08-10', 'Kadın', 1, DATE('now')),
  (1005, 'Test', 'Müşteri 5', '555-0005', 'test5@example.com', '1995-03-25', 'Erkek', 1, DATE('now'))
`;

// Test üyelikleri ekle
const insertMemberships = `
  INSERT OR REPLACE INTO uyelikler (id, musteri_id, uyelik_tipi_id, baslangic_tarihi, bitis_tarihi, ucret, odeme_durumu, aktif) VALUES
  (2001, 1001, 1, DATE('now', '-30 days'), DATE('now', '+30 days'), 150.00, 'Bekliyor', 1),
  (2002, 1002, 2, DATE('now', '-60 days'), DATE('now', '+30 days'), 400.00, 'Kısmi Ödendi', 1),
  (2003, 1003, 4, DATE('now', '-90 days'), DATE('now', '+270 days'), 1200.00, 'Bekliyor', 1),
  (2004, 1004, 1, DATE('now', '-15 days'), DATE('now', '+45 days'), 150.00, 'Gecikmiş', 1),
  (2005, 1005, 3, DATE('now', '-45 days'), DATE('now', '+135 days'), 750.00, 'Bekliyor', 1)
`;

// Test ödemeleri ekle
const insertPayments = `
  INSERT OR REPLACE INTO odemeler (id, musteri_id, uyelik_id, odenen_tutar, odeme_tarihi, odeme_yontemi, aciklama) VALUES
  (3001, 1001, 2001, 0.00, NULL, NULL, 'Henüz ödeme yapılmadı'),
  (3002, 1002, 2002, 200.00, DATE('now', '-30 days'), 'Nakit', '200 TL ödendi, 200 TL kaldı'),
  (3003, 1003, 2003, 0.00, NULL, NULL, 'Henüz ödeme yapılmadı'),
  (3004, 1004, 2004, 0.00, NULL, NULL, 'Ödeme tarihi geçti'),
  (3005, 1005, 2005, 0.00, NULL, NULL, 'Henüz ödeme yapılmadı')
`;

// Verileri ekle
db.serialize(() => {
  // Üyelik tiplerini ekle
  db.run(insertMembershipTypes, (err) => {
    if (err) {
      console.error('Üyelik tipleri eklenirken hata:', err);
    } else {
      console.log('✅ Test üyelik tipleri eklendi');
    }
  });

  // Müşterileri ekle
  db.run(insertCustomers, (err) => {
    if (err) {
      console.error('Müşteriler eklenirken hata:', err);
    } else {
      console.log('✅ Test müşterileri eklendi');
    }
  });

  // Üyelikleri ekle
  db.run(insertMemberships, (err) => {
    if (err) {
      console.error('Üyelikler eklenirken hata:', err);
    } else {
      console.log('✅ Test üyelikleri eklendi');
    }
  });

  // Ödemeleri ekle
  db.run(insertPayments, (err) => {
    if (err) {
      console.error('Ödemeler eklenirken hata:', err);
    } else {
      console.log('✅ Test ödemeleri eklendi');
    }
  });

  // Verileri kontrol et
  setTimeout(() => {
    const checkQuery = `
      SELECT 
        m.ad || ' ' || m.soyad as ad_soyad,
        m.telefon,
        ut.tip_adi as uyelik_tipi,
        u.baslangic_tarihi,
        u.bitis_tarihi,
        u.ucret,
        u.odeme_durumu
      FROM musteriler m
      JOIN uyelikler u ON m.id = u.musteri_id
      JOIN uyelik_tipleri ut ON u.uyelik_tipi_id = ut.id
      WHERE m.aktif = 1 
        AND u.aktif = 1 
        AND u.odeme_durumu != 'Ödendi'
        AND u.bitis_tarihi >= DATE('now', 'localtime')
      ORDER BY u.baslangic_tarihi ASC, m.ad ASC
    `;

    db.all(checkQuery, [], (err, rows) => {
      if (err) {
        console.error('Veri kontrolünde hata:', err);
      } else {
        console.log('\n📊 Ödemesi yapılmayan müşteriler:');
        console.table(rows);
        console.log(`\nToplam: ${rows.length} müşteri`);
      }
      
      // Veritabanı bağlantısını kapat
      db.close();
      console.log('\n✅ Test verisi ekleme tamamlandı!');
    });
  }, 1000);
}); 