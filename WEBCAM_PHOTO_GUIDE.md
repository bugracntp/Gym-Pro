# Webcam Fotoğraf Çekme Özelliği Kullanım Kılavuzu

## Özellik Açıklaması

Bu özellik sayesinde spor salonu yönetim uygulamasında müşteri kayıtları sırasında webcam üzerinden fotoğraf çekebilir ve bu fotoğrafları veritabanında saklayabilirsiniz.

## Kurulum

### 1. Migration Çalıştırma

Veritabanına fotoğraf sütunu eklemek için migration'ı çalıştırın:

```bash
npm run migrate
```

Bu komut `musteriler` tablosuna `fotoğraf` sütunu ekleyecektir.

### 2. Uygulamayı Başlatma

```bash
npm run dev
```

## Kullanım

### Yeni Müşteri Ekleme

1. **Müşteriler** sayfasına gidin
2. **Yeni Müşteri** butonuna tıklayın
3. Form'da **Fotoğraf** alanını bulun
4. **Fotoğraf Çek** butonuna tıklayın
5. Webcam modal'ı açılacak
6. **Fotoğraf Çek** butonuna tıklayarak fotoğraf çekin
7. **Fotoğrafı Kaydet** butonuna tıklayın
8. Form'u doldurun ve **Müşteri Ekle** butonuna tıklayın

### Mevcut Müşteri Düzenleme

1. **Müşteriler** sayfasında müşteri satırındaki **Düzenle** butonuna tıklayın
2. **Fotoğraf** alanında mevcut fotoğraf varsa görüntülenecek
3. **Fotoğrafı Değiştir** butonuna tıklayarak yeni fotoğraf çekin
4. **Güncelle** butonuna tıklayın

## Teknik Detaylar

### Veritabanı Yapısı

- **Tablo**: `musteriler`
- **Sütun**: `fotoğraf` (TEXT)
- **Format**: Base64 encoded JPEG
- **Index**: `idx_musteriler_fotograf`

### Bileşenler

- **WebcamCapture**: Webcam fotoğraf çekme modal'ı
- **AddCustomerForm**: Yeni müşteri ekleme formu (fotoğraf desteği ile)
- **EditCustomerForm**: Müşteri düzenleme formu (fotoğraf desteği ile)

### Fotoğraf Formatı

- **Çözünürlük**: 640x480 (ideal)
- **Format**: JPEG
- **Kalite**: 80%
- **Encoding**: Base64

## Güvenlik ve Performans

### Güvenlik
- Fotoğraflar sadece HTTPS üzerinden çekilebilir
- Kullanıcı izni gerekir
- Fotoğraflar veritabanında şifrelenmemiş olarak saklanır

### Performans
- Fotoğraflar sıkıştırılmış olarak saklanır
- Base64 formatı kullanılarak veritabanında saklanır
- Büyük fotoğraflar için boyut sınırlaması yoktur

## Sorun Giderme

### Kamera Erişim Hatası
- Tarayıcı izinlerini kontrol edin
- HTTPS kullanıldığından emin olun
- Kamera başka uygulama tarafından kullanılıyor olabilir

### Fotoğraf Yüklenmiyor
- Veritabanı bağlantısını kontrol edin
- Migration'ın çalıştığından emin olun
- Console hatalarını kontrol edin

### Performans Sorunları
- Büyük fotoğraflar için kaliteyi düşürün
- Veritabanı indekslerini kontrol edin

## Gelecek Geliştirmeler

- Fotoğraf boyutlandırma ve kırpma
- Toplu fotoğraf yükleme
- Fotoğraf arşivleme
- Fotoğraf sıkıştırma optimizasyonu
- Cloud storage entegrasyonu

## Destek

Herhangi bir sorun yaşarsanız:
1. Console hatalarını kontrol edin
2. Veritabanı bağlantısını test edin
3. Migration'ın başarıyla çalıştığından emin olun
4. Gerekirse uygulamayı yeniden başlatın 