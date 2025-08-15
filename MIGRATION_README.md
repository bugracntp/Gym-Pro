# Veritabanı Migration: Ödeme Durumu Takibi

Bu migration, ödeme durumu takibini `uyelikler` tablosundan `odemeler` tablosuna taşır.

## 🎯 Amaç

- `uyelikler` tablosundan `odeme_durumu` alanını kaldır
- `odemeler` tablosuna `odeme_durumu` alanını ekle
- Ödeme durumu takibini sadece ödemeler tablosundan yap

## 📋 Yapılan Değişiklikler

### 1. Veritabanı Yapısı
- `uyelikler` tablosundan `odeme_durumu` sütunu kaldırıldı
- `odemeler` tablosuna `odeme_durumu` sütunu eklendi (INTEGER, 0/1)

### 2. Backend Modeller
- `Stats.js`: `getUnpaidCustomers` fonksiyonu güncellendi
- `Payment.js`: `updatePaymentStatus` fonksiyonu basitleştirildi
- `Customer.js`: Müşteri sorguları güncellendi
- `Membership.js`: Üyelik sorguları güncellendi

### 3. Frontend
- `Dashboard.js`: Ödeme durumu gösterimi güncellendi (1/0 → Ödendi/Ödenmedi)

## 🚀 Migration Çalıştırma

### Otomatik Migration
```bash
npm run migrate
```

### Manuel Migration
1. Veritabanı dosyasını yedekleyin
2. `server/migrations/run_migration.js` dosyasını çalıştırın
3. Hata durumunda yedekten geri yükleyin

## ⚠️ Önemli Notlar

1. **Yedek Alın**: Migration öncesi veritabanını yedekleyin
2. **Test Edin**: Migration sonrası uygulamayı test edin
3. **Geri Alma**: Hata durumunda yedekten geri yükleyin

## 🔄 Migration Sonrası

### Ödeme Durumu Değerleri
- **0**: Ödenmedi
- **1**: Ödendi

### Dashboard'da Görünüm
- Ödemesi yapılmayan müşteriler artık sadece ödemeler tablosundan kontrol ediliyor
- Ödeme yapıldığında liste otomatik güncelleniyor

## 🐛 Sorun Giderme

### Migration Hatası
```bash
# Hata loglarını kontrol edin
npm run migrate

# Manuel olarak migration script'ini çalıştırın
node server/migrations/run_migration.js
```

### Veri Kaybı
- Yedek dosyadan geri yükleyin
- Migration'ı tekrar çalıştırın

## 📞 Destek

Migration sırasında sorun yaşarsanız:
1. Hata mesajlarını kaydedin
2. Veritabanı yedeğini kontrol edin
3. Geliştirici ekibiyle iletişime geçin 