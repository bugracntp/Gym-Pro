# Ödeme Durumu Takibi Özelliği

Bu özellik, gym yönetim sisteminde müşteri ödemelerinin durumunu takip etmenizi sağlar.

## Özellikler

### 1. Ödeme Durumu Sütunu
- **odeme_durumu** sütunu eklendi
- **0**: Ödenmedi
- **1**: Ödendi

### 2. Yeni API Endpoint'leri

#### Ödeme Durumu Güncelleme
```
PATCH /api/payments/:id/status
Body: { "odeme_durumu": 0 veya 1 }
```

#### Ödenmemiş Ödemeleri Getir
```
GET /api/payments/unpaid
```

#### Ödenmiş Ödemeleri Getir
```
GET /api/payments/paid
```

### 3. Frontend Özellikleri

#### Ödeme Durumu Görüntüleme
- Her ödeme için durum badge'i (Ödendi/Ödenmedi)
- Renk kodlaması: Yeşil (Ödendi), Kırmızı (Ödenmedi)
- Tıklanabilir badge'ler (durumu değiştirmek için)

#### Filtreleme
- Tüm durumlar
- Sadece ödenenler
- Sadece ödenmeyenler

#### Arama
- Müşteri adı/soyadı
- Ödeme yöntemi

#### Özet Kartları
- Toplam ödeme sayısı
- Ödenen ödeme sayısı
- Ödenmeyen ödeme sayısı

## Kullanım

### 1. Ödeme Durumu Değiştirme
1. Ödemeler sayfasına gidin
2. İlgili ödemenin durum badge'ine tıklayın
3. Durum otomatik olarak değişecektir

### 2. Filtreleme
1. Üst kısımdaki dropdown'dan durum seçin
2. "Tüm Durumlar", "Ödenenler" veya "Ödenmeyenler"

### 3. Arama
1. Arama kutusuna müşteri adı veya ödeme yöntemi yazın
2. Sonuçlar anında filtrelenecektir

## Teknik Detaylar

### Veritabanı Değişiklikleri
- `odemeler` tablosuna `odeme_durumu` sütunu eklendi
- Varsayılan değer: 0 (Ödenmedi)
- Veri tipi: INTEGER

### Backend Değişiklikleri
- Payment model güncellendi
- Yeni controller metodları eklendi
- Yeni route'lar eklendi

### Frontend Değişiklikleri
- Payments sayfası güncellendi
- Ödeme durumu badge'leri eklendi
- Filtreleme ve arama özellikleri eklendi
- Özet kartları eklendi

## API Örnekleri

### Ödeme Durumu Güncelleme
```javascript
// Ödeme durumunu "Ödendi" yap
await paymentService.updatePaymentStatus(paymentId, 1);

// Ödeme durumunu "Ödenmedi" yap
await paymentService.updatePaymentStatus(paymentId, 0);
```

### Ödenmemiş Ödemeleri Getir
```javascript
const unpaidPayments = await paymentService.getUnpaidPayments();
```

### Ödenmiş Ödemeleri Getir
```javascript
const paidPayments = await paymentService.getPaidPayments();
```

## Güvenlik

- Tüm API endpoint'leri kimlik doğrulama gerektirir
- Sadece yetkili kullanıcılar ödeme durumu değiştirebilir
- Tüm değişiklikler loglanır

## Hata Yönetimi

- Geçersiz durum değerleri için validasyon
- Veritabanı hataları için uygun hata mesajları
- Frontend'de kullanıcı dostu hata bildirimleri

## Gelecek Geliştirmeler

- Ödeme hatırlatıcıları
- Otomatik ödeme takibi
- Ödeme raporları
- E-posta bildirimleri
- SMS hatırlatıcıları 