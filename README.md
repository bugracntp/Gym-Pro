# Spor Salonu Yönetim Uygulaması

Bu uygulama, spor salonu müşterilerini, ödemelerini ve üyeliklerini yönetmek için geliştirilmiş bir web uygulamasıdır.

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v14 veya üzeri)
- npm veya yarn

### Kurulum
1. Projeyi klonlayın:
```bash
git clone <repository-url>
cd gym
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

### Çalıştırma
Uygulamayı geliştirme modunda çalıştırmak için:

```bash
npm run dev
```

Bu komut hem backend (port 3001) hem de frontend (port 3000) server'larını başlatacaktır.

Alternatif olarak, sadece backend'i çalıştırmak için:
```bash
npm run server
```

Sadece frontend'i çalıştırmak için:
```bash
npm start
```

## 🎯 Özellikler

### ✅ Tamamlanan Özellikler
- **Müşteri Yönetimi**: Yeni müşteri ekleme, düzenleme, silme
- **Veritabanı Entegrasyonu**: SQLite veritabanı ile tam entegrasyon
- **Modern UI**: Tailwind CSS ile responsive tasarım
- **Form Validasyonu**: Kapsamlı form validasyonu ve hata yönetimi

### 🔄 Geliştirilmekte Olan Özellikler
- Ödeme yönetimi
- Üyelik yönetimi
- Giriş/çıkış takibi
- Raporlama ve istatistikler

## 🧪 Test Etme

### Müşteri Ekleme İşlevi Testi

1. Uygulamayı başlatın: `npm run dev`
2. Browser'da `http://localhost:3000` adresine gidin
3. Sol menüden "Müşteriler" sayfasına tıklayın
4. "Yeni Müşteri" butonuna tıklayın
5. Modal açılacak ve form görünecektir
6. Gerekli alanları doldurun:
   - **Ad** (zorunlu)
   - **Soyad** (zorunlu)
   - **Telefon** (zorunlu)
   - **Email** (opsiyonel)
   - **TC Kimlik No** (opsiyonel, 11 haneli)
   - **Doğum Tarihi** (opsiyonel)
   - **Cinsiyet** (opsiyonel)
   - **Adres** (opsiyonel)
   - **Acil Durum Kişisi** (opsiyonel)
   - **Acil Durum Telefonu** (opsiyonel)
   - **Notlar** (opsiyonel)
7. "Müşteri Ekle" butonuna tıklayın
8. Başarılı olursa modal kapanacak ve müşteri listesinde yeni müşteri görünecektir

### API Testi

Backend API'sini test etmek için:

```bash
# Müşteri listesini getir
curl http://localhost:3001/api/customers

# Yeni müşteri ekle
curl -X POST http://localhost:3001/api/customers \
  -H "Content-Type: application/json" \
  -d '{"ad":"Test","soyad":"Müşteri","telefon":"05551234567"}'

# Server sağlık kontrolü
curl http://localhost:3001/health
```

## 🏗️ Proje Yapısı

```
gym/
├── src/                    # Frontend kaynak kodları
│   ├── components/         # React bileşenleri
│   │   ├── ui/            # UI bileşenleri (Button, Input, Modal)
│   │   ├── pages/         # Sayfa bileşenleri
│   │   └── layout/        # Layout bileşenleri
│   ├── services/          # API servisleri
│   ├── hooks/             # Custom React hooks
│   └── constants/         # Sabitler
├── server/                 # Backend kaynak kodları
│   ├── models/            # Veritabanı modelleri
│   ├── controllers/       # İş mantığı kontrolcüleri
│   ├── routes/            # API route'ları
│   ├── utils/             # Yardımcı fonksiyonlar
│   └── index.js           # Ana server dosyası
├── database.sqlite         # SQLite veritabanı
└── package.json           # Proje bağımlılıkları
```

## 🔧 Teknik Detaylar

### Frontend
- **React 18** - Modern React hooks ve functional components
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon kütüphanesi
- **Custom Hooks** - API entegrasyonu için özel hooks

### Backend
- **Express.js** - Node.js web framework
- **SQLite3** - Hafif, dosya tabanlı veritabanı
- **RESTful API** - Standart HTTP metodları
- **Middleware** - CORS, body parsing, error handling

### Veritabanı
- **SQLite** - Tek dosya veritabanı
- **Normalized Schema** - İlişkisel veri yapısı
- **Foreign Keys** - Referential integrity
- **Indexes** - Performans optimizasyonu

## 🐛 Bilinen Sorunlar

- PowerShell'de Türkçe karakterlerle curl komutları sorun çıkarabilir
- Node.js v14'te fetch API mevcut değil (built-in http modülü kullanılıyor)

## 📝 Geliştirme Notları

### Müşteri Ekleme İşlevi
- Form validasyonu client-side yapılıyor
- Backend'de de ek validasyon mevcut
- Başarılı ekleme sonrası liste otomatik yenileniyor
- Modal form state'i temizleniyor

### Veritabanı
- SQLite veritabanı otomatik oluşturuluyor
- Tablolar ve örnek veriler otomatik ekleniyor
- Soft delete kullanılıyor (aktif = 0)

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Sorularınız için issue açabilir veya pull request gönderebilirsiniz. 