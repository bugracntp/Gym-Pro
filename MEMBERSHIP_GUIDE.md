# 🏋️‍♂️ Spor Salonu Üyelik Sistemi - Kullanım Kılavuzu

## 🎯 Sistem Özellikleri

Bu sistem, spor salonu müşterilerinin üyeliklerini yönetmek ve devam ettirmek için geliştirilmiştir.

### ✅ Mevcut Özellikler

- **Üyelik Yönetimi**: Yeni üyelik ekleme, düzenleme, silme
- **Üyelik Tipleri**: Farklı süre ve fiyat seçenekleri
- **Üyelik Yenileme**: Mevcut üyeliği uzatma
- **Durum Takibi**: Aktif, süresi dolmak üzere, süresi dolmuş üyelikler
- **Ödeme Durumu**: Ödendi, bekliyor, gecikmiş
- **İstatistikler**: Toplam, aktif, süresi dolan üyelik sayıları

## 🚀 Kurulum ve Çalıştırma

### 1. Backend Başlatma
```bash
npm run server
```
Backend http://localhost:3001 adresinde çalışacak

### 2. Frontend Başlatma
```bash
npm start
```
Frontend http://localhost:3000 adresinde çalışacak

### 3. Tam Sistem Başlatma
```bash
npm run dev
```
Hem backend hem frontend aynı anda başlar

## 📱 Kullanım Adımları

### **Kullanıcı Üyeliğini Devam Ettirme**

#### 1. **Üyelik Durumunu Kontrol Etme**
- Sol menüden "Üyelikler" sayfasına tıklayın
- Müşteri adına göre üyelik durumunu görün
- Durum renkleri:
  - 🟢 **Yeşil**: Aktif üyelik
  - 🟡 **Sarı**: Süresi dolmak üzere (7 gün içinde)
  - 🔴 **Kırmızı**: Süresi dolmuş veya gecikmiş ödeme

#### 2. **Üyelik Yenileme (Devam Ettirme)**
- Üyelik listesinde ilgili müşteriyi bulun
- "🔄" (Yenile) butonuna tıklayın
- Sistem otomatik olarak:
  - Mevcut bitiş tarihini alır
  - Üyelik tipine göre yeni bitiş tarihi hesaplar
  - Ücreti günceller
  - Ödeme durumunu "Bekliyor" yapar

#### 3. **Yeni Üyelik Ekleme**
- "Yeni Üyelik" butonuna tıklayın
- Gerekli bilgileri doldurun:
  - **Müşteri**: Mevcut müşterilerden seçin
  - **Üyelik Tipi**: Süre ve fiyat seçenekleri
  - **Başlangıç Tarihi**: Üyeliğin başlayacağı tarih
  - **Bitiş Tarihi**: Üyeliğin biteceği tarih
  - **Ücret**: Üyelik ücreti
  - **Ödeme Durumu**: Ödendi/Bekliyor/Gecikmiş

#### 4. **Üyelik Düzenleme**
- Üyelik listesinde "✏️" (Düzenle) butonuna tıklayın
- Gerekli alanları güncelleyin
- "Güncelle" butonuna tıklayın

## 🔧 Teknik Detaylar

### **Backend API Endpoints**

```
GET    /api/memberships              # Tüm üyelikleri getir
GET    /api/memberships/:id          # ID'ye göre üyelik getir
POST   /api/memberships              # Yeni üyelik ekle
PUT    /api/memberships/:id          # Üyelik güncelle
DELETE /api/memberships/:id          # Üyelik sil
GET    /api/memberships/status/active # Aktif üyelikler
GET    /api/memberships/status/expiring/:days # Süresi dolmak üzere
GET    /api/memberships/status/expired # Süresi dolmuş
GET    /api/memberships/payment/:status # Ödeme durumuna göre
GET    /api/memberships/stats/overview # İstatistikler
```

### **Veritabanı Yapısı**

```sql
-- Üyelikler tablosu
CREATE TABLE uyelikler (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  musteri_id INTEGER,
  uyelik_tipi_id INTEGER,
  baslangic_tarihi DATE,
  bitis_tarihi DATE,
  ucret DECIMAL(10,2),
  odeme_durumu TEXT,
  kayit_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
  aktif INTEGER DEFAULT 1
);

-- Üyelik tipleri tablosu
CREATE TABLE uyelik_tipleri (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tip_adi TEXT,
  sure_ay INTEGER,
  fiyat DECIMAL(10,2),
  aciklama TEXT,
  aktif INTEGER DEFAULT 1
);
```

## 📊 Üyelik Durumları

### **Durum Renkleri ve Anlamları**

| Durum | Renk | Açıklama |
|-------|------|----------|
| **Aktif** | 🟢 Yeşil | Üyelik süresi devam ediyor |
| **Süresi Dolmak Üzere** | 🟡 Sarı | 7 gün içinde süresi dolacak |
| **Süresi Dolmuş** | 🔴 Kırmızı | Üyelik süresi sona erdi |
| **Gecikmiş Ödeme** | 🔴 Kırmızı | Ödeme gecikmiş |

### **Ödeme Durumları**

| Durum | Açıklama |
|-------|----------|
| **Ödendi** | Üyelik ücreti tamamen ödendi |
| **Bekliyor** | Ödeme bekleniyor |
| **Gecikmiş** | Ödeme gecikmiş |

## 🎯 Üyelik Yenileme Süreci

### **Otomatik Hesaplama**

Sistem üyelik yenileme sırasında:

1. **Mevcut bitiş tarihini** alır
2. **Üyelik tipine göre** yeni süreyi hesaplar
3. **Yeni bitiş tarihini** otomatik belirler
4. **Güncel ücreti** uygular
5. **Ödeme durumunu** "Bekliyor" yapar

### **Örnek Hesaplama**

```
Mevcut üyelik: 3 aylık (1 Ocak - 1 Nisan)
Yenileme tarihi: 15 Mart
Yeni bitiş: 1 Nisan + 3 ay = 1 Temmuz
```

## 🔍 Sorun Giderme

### **Yaygın Sorunlar**

#### 1. **Üyelik Yenilenemiyor**
- Müşteri bilgilerinin doğru olduğundan emin olun
- Üyelik tipinin aktif olduğunu kontrol edin
- Veritabanı bağlantısını test edin

#### 2. **Tarih Hataları**
- Tarih formatının YYYY-MM-DD olduğundan emin olun
- Geçmiş tarihleri kullanmayın
- Bitiş tarihinin başlangıçtan sonra olduğunu kontrol edin

#### 3. **API Hataları**
- Backend'in çalıştığından emin olun
- Port 3001'in açık olduğunu kontrol edin
- Console'da hata mesajlarını inceleyin

### **Log Kontrolü**

Backend log'larını kontrol etmek için:
```bash
# Terminal'de backend çıktısını izleyin
npm run server
```

## 📈 İstatistikler ve Raporlar

### **Dashboard İstatistikleri**

- **Toplam Üyelik**: Sistemdeki tüm üyelikler
- **Aktif Üyelik**: Süresi devam eden üyelikler
- **Süresi Dolmak Üzere**: 7 gün içinde süresi dolacak üyelikler
- **Ödeme Bekleyen**: Ödeme bekleyen üyelikler

### **Filtreleme ve Arama**

- Müşteri adına göre arama
- Üyelik tipine göre filtreleme
- Duruma göre filtreleme
- Tarih aralığına göre filtreleme

## 🚀 Gelecek Özellikler

### **Planlanan Geliştirmeler**

- [ ] **Otomatik Hatırlatmalar**: SMS/Email ile üyelik süresi uyarıları
- [ ] **Online Ödeme**: Kredi kartı ile online ödeme entegrasyonu
- [ ] **Mobil Uygulama**: Müşteriler için mobil üyelik yönetimi
- [ ] **Gelişmiş Raporlar**: Detaylı analiz ve grafikler
- [ ] **Bulk İşlemler**: Toplu üyelik yenileme
- [ ] **İndirim Sistemi**: Sadakat indirimleri ve kampanyalar

## 📞 Destek

### **Teknik Destek**

- **GitHub Issues**: Hata bildirimleri ve özellik istekleri
- **Dokümantasyon**: Bu kılavuz ve API dokümantasyonu
- **Log Dosyaları**: Backend ve frontend log'ları

### **İletişim**

- **Geliştirici**: AI Assistant
- **Proje**: Spor Salonu Yönetim Sistemi
- **Versiyon**: 1.0.0

---

## 🎉 Tebrikler!

Artık spor salonu üyelik sisteminiz tamamen çalışır durumda! Müşterileriniz üyeliklerini kolayca devam ettirebilir, yeni üyelikler ekleyebilir ve tüm üyelik durumlarını takip edebilirsiniz.

**Önemli**: Sistem ilk kez çalıştırıldığında, veritabanı otomatik olarak oluşturulacak ve örnek veriler eklenecektir.

**Güvenlik**: Admin şifresi varsayılan olarak "1" olarak ayarlanmıştır. Üretim ortamında mutlaka değiştirin! 