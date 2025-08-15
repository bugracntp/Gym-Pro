const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, '../../database/asangym.sqlite');
    this.db = null;
  }

  // Veritabanına bağlan
  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Veritabanına bağlanırken hata:', err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Veritabanı tablolarını oluştur
  initializeTables() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        try {
          // 1. MÜŞTERİLER TABLOSU
          this.db.run(`CREATE TABLE IF NOT EXISTS musteriler (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ad TEXT NOT NULL,
            soyad TEXT NOT NULL,
            telefon TEXT UNIQUE NOT NULL,
            email TEXT,
            tc_no TEXT UNIQUE,
            dogum_tarihi DATE,
            cinsiyet TEXT CHECK(cinsiyet IN ('Erkek', 'Kadın', 'erkek', 'kadın', 'diğer')),
            adres TEXT,
            acil_durum_kisi TEXT,
            acil_durum_telefon TEXT,
            kayit_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
            aktif INTEGER DEFAULT 1,
            notlar TEXT
          )`);

          // 2. ÜYELİK TİPLERİ TABLOSU
          this.db.run(`CREATE TABLE IF NOT EXISTS uyelik_tipleri (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tip_adi TEXT NOT NULL UNIQUE,
            sure_ay INTEGER NOT NULL,
            fiyat DECIMAL(10,2) NOT NULL,
            aciklama TEXT,
            aktif INTEGER DEFAULT 1
          )`);

          // 3. ÜYELİKLER TABLOSU
          this.db.run(`CREATE TABLE IF NOT EXISTS uyelikler (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            musteri_id INTEGER NOT NULL,
            uyelik_tipi_id INTEGER NOT NULL,
            baslangic_tarihi DATE NOT NULL,
            bitis_tarihi DATE NOT NULL,
            ucret DECIMAL(10,2) NOT NULL,
            aktif INTEGER DEFAULT 1,
            kayit_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (musteri_id) REFERENCES musteriler(id),
            FOREIGN KEY (uyelik_tipi_id) REFERENCES uyelik_tipleri(id)
          )`);

          // 4. ÖDEMELER TABLOSU
          this.db.run(`CREATE TABLE IF NOT EXISTS odemeler (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            musteri_id INTEGER NOT NULL,
            uyelik_id INTEGER NOT NULL,
            odeme_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
            odenen_tutar DECIMAL(10,2) NOT NULL,
            odeme_yontemi TEXT DEFAULT 'Nakit' CHECK(odeme_yontemi IN ('Nakit', 'Kart', 'Havale')),
            aciklama TEXT,
            odeme_durumu INTEGER DEFAULT 0 CHECK(odeme_durumu IN (0, 1)),
            FOREIGN KEY (musteri_id) REFERENCES musteriler(id),
            FOREIGN KEY (uyelik_id) REFERENCES uyelikler(id)
          )`);

          // 5. EGZERSİZ KATEGORİLERİ TABLOSU
          this.db.run(`CREATE TABLE IF NOT EXISTS egzersiz_kategorileri (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            kategori_adi TEXT NOT NULL UNIQUE,
            aciklama TEXT
          )`);

          // 6. EGZERSİZLER TABLOSU
          this.db.run(`CREATE TABLE IF NOT EXISTS egzersizler (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            egzersiz_adi TEXT NOT NULL,
            kategori_id INTEGER,
            aciklama TEXT,
            hedef_kas_grubu TEXT,
            zorluk_seviyesi TEXT CHECK(zorluk_seviyesi IN ('Başlangıç', 'Orta', 'İleri')),
            FOREIGN KEY (kategori_id) REFERENCES egzersiz_kategorileri(id)
          )`);

          // 7. ANTRENMAN PROGRAMLARI TABLOSU
          this.db.run(`CREATE TABLE IF NOT EXISTS antrenman_programlari (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            musteri_id INTEGER NOT NULL,
            program_adi TEXT NOT NULL,
            baslangic_tarihi DATE NOT NULL,
            bitis_tarihi DATE,
            hedef TEXT,
            aktif INTEGER DEFAULT 1,
            olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (musteri_id) REFERENCES musteriler(id)
          )`);

          // 8. PROGRAM EGZERSİZLERİ TABLOSU
          this.db.run(`CREATE TABLE IF NOT EXISTS program_egzersizleri (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            program_id INTEGER NOT NULL,
            egzersiz_id INTEGER NOT NULL,
            gun TEXT CHECK(gun IN ('Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar')),
            set_sayisi INTEGER,
            tekrar_sayisi TEXT,
            notlar TEXT,
            FOREIGN KEY (program_id) REFERENCES antrenman_programlari(id),
            FOREIGN KEY (egzersiz_id) REFERENCES egzersizler(id)
          )`);

          // 9. MÜŞTERİ AKTİVİTELERİ TABLOSU (Giriş-çıkış ve aktivite takibi)
          this.db.run(`CREATE TABLE IF NOT EXISTS musteri_aktiviteleri (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            musteri_id INTEGER NOT NULL,
            aktivite_tipi TEXT DEFAULT 'Antrenman' CHECK(aktivite_tipi IN ('Antrenman', 'Kardiyo', 'Yoga', 'Pilates', 'Diğer')),
            baslangic_zamani DATETIME DEFAULT CURRENT_TIMESTAMP,
            bitis_zamani DATETIME,
            sure_dakika INTEGER,
            kalori_yakimi INTEGER,
            notlar TEXT,
            FOREIGN KEY (musteri_id) REFERENCES musteriler(id)
          )`);

          // 10. MÜŞTERİ ÖLÇÜLERİ TABLOSU
          this.db.run(`CREATE TABLE IF NOT EXISTS musteri_olculeri (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            musteri_id INTEGER NOT NULL,
            olcum_tarihi DATE NOT NULL,
            boy_cm DECIMAL(5,2),
            kilo_kg DECIMAL(5,2),
            bel_cevresi_cm DECIMAL(5,2),
            kalca_cevresi_cm DECIMAL(5,2),
            kol_cevresi_cm DECIMAL(5,2),
            boyun_cevresi_cm DECIMAL(5,2),
            vucut_yag_orani DECIMAL(4,2),
            kas_orani DECIMAL(4,2),
            notlar TEXT,
            olcum_zamani DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (musteri_id) REFERENCES musteriler(id)
          )`);

          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // Varsayılan verileri ekle
  insertDefaultData() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        try {
          // Varsayılan üyelik tiplerini ekle
          this.db.run(`INSERT OR IGNORE INTO uyelik_tipleri (id, tip_adi, sure_ay, fiyat, aciklama) VALUES 
            (1, 'Aylık Üyelik', 1, 1200.00, '1 aylık standart üyelik'),
            (2, '3 Aylık Üyelik', 3, 3200.00, '3 aylık indirimli üyelik'),
            (3, '6 Aylık Üyelik', 6, 6000.00, '6 aylık indirimli üyelik'),
            (4, 'Yıllık Üyelik', 12, 10000.00, 'Yıllık en avantajlı üyelik'),
            (5, 'Günlük Üyelik', 0, 50.00, 'Günlük tek seferlik giriş')
          `);

          // Varsayılan egzersiz kategorilerini ekle
          this.db.run(`INSERT OR IGNORE INTO egzersiz_kategorileri (id, kategori_adi, aciklama) VALUES 
            (1, 'Kardiyo', 'Kardiyovasküler egzersizler'),
            (2, 'Güç Antrenmanı', 'Kas güçlendirme egzersizleri'),
            (3, 'Esneklik', 'Stretching ve esneklik egzersizleri'),
            (4, 'Fonksiyonel', 'Günlük hareketleri geliştiren egzersizler'),
            (5, 'Yoga', 'Yoga ve meditasyon egzersizleri'),
            (6, 'Pilates', 'Pilates egzersizleri'),
            (7, 'HIIT', 'Yüksek yoğunluklu interval antrenman'),
            (8, 'CrossFit', 'CrossFit egzersizleri')
          `);

          // Varsayılan egzersizleri ekle
          this.db.run(`INSERT OR IGNORE INTO egzersizler (id, egzersiz_adi, kategori_id, aciklama, hedef_kas_grubu, zorluk_seviyesi) VALUES 
            (1, 'Koşu', 1, 'Treadmill veya açık alan koşusu', 'Alt vücut', 'Başlangıç'),
            (2, 'Bisiklet', 1, 'Sabit bisiklet veya açık alan', 'Alt vücut', 'Başlangıç'),
            (3, 'Jumping Jack', 1, 'Zıplama hareketi', 'Tüm vücut', 'Başlangıç'),
            (4, 'Squat', 2, 'Temel squat hareketi', 'Quadriceps, Gluteus', 'Başlangıç'),
            (5, 'Push-up', 2, 'Şınav hareketi', 'Göğüs, Triceps', 'Orta'),
            (6, 'Plank', 4, 'Plank pozisyonu', 'Core', 'Başlangıç'),
            (7, 'Lunge', 2, 'Lunge hareketi', 'Quadriceps, Gluteus', 'Orta'),
            (8, 'Burpee', 4, 'Burpee hareketi', 'Tüm vücut', 'İleri'),
            (9, 'Mountain Climber', 4, 'Dağ tırmanıcısı', 'Core, Omuz', 'Orta'),
            (10, 'Jump Squat', 2, 'Zıplamalı squat', 'Alt vücut', 'Orta'),
            (11, 'Deadlift', 2, 'Ölü kaldırma', 'Sırt, Bacak', 'İleri'),
            (12, 'Bench Press', 2, 'Bench press', 'Göğüs, Triceps', 'İleri'),
            (13, 'Pull-up', 2, 'Barfiks', 'Sırt, Biceps', 'İleri'),
            (14, 'Dumbbell Row', 2, 'Dumbbell row', 'Sırt', 'Orta'),
            (15, 'Overhead Press', 2, 'Omuz press', 'Omuz, Triceps', 'Orta'),
            (16, 'Romanian Deadlift', 2, 'Romen deadlift', 'Hamstring, Gluteus', 'Orta'),
            (17, 'Leg Press', 2, 'Bacak presi', 'Quadriceps', 'Orta'),
            (18, 'Chest Fly', 2, 'Göğüs fly', 'Göğüs', 'Orta'),
            (19, 'Lat Pulldown', 2, 'Lat pulldown', 'Sırt, Biceps', 'Başlangıç'),
            (20, 'Leg Extension', 2, 'Bacak extension', 'Quadriceps', 'Başlangıç'),
            (21, 'Leg Curl', 2, 'Bacak curl', 'Hamstring', 'Başlangıç'),
            (22, 'Calf Raise', 2, 'Baldır kaldırma', 'Gastrocnemius', 'Başlangıç'),
            (23, 'Russian Twist', 4, 'Rus burması', 'Core', 'Orta'),
            (24, 'Bicycle Crunch', 4, 'Bisiklet crunch', 'Core', 'Orta'),
            (25, 'Side Plank', 4, 'Yan plank', 'Core, Yan karın', 'Orta'),
            (26, 'Bird Dog', 4, 'Kuş köpek', 'Core', 'Başlangıç'),
            (27, 'Superman', 4, 'Süperman', 'Sırt', 'Başlangıç'),
            (28, 'Donkey Kick', 4, 'Eşek tekmesi', 'Gluteus', 'Başlangıç'),
            (29, 'Fire Hydrant', 4, 'Yangın musluğu', 'Gluteus', 'Başlangıç'),
            (30, 'Glute Bridge', 4, 'Kalça köprüsü', 'Gluteus, Hamstring', 'Başlangıç'),
            (31, 'Downward Dog', 5, 'Aşağı bakan köpek', 'Hamstring, Omuz', 'Başlangıç'),
            (32, 'Warrior Pose', 5, 'Savaşçı pozu', 'Bacak, Core', 'Başlangıç'),
            (33, 'Tree Pose', 5, 'Ağaç pozu', 'Denge, Bacak', 'Orta'),
            (34, 'Child Pose', 5, 'Çocuk pozu', 'Sırt, Kalça', 'Başlangıç'),
            (35, 'Cobra Pose', 5, 'Kobra pozu', 'Sırt', 'Başlangıç'),
            (36, 'Hundred', 6, 'Yüz', 'Core', 'Başlangıç'),
            (37, 'Roll Up', 6, 'Yuvarlanma', 'Core', 'Orta'),
            (38, 'Single Leg Stretch', 6, 'Tek bacak germe', 'Core', 'Orta'),
            (39, 'Double Leg Stretch', 6, 'Çift bacak germe', 'Core', 'Orta'),
            (40, 'Scissors', 6, 'Makas', 'Core, Bacak', 'Orta'),
            (41, 'Teaser', 6, 'Şaka', 'Core', 'İleri'),
            (42, 'Swan Dive', 6, 'Kuğu dalışı', 'Sırt', 'İleri'),
            (43, 'Open Leg Rocker', 6, 'Açık bacak sallama', 'Core', 'İleri'),
            (44, 'Corkscrew', 6, 'Tirbuşon', 'Core', 'İleri'),
            (45, 'Saw', 6, 'Testere', 'Core, Yan karın', 'Orta'),
            (46, 'Side Kick', 6, 'Yan tekme', 'Bacak, Yan karın', 'Orta'),
            (47, 'Front Support', 6, 'Ön destek', 'Omuz, Core', 'Orta'),
            (48, 'Back Support', 6, 'Arka destek', 'Triceps, Core', 'Orta'),
            (49, 'Side Support', 6, 'Yan destek', 'Yan karın, Omuz', 'Orta'),
            (50, 'Mermaid', 6, 'Deniz kızı', 'Yan karın, Bacak', 'Orta')
          `);

          // Varsayılan antrenman programını ekle
          this.db.run(`INSERT OR IGNORE INTO antrenman_programlari (id, musteri_id, program_adi, baslangic_tarihi, hedef, aktif) VALUES 
            (1, 1, 'Kilo Verme Programı', '2024-07-15', 'Kilo vermek ve kas yapmak', 1),
            (2, 2, 'Güç Antrenmanı', '2024-06-01', 'Kas kütlesi artırma', 1),
            (3, 3, 'Kardiyo Programı', '2024-08-01', 'Dayanıklılık artırma', 1),
            (4, 4, 'Yoga Programı', '2024-08-01', 'Esneklik ve denge', 1),
            (5, 5, 'Pilates Programı', '2024-08-01', 'Core güçlendirme', 1),
            (6, 6, 'HIIT Programı', '2024-08-01', 'Yağ yakımı', 1),
            (7, 7, 'CrossFit Programı', '2024-08-01', 'Fonksiyonel fitness', 1),
            (8, 8, 'Başlangıç Programı', '2024-08-01', 'Fitness temelleri', 1),
            (9, 9, 'İleri Seviye Program', '2024-08-01', 'Performans artırma', 1),
            (10, 10, 'Sporcu Programı', '2024-08-01', 'Atletik performans', 1)
          `);

          // Varsayılan giriş kayıtlarını ekle
          this.db.run(`INSERT OR IGNORE INTO musteri_aktiviteleri (id, musteri_id, aktivite_tipi, baslangic_zamani, sure_dakika) VALUES 
            (1, 1, 'Antrenman', '2024-08-13 10:30:00', 60),
            (2, 2, 'Kardiyo', '2024-08-13 14:15:00', 90),
            (3, 3, 'Antrenman', '2024-08-13 16:00:00', 60),
            (4, 4, 'Yoga', '2024-08-13 18:30:00', 60),
            (5, 5, 'Pilates', '2024-08-13 19:00:00', 45),
            (6, 6, 'HIIT', '2024-08-13 20:00:00', 30),
            (7, 7, 'CrossFit', '2024-08-13 21:00:00', 60),
            (8, 8, 'Antrenman', '2024-08-13 22:00:00', 45),
            (9, 9, 'Antrenman', '2024-08-13 23:00:00', 75),
            (10, 10, 'Kardiyo', '2024-08-13 24:00:00', 60),
            (11, 1, 'Kardiyo', '2024-08-14 09:00:00', 45),
            (12, 2, 'Antrenman', '2024-08-14 10:00:00', 60),
            (13, 3, 'Yoga', '2024-08-14 11:00:00', 60),
            (14, 4, 'Pilates', '2024-08-14 12:00:00', 45),
            (15, 5, 'HIIT', '2024-08-14 13:00:00', 30),
            (16, 6, 'CrossFit', '2024-08-14 14:00:00', 60),
            (17, 7, 'Antrenman', '2024-08-14 15:00:00', 60),
            (18, 8, 'Kardiyo', '2024-08-14 16:00:00', 45),
            (19, 9, 'Yoga', '2024-08-14 17:00:00', 60),
            (20, 10, 'Pilates', '2024-08-14 18:00:00', 45)
          `);

          // Varsayılan müşterileri ekle
          this.db.run(`INSERT OR IGNORE INTO musteriler (id, ad, soyad, telefon, email, tc_no, dogum_tarihi, cinsiyet, adres, acil_durum_kisi, acil_durum_telefon, notlar) VALUES 
            (1, 'Ahmet', 'Yılmaz', '0532 123 45 67', 'ahmet.yilmaz@email.com', '12345678901', '1990-05-15', 'Erkek', 'Atatürk Mah. Cumhuriyet Cad. No:123 İstanbul', 'Fatma Yılmaz', '0533 123 45 67', 'Kilo vermek istiyor'),
            (2, 'Ayşe', 'Demir', '0533 234 56 78', 'ayse.demir@email.com', '23456789012', '1988-12-20', 'Kadın', 'Çankaya Mah. İstiklal Sok. No:45 Ankara', 'Mehmet Demir', '0534 234 56 78', 'Kas yapmak istiyor'),
            (3, 'Mehmet', 'Kaya', '0534 345 67 89', 'mehmet.kaya@email.com', '34567890123', '1992-08-10', 'Erkek', 'Kızılay Mah. Kızılay Cad. No:67 Ankara', 'Zeynep Kaya', '0535 345 67 89', 'Dayanıklılık artırmak istiyor'),
            (4, 'Fatma', 'Özkan', '0535 456 78 90', 'fatma.ozkan@email.com', '45678901234', '1995-03-25', 'Kadın', 'Alsancak Mah. Kıbrıs Şehitleri Cad. No:89 İzmir', 'Ali Özkan', '0536 456 78 90', 'Esneklik ve denge için'),
            (5, 'Ali', 'Çelik', '0536 567 89 01', 'ali.celik@email.com', '56789012345', '1987-07-18', 'Erkek', 'Karşıyaka Mah. Atatürk Cad. No:12 İzmir', 'Ayşe Çelik', '0537 567 89 01', 'Core güçlendirme'),
            (6, 'Zeynep', 'Arslan', '0537 678 90 12', 'zeynep.arslan@email.com', '67890123456', '1993-11-30', 'Kadın', 'Nilüfer Mah. FSM Bulvarı No:34 Bursa', 'Mustafa Arslan', '0538 678 90 12', 'Yağ yakımı hedefi'),
            (7, 'Mustafa', 'Yıldız', '0538 789 01 23', 'mustafa.yildiz@email.com', '78901234567', '1989-04-12', 'Erkek', 'Osmangazi Mah. Heykel Cad. No:56 Bursa', 'Elif Yıldız', '0539 789 01 23', 'Fonksiyonel fitness'),
            (8, 'Elif', 'Koç', '0539 890 12 34', 'elif.koc@email.com', '89012345678', '1991-09-05', 'Kadın', 'Tepebaşı Mah. İsmet İnönü Cad. No:78 Eskişehir', 'Burak Koç', '0540 890 12 34', 'Fitness temelleri'),
            (9, 'Burak', 'Şahin', '0540 901 23 45', 'burak.sahin@email.com', '90123456789', '1986-06-22', 'Erkek', 'Odunpazarı Mah. Kurtuluş Cad. No:90 Eskişehir', 'Selin Şahin', '0541 901 23 45', 'Performans artırma'),
            (10, 'Selin', 'Aydın', '0541 012 34 56', 'selin.aydin@email.com', '01234567890', '1994-01-14', 'Kadın', 'Merkez Mah. Cumhuriyet Cad. No:23 Antalya', 'Emre Aydın', '0542 012 34 56', 'Atletik performans'),
            (11, 'Emre', 'Öztürk', '0542 123 45 67', 'emre.ozturk@email.com', '11111111111', '1990-10-08', 'Erkek', 'Muratpaşa Mah. Atatürk Cad. No:45 Antalya', 'Deniz Öztürk', '0543 123 45 67', 'Güç antrenmanı'),
            (12, 'Deniz', 'Korkmaz', '0543 234 56 78', 'deniz.korkmaz@email.com', '22222222222', '1988-02-28', 'Kadın', 'Kepez Mah. İstiklal Cad. No:67 Antalya', 'Can Korkmaz', '0544 234 56 78', 'Kardiyo odaklı'),
            (13, 'Can', 'Erdoğan', '0544 345 67 89', 'can.erdogan@email.com', '33333333333', '1992-12-03', 'Erkek', 'Aksu Mah. Cumhuriyet Cad. No:89 Antalya', 'Büşra Erdoğan', '0545 345 67 89', 'Esneklik antrenmanı'),
            (14, 'Büşra', 'Kurt', '0545 456 78 90', 'busra.kurt@email.com', '44444444444', '1995-07-17', 'Kadın', 'Döşemealtı Mah. Atatürk Cad. No:12 Antalya', 'Eren Kurt', '0546 456 78 90', 'Pilates seviyesi'),
            (15, 'Eren', 'Yalçın', '0546 567 89 01', 'eren.yalcin@email.com', '55555555555', '1987-11-25', 'Erkek', 'Konyaaltı Mah. Konyaaltı Cad. No:34 Antalya', 'Merve Yalçın', '0547 567 89 01', 'CrossFit başlangıç'),
            (16, 'Merve', 'Doğan', '0547 678 90 12', 'merve.dogan@email.com', '66666666666', '1993-04-09', 'Kadın', 'Lara Mah. Lara Cad. No:56 Antalya', 'Kaan Doğan', '0548 678 90 12', 'HIIT antrenmanı'),
            (17, 'Kaan', 'Özkan', '0548 789 01 23', 'kaan.ozkan@email.com', '77777777777', '1989-08-31', 'Erkek', 'Muratpaşa Mah. Falez Cad. No:78 Antalya', 'İrem Özkan', '0549 789 01 23', 'Yoga ve meditasyon'),
            (18, 'İrem', 'Çetin', '0549 890 12 34', 'irem.cetin@email.com', '88888888888', '1991-05-19', 'Kadın', 'Kepez Mah. Barış Cad. No:90 Antalya', 'Berk Çetin', '0550 890 12 34', 'Güç ve esneklik'),
            (19, 'Berk', 'Yılmaz', '0550 901 23 45', 'berk.yilmaz@email.com', '99999999999', '1986-03-11', 'Erkek', 'Aksu Mah. Huzur Cad. No:23 Antalya', 'Sude Yılmaz', '0551 901 23 45', 'Sporcu antrenmanı'),
            (20, 'Sude', 'Demir', '0551 012 34 56', 'sude.demir@email.com', '00000000000', '1994-12-07', 'Kadın', 'Döşemealtı Mah. Mutluluk Cad. No:45 Antalya', 'Arda Demir', '0552 012 34 56', 'Genel fitness')
          `);

          // Varsayılan üyelikleri ekle
          this.db.run(`INSERT OR IGNORE INTO uyelikler (id, musteri_id, uyelik_tipi_id, baslangic_tarihi, bitis_tarihi, ucret) VALUES 
            (1, 1, 1, '2024-08-01', '2024-09-01', 1200.00),
            (2, 2, 2, '2024-07-01', '2024-10-01', 3200.00),
            (3, 3, 3, '2024-06-01', '2024-12-01', 6000.00),
            (4, 4, 4, '2024-01-01', '2024-12-31', 10000.00),
            (5, 5, 1, '2024-08-01', '2024-09-01', 1200.00),
            (6, 6, 2, '2024-07-15', '2024-10-15', 3200.00),
            (7, 7, 3, '2024-06-15', '2024-12-15', 6000.00),
            (8, 8, 1, '2024-08-01', '2024-09-01', 1200.00),
            (9, 9, 4, '2024-03-01', '2025-03-01', 10000.00),
            (10, 10, 2, '2024-07-01', '2024-10-01', 3200.00),
            (11, 11, 1, '2024-08-01', '2024-09-01', 1200.00),
            (12, 12, 3, '2024-05-01', '2024-11-01', 6000.00),
            (13, 13, 2, '2024-07-01', '2024-10-01', 3200.00),
            (14, 14, 1, '2024-08-01', '2024-09-01', 1200.00),
            (15, 15, 4, '2024-02-01', '2025-02-01', 10000.00),
            (16, 16, 2, '2024-07-15', '2024-10-15', 3200.00),
            (17, 17, 3, '2024-06-01', '2024-12-01', 6000.00),
            (18, 18, 1, '2024-08-01', '2024-09-01', 1200.00),
            (19, 19, 2, '2024-07-01', '2024-10-01', 3200.00),
            (20, 20, 1, '2024-08-01', '2024-09-01', 1200.00)
          `);

          // Varsayılan ödemeleri ekle
          this.db.run(`INSERT OR IGNORE INTO odemeler (id, musteri_id, uyelik_id, odeme_tarihi, odenen_tutar, odeme_yontemi, odeme_durumu) VALUES 
            (1, 1, 1, '2024-08-01 10:00:00', 1200.00, 'Kart', 1),
            (2, 2, 2, '2024-07-01 14:30:00', 3200.00, 'Havale', 1),
            (3, 3, 3, '2024-06-01 16:45:00', 6000.00, 'Kart', 1),
            (4, 4, 4, '2024-01-01 09:15:00', 10000.00, 'Havale', 1),
            (5, 5, 5, '2024-08-01 11:20:00', 1200.00, 'Nakit', 1),
            (6, 6, 6, '2024-07-15 15:10:00', 3200.00, 'Kart', 1),
            (7, 7, 7, '2024-06-15 17:30:00', 6000.00, 'Havale', 1),
            (8, 8, 8, '2024-08-01 12:45:00', 1200.00, 'Nakit', 1),
            (9, 9, 9, '2024-03-01 10:00:00', 10000.00, 'Kart', 1),
            (10, 10, 10, '2024-07-01 13:20:00', 3200.00, 'Havale', 1),
            (11, 11, 11, '2024-08-01 14:15:00', 1200.00, 'Kart', 1),
            (12, 12, 12, '2024-05-01 16:00:00', 6000.00, 'Havale', 1),
            (13, 13, 13, '2024-07-01 18:30:00', 3200.00, 'Kart', 1),
            (14, 14, 14, '2024-08-01 19:45:00', 1200.00, 'Nakit', 1),
            (15, 15, 15, '2024-02-01 11:00:00', 10000.00, 'Havale', 1),
            (16, 16, 16, '2024-07-15 20:15:00', 3200.00, 'Kart', 1),
            (17, 17, 17, '2024-06-01 21:30:00', 6000.00, 'Havale', 1),
            (18, 18, 18, '2024-08-01 22:00:00', 1200.00, 'Nakit', 1),
            (19, 19, 19, '2024-07-01 23:15:00', 3200.00, 'Kart', 1),
            (20, 20, 20, '2024-08-01 08:30:00', 1200.00, 'Nakit', 1)
          `);

          // Varsayılan müşteri ölçülerini ekle
          this.db.run(`INSERT OR IGNORE INTO musteri_olculeri (id, musteri_id, olcum_tarihi, boy_cm, kilo_kg, bel_cevresi_cm, kalca_cevresi_cm, kol_cevresi_cm, boyun_cevresi_cm, vucut_yag_orani, kas_orani) VALUES 
            (1, 1, '2024-08-01', 175.5, 80.2, 95.0, 105.0, 32.0, 38.0, 22.5, 35.0),
            (2, 2, '2024-07-01', 162.0, 58.5, 72.0, 95.0, 28.5, 33.0, 18.0, 38.0),
            (3, 3, '2024-06-01', 180.0, 75.8, 82.0, 98.0, 33.0, 39.0, 15.0, 42.0),
            (4, 4, '2024-01-01', 168.0, 62.0, 70.0, 92.0, 27.0, 32.0, 20.0, 36.0),
            (5, 5, '2024-08-01', 178.0, 85.5, 98.0, 110.0, 35.0, 40.0, 25.0, 32.0),
            (6, 6, '2024-07-15', 165.0, 55.0, 68.0, 90.0, 26.5, 31.0, 16.0, 40.0),
            (7, 7, '2024-06-01', 182.0, 78.0, 85.0, 100.0, 34.0, 41.0, 17.0, 41.0),
            (8, 8, '2024-08-01', 170.0, 65.0, 75.0, 94.0, 28.0, 33.0, 21.0, 37.0),
            (9, 9, '2024-03-01', 185.0, 90.0, 100.0, 115.0, 37.0, 43.0, 28.0, 30.0),
            (10, 10, '2024-07-01', 160.0, 52.0, 66.0, 88.0, 25.5, 30.0, 15.0, 42.0),
            (11, 11, '2024-08-01', 177.0, 82.0, 96.0, 108.0, 34.5, 39.5, 23.0, 34.0),
            (12, 12, '2024-05-01', 163.0, 60.0, 73.0, 93.0, 28.0, 32.5, 19.0, 39.0),
            (13, 13, '2024-07-01', 179.0, 76.5, 83.0, 99.0, 33.5, 39.5, 16.0, 41.0),
            (14, 14, '2024-08-01', 167.0, 61.0, 71.0, 91.0, 27.5, 32.5, 20.5, 36.5),
            (15, 15, '2024-02-01', 183.0, 88.0, 99.0, 113.0, 36.5, 42.0, 27.0, 31.0),
            (16, 16, '2024-07-15', 164.0, 54.0, 69.0, 89.0, 26.0, 31.5, 17.0, 40.5),
            (17, 17, '2024-06-01', 181.0, 79.0, 86.0, 101.0, 34.5, 41.5, 18.0, 40.0),
            (18, 18, '2024-08-01', 169.0, 64.0, 74.0, 93.0, 27.5, 32.5, 20.0, 37.5),
            (19, 19, '2024-07-01', 184.0, 89.0, 99.5, 114.0, 36.0, 42.5, 27.5, 30.5),
            (20, 20, '2024-08-01', 161.0, 53.0, 67.0, 89.0, 26.0, 31.0, 16.5, 41.5)
          `);

          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // Veritabanı bağlantısını kapat
  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Veritabanı kapatılırken hata:', err.message);
        } else {
          console.log('Veritabanı bağlantısı kapatıldı');
        }
      });
    }
  }

  // Veritabanı durumunu kontrol et
  checkHealth() {
    return new Promise((resolve, reject) => {
      // Sadece temel bağlantıyı test et
      this.db.get('SELECT 1 as health', [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            message: 'Veritabanı bağlantısı başarılı'
          });
        }
      });
    });
  }

  // Veritabanı yedekle
  backup(backupPath) {
    return new Promise((resolve, reject) => {
      const backupDb = new sqlite3.Database(backupPath);
      
      this.db.backup(backupDb, (err) => {
        if (err) {
          reject(err);
        } else {
          backupDb.close();
          resolve({ message: 'Veritabanı başarıyla yedeklendi', path: backupPath });
        }
      });
    });
  }
}

module.exports = Database; 