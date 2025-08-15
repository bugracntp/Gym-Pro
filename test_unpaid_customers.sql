-- Test için ödemesi yapılmayan müşteriler ekleme script'i

-- Önce mevcut test verilerini temizle (isteğe bağlı)
-- DELETE FROM uyelikler WHERE musteri_id IN (SELECT id FROM musteriler WHERE ad_soyad LIKE 'Test%');
-- DELETE FROM musteriler WHERE ad_soyad LIKE 'Test%';

-- Test müşterileri ekle
INSERT OR REPLACE INTO musteriler (id, ad_soyad, telefon, email, dogum_tarihi, cinsiyet, aktif, kayit_tarihi) VALUES
(1001, 'Test Müşteri 1', '555-0001', 'test1@example.com', '1990-01-01', 'Erkek', 1, DATE('now')),
(1002, 'Test Müşteri 2', '555-0002', 'test2@example.com', '1985-05-15', 'Kadın', 1, DATE('now')),
(1003, 'Test Müşteri 3', '555-0003', 'test3@example.com', '1992-12-20', 'Erkek', 1, DATE('now')),
(1004, 'Test Müşteri 4', '555-0004', 'test4@example.com', '1988-08-10', 'Kadın', 1, DATE('now')),
(1005, 'Test Müşteri 5', '555-0005', 'test5@example.com', '1995-03-25', 'Erkek', 1, DATE('now'));

-- Test üyelikleri ekle (ödemesi yapılmamış)
INSERT OR REPLACE INTO uyelikler (id, musteri_id, uyelik_tipi, baslangic_tarihi, bitis_tarihi, ucret, odeme_durumu, odeme_tarihi, aktif) VALUES
(2001, 1001, 'Aylık Üyelik', DATE('now', '-30 days'), DATE('now', '+30 days'), 150.00, 'Bekliyor', DATE('now', '+7 days'), 1),
(2002, 1002, '3 Aylık Üyelik', DATE('now', '-60 days'), DATE('now', '+30 days'), 400.00, 'Kısmi Ödendi', DATE('now', '+5 days'), 1),
(2003, 1003, 'Yıllık Üyelik', DATE('now', '-90 days'), DATE('now', '+270 days'), 1200.00, 'Bekliyor', DATE('now', '+10 days'), 1),
(2004, 1004, 'Aylık Üyelik', DATE('now', '-15 days'), DATE('now', '+45 days'), 150.00, 'Gecikmiş', DATE('now', '-5 days'), 1),
(2005, 1005, '6 Aylık Üyelik', DATE('now', '-45 days'), DATE('now', '+135 days'), 750.00, 'Bekliyor', DATE('now', '+15 days'), 1);

-- Test ödemeleri ekle (bazıları ödenmiş, bazıları ödenmemiş)
INSERT OR REPLACE INTO odemeler (id, musteri_id, uyelik_id, tutar, odeme_tarihi, odeme_yontemi, durum, aciklama) VALUES
(3001, 1001, 2001, 0.00, NULL, NULL, 'Bekliyor', 'Henüz ödeme yapılmadı'),
(3002, 1002, 2002, 200.00, DATE('now', '-30 days'), 'Nakit', 'Kısmi Ödendi', '200 TL ödendi, 200 TL kaldı'),
(3003, 1003, 2003, 0.00, NULL, NULL, 'Bekliyor', 'Henüz ödeme yapılmadı'),
(3004, 1004, 2004, 0.00, NULL, NULL, 'Gecikmiş', 'Ödeme tarihi geçti'),
(3005, 1005, 2005, 0.00, NULL, NULL, 'Bekliyor', 'Henüz ödeme yapılmadı');

-- Verileri kontrol et
SELECT 
  m.ad_soyad,
  m.telefon,
  u.uyelik_tipi,
  u.baslangic_tarihi,
  u.bitis_tarihi,
  u.ucret,
  u.odeme_durumu,
  u.odeme_tarihi,
  CASE 
    WHEN u.odeme_durumu = 'Ödendi' THEN 'Tamamlandı'
    WHEN u.odeme_durumu = 'Kısmi Ödendi' THEN 'Kısmi'
    WHEN u.odeme_durumu = 'Bekliyor' THEN 'Bekliyor'
    WHEN u.odeme_durumu = 'Gecikmiş' THEN 'Gecikmiş'
    ELSE u.odeme_durumu
  END as durum_aciklamasi
FROM musteriler m
JOIN uyelikler u ON m.id = u.musteri_id
WHERE m.aktif = 1 
  AND u.aktif = 1 
  AND u.odeme_durumu != 'Ödendi'
  AND u.bitis_tarihi >= DATE('now', 'localtime')
ORDER BY u.odeme_tarihi ASC, m.ad_soyad ASC; 