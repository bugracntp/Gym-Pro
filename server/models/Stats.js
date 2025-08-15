const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Stats {
  constructor() {
    this.dbPath = path.join(__dirname, '../../database/asangym.sqlite');
    this.db = new sqlite3.Database(this.dbPath);
  }

  // Dashboard istatistiklerini getir
  getDashboardStats() {
    return new Promise(async (resolve, reject) => {
      try {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;

        // Toplam üye sayısı
        const totalMembers = await this.getTotalMembers();
        const lastMonthTotalMembers = await this.getTotalMembersByMonth(lastMonth, lastYear);
        
        // Aktif üye sayısı
        const activeMembers = await this.getActiveMembers();
        const lastMonthActiveMembers = await this.getActiveMembersByMonth(lastMonth, lastYear);
        
        // Toplam gelir
        const totalRevenue = await this.getTotalRevenue();
        
        // Aylık gelir
        const monthlyRevenue = await this.getMonthlyIncome(thisMonth, thisYear);
        const lastMonthRevenue = await this.getMonthlyIncome(lastMonth, lastYear);
        
        // Bugün giriş sayısı
        const todayEntries = await this.getTodayEntries();
        const lastMonthTodayEntries = await this.getTodayEntriesByMonth(lastMonth, lastYear);
        
        // Süresi dolan üyelik sayısı
        const expiringMemberships = await this.getExpiringMemberships();
        const lastMonthExpiringMemberships = await this.getExpiringMembershipsByMonth(lastMonth, lastYear);
        
        // Son aktiviteler
        const recentActivities = await this.getRecentActivities();

        // Değişim yüzdelerini hesapla
        const changes = {
          totalCustomers: this.calculateChange(totalMembers, lastMonthTotalMembers),
          activeMembers: this.calculateChange(activeMembers, lastMonthActiveMembers),
          totalRevenue: this.calculateChange(totalRevenue, totalRevenue), // Toplam gelir değişmez
          monthlyRevenue: this.calculateChange(monthlyRevenue, lastMonthRevenue),
          todayEntries: this.calculateChange(todayEntries, lastMonthTodayEntries),
          expiringMemberships: this.calculateChange(expiringMemberships, lastMonthExpiringMemberships)
        };

        resolve({
          totalCustomers: totalMembers,
          activeMembers,
          totalRevenue,
          monthlyRevenue,
          todayEntries,
          expiringMemberships,
          recentActivities,
          changes
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Toplam üye sayısını getir
  getTotalMembers() {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT COUNT(*) as count FROM musteriler WHERE aktif = 1', [], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.count : 0);
      });
    });
  }

  // Aktif üye sayısını getir
  getActiveMembers() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(DISTINCT m.id) as count
        FROM musteriler m
        JOIN uyelikler u ON m.id = u.musteri_id
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
        WHERE m.aktif = 1 
          AND u.aktif = 1 
          AND (o.odeme_durumu = 1 OR o.odeme_durumu IS NULL)
          AND u.bitis_tarihi >= DATE('now', 'localtime')
      `;
      
      this.db.get(query, [], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.count : 0);
      });
    });
  }

  // Aylık gelir hesapla
  getMonthlyIncome(month, year) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT SUM(odenen_tutar) as total
        FROM odemeler 
        WHERE strftime('%m', odeme_tarihi) = ? AND strftime('%Y', odeme_tarihi) = ?
      `;
      
      this.db.get(query, [String(month + 1).padStart(2, '0'), String(year)], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.total || 0 : 0);
      });
    });
  }

  // Bekleyen ödemeler sayısını getir
  getPendingPayments() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) as count
        FROM uyelikler u
        JOIN musteriler m ON u.musteri_id = m.id
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
        WHERE u.aktif = 1 AND (o.odeme_durumu = 0 OR o.odeme_durumu IS NULL)
      `;
      
      this.db.get(query, [], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.count : 0);
      });
    });
  }

  // Yıllık gelir grafiği için veri
  getYearlyIncome(year) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          strftime('%m', odeme_tarihi) as month,
          SUM(odenen_tutar) as total
        FROM odemeler 
        WHERE strftime('%Y', odeme_tarihi) = ?
        GROUP BY strftime('%m', odeme_tarihi)
        ORDER BY month
      `;
      
      this.db.all(query, [String(year)], (err, rows) => {
        if (err) reject(err);
        else {
          // 12 ay için tam veri oluştur
          const monthlyData = Array.from({ length: 12 }, (_, i) => {
            const month = String(i + 1).padStart(2, '0');
            const found = rows.find(row => row.month === month);
            return {
              month: month,
              total: found ? found.total : 0
            };
          });
          resolve(monthlyData);
        }
      });
    });
  }

  // Üyelik durumu dağılımı
  getMembershipDistribution() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          CASE 
            WHEN u.id IS NULL THEN 'Üyelik Yok'
            WHEN u.bitis_tarihi < DATE('now') THEN 'Süresi Dolmuş'
            WHEN u.bitis_tarihi <= DATE('now', '+7 days') THEN '7 Gün Kaldı'
            ELSE 'Aktif'
          END as status,
          COUNT(*) as count
        FROM musteriler m
        LEFT JOIN uyelikler u ON m.id = u.musteri_id AND u.aktif = 1
        WHERE m.aktif = 1
        GROUP BY status
      `;
      
      this.db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Son 30 gün giriş istatistikleri
  getRecentEntryStats() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          DATE(baslangic_zamani) as date,
          COUNT(*) as count
        FROM musteri_aktiviteleri 
        WHERE baslangic_zamani >= DATE('now', '-30 days')
        GROUP BY DATE(baslangic_zamani)
        ORDER BY date DESC
      `;
      
      this.db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Cinsiyet dağılımı
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

  // Yaş grupları dağılımı
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

  // Toplam gelir hesapla
  getTotalRevenue() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT SUM(odenen_tutar) as total
        FROM odemeler 
      `;
      
      this.db.get(query, [], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.total || 0 : 0);
      });
    });
  }

  // Bugün giriş sayısını getir
  getTodayEntries() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) as count
        FROM musteri_aktiviteleri 
        WHERE DATE(baslangic_zamani) = DATE('now')
      `;
      
      this.db.get(query, [], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.count : 0);
      });
    });
  }

  // Süresi dolan üyelik sayısını getir
  getExpiringMemberships() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) as count
        FROM uyelikler u
        JOIN musteriler m ON u.musteri_id = m.id
        WHERE u.aktif = 1 AND u.bitis_tarihi < DATE('now')
      `;
      
      this.db.get(query, [], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.count : 0);
      });
    });
  }

  // Son aktiviteleri getir
  getRecentActivities() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          'yeni_uye' as type,
          m.ad || ' ' || m.soyad as customer_name,
          m.kayit_tarihi as date,
          'Yeni üye kaydı' as description
        FROM musteriler m
        WHERE m.aktif = 1
        UNION ALL
        SELECT 
          'odeme' as type,
          m.ad || ' ' || m.soyad as customer_name,
          o.odeme_tarihi as date,
          'Ödeme alındı' as description
        FROM odemeler o
        JOIN musteriler m ON o.musteri_id = m.id
        UNION ALL
        SELECT 
          'giris' as type,
          m.ad || ' ' || m.soyad as customer_name,
          ma.baslangic_zamani as date,
          'Salon girişi' as description
        FROM musteri_aktiviteleri ma
        JOIN musteriler m ON ma.musteri_id = m.id
        ORDER BY date DESC
        LIMIT 10
      `;
      
      this.db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Değişim yüzdesini hesapla
  calculateChange(current, previous) {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${Math.round(change)}%`;
  }

  // Belirli bir ay için toplam üye sayısı
  getTotalMembersByMonth(month, year) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) as count 
        FROM musteriler 
        WHERE aktif = 1 AND strftime('%m', kayit_tarihi) = ? AND strftime('%Y', kayit_tarihi) = ?
      `;
      
      this.db.get(query, [String(month + 1).padStart(2, '0'), String(year)], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.count : 0);
      });
    });
  }

  // Belirli bir ay için aktif üye sayısı
  getActiveMembersByMonth(month, year) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(DISTINCT m.id) as count
        FROM musteriler m
        JOIN uyelikler u ON m.id = u.musteri_id
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
        WHERE m.aktif = 1 
          AND u.aktif = 1 
          AND (o.odeme_durumu = 1 OR o.odeme_durumu IS NULL)
          AND u.bitis_tarihi >= DATE('now', 'localtime')
          AND strftime('%m', u.baslangic_tarihi) = ? 
          AND strftime('%Y', u.baslangic_tarihi) = ?
      `;
      
      this.db.get(query, [String(month + 1).padStart(2, '0'), String(year)], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.count : 0);
      });
    });
  }

  // Belirli bir ay için bugün giriş sayısı
  getTodayEntriesByMonth(month, year) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) as count
        FROM musteri_aktiviteleri 
        WHERE strftime('%m', baslangic_zamani) = ? AND strftime('%Y', baslangic_zamani) = ?
      `;
      
      this.db.get(query, [String(month + 1).padStart(2, '0'), String(year)], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.count : 0);
      });
    });
  }

  // Belirli bir ay için süresi dolan üyelik sayısı
  getExpiringMembershipsByMonth(month, year) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) as count
        FROM uyelikler u
        JOIN musteriler m ON u.musteri_id = m.id
        WHERE u.aktif = 1 
        AND strftime('%m', u.bitis_tarihi) = ? 
        AND strftime('%Y', u.bitis_tarihi) = ?
        AND u.bitis_tarihi < DATE('now')
      `;
      
      this.db.get(query, [String(month + 1).padStart(2, '0'), String(year)], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.count : 0);
      });
    });
  }

  // Ödemesi yapılmayan müşterileri getir
  getUnpaidCustomers() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          m.id,
          m.ad || ' ' || m.soyad as ad_soyad,
          m.telefon,
          m.email,
          m.fotoğraf,
          ut.tip_adi as uyelik_tipi,
          u.baslangic_tarihi,
          u.bitis_tarihi,
          u.ucret,
          COALESCE(o.odeme_durumu, 0) as odeme_durumu,
          o.odeme_tarihi
        FROM musteriler m
        JOIN uyelikler u ON m.id = u.musteri_id
        JOIN uyelik_tipleri ut ON u.uyelik_tipi_id = ut.id
        LEFT JOIN (
          SELECT 
            uyelik_id,
            MAX(odeme_tarihi) as odeme_tarihi,
            CASE 
              WHEN SUM(CASE WHEN odeme_durumu = 1 THEN 1 ELSE 0 END) > 0 THEN 1
              ELSE 0
            END as odeme_durumu
          FROM odemeler 
          GROUP BY uyelik_id
        ) o ON u.id = o.uyelik_id
        WHERE m.aktif = 1 
          AND u.aktif = 1 
          AND (o.odeme_durumu = 0 OR o.odeme_durumu IS NULL)
          AND u.bitis_tarihi >= DATE('now', 'localtime')
        ORDER BY u.baslangic_tarihi ASC, m.ad ASC
      `;
      
      this.db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Veritabanı bağlantısını kapat
  close() {
    this.db.close();
  }
}

module.exports = Stats; 