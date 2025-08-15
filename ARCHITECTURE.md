# Spor Salonu Yönetim Sistemi - Katmanlı Mimari

Bu proje, modern React uygulaması için katmanlı (layered) mimari kullanılarak yeniden yapılandırılmıştır.

## 🏗️ Mimari Yapısı

### 1. **Constants Layer** (`src/constants/`)
Uygulama genelinde kullanılan sabitler ve konfigürasyon değerleri.

- **`api.js`**: API endpoint'leri, HTTP metodları, status kodları
- **`app.js`**: Uygulama sabitleri, sayfa isimleri, modal tipleri

### 2. **Utils Layer** (`src/utils/`)
Yardımcı fonksiyonlar ve utility sınıfları.

- **`api.js`**: HTTP client, API yardımcıları, error handling
- **`helpers.js`**: Tarih formatlama, validasyon, string işlemleri

### 3. **Services Layer** (`src/services/`)
API iletişimi ve business logic.

- **`baseService.js`**: Tüm servisler için temel sınıf
- **`customerService.js`**: Müşteri işlemleri
- **`paymentService.js`**: Ödeme işlemleri
- **`statsService.js`**: İstatistik işlemleri

### 4. **Hooks Layer** (`src/hooks/`)
Custom React hooks.

- **`useApi.js`**: API çağrıları için hook'lar (useApi, useMutation, useInfiniteQuery)

### 5. **Components Layer** (`src/components/`)
UI bileşenleri, katmanlı olarak organize edilmiş.

#### 5.1 **UI Components** (`src/components/ui/`)
Yeniden kullanılabilir temel bileşenler:
- **`Button.js`**: Çoklu variant ve size desteği
- **`Modal.js`**: Modal bileşeni ve alt bileşenleri
- **`Input.js`**: Form input bileşenleri

#### 5.2 **Layout Components** (`src/components/layout/`)
Sayfa düzeni bileşenleri:
- **`Layout.js`**: Ana layout wrapper
- **`Sidebar.js`**: Navigasyon sidebar
- **`Header.js`**: Üst kısım header

#### 5.3 **Page Components** (`src/components/pages/`)
Sayfa bileşenleri:
- **`Dashboard.js`**: Ana dashboard
- **`Customers.js`**: Müşteri yönetimi
- **`Payments.js`**: Ödeme yönetimi
- **`Programs.js`**: Program yönetimi
- **`Entries.js`**: Giriş yönetimi
- **`Settings.js`**: Ayarlar

#### 5.4 **Auth Components** (`src/components/auth/`)
Kimlik doğrulama bileşenleri:
- **`LoginModal.js`**: Giriş modal'ı

## 🔄 Veri Akışı

```
UI Components → Hooks → Services → API → Database
     ↑           ↑        ↑        ↑
     └───────────┴────────┴────────┘
        State Management & Data Flow
```

## 🚀 Özellikler

### **API Layer**
- HTTP client wrapper
- Timeout handling
- Retry logic
- Error handling
- Request/response interceptors

### **State Management**
- Custom hooks ile API state yönetimi
- Loading, error, success state'leri
- Optimistic updates
- Infinite scroll desteği

### **UI Components**
- Responsive design
- Accessibility support
- Dark/light theme hazır
- Consistent design system

### **Error Handling**
- Global error boundary
- User-friendly error messages
- Retry mechanisms
- Fallback UI'lar

## 📁 Dizin Yapısı

```
src/
├── constants/          # Sabitler ve konfigürasyon
├── utils/             # Yardımcı fonksiyonlar
├── services/          # API servisleri
├── hooks/             # Custom React hooks
├── components/        # UI bileşenleri
│   ├── ui/           # Temel UI bileşenleri
│   ├── layout/       # Layout bileşenleri
│   ├── pages/        # Sayfa bileşenleri
│   ├── forms/        # Form bileşenleri
│   └── auth/         # Kimlik doğrulama
└── index.js          # Ana uygulama
```

## 🛠️ Kullanım Örnekleri

### **Service Kullanımı**
```javascript
import { customerService } from '../services/customerService';

// Müşteri listesi getir
const customers = await customerService.getAll();

// Yeni müşteri ekle
const newCustomer = await customerService.create(customerData);
```

### **Hook Kullanımı**
```javascript
import { useApi } from '../hooks/useApi';

const { data, loading, error, refetch } = useApi(
  customerService.getAll.bind(customerService)
);
```

### **Component Kullanımı**
```javascript
import Button from '../ui/Button';
import Modal from '../ui/Modal';

<Button variant="primary" size="lg" loading={loading}>
  Kaydet
</Button>
```

## 🔧 Geliştirme

### **Yeni Servis Ekleme**
1. `src/services/` altında yeni servis dosyası oluştur
2. `BaseService`'den extend et
3. Gerekli metodları implement et

### **Yeni Hook Ekleme**
1. `src/hooks/` altında yeni hook dosyası oluştur
2. React hooks kurallarına uy
3. TypeScript desteği ekle (opsiyonel)

### **Yeni Component Ekleme**
1. Uygun dizin altında component oluştur
2. Props interface tanımla
3. Storybook story ekle (opsiyonel)

## 📊 Performans Optimizasyonları

- **Code Splitting**: Sayfa bazında lazy loading
- **Memoization**: React.memo ve useMemo kullanımı
- **Bundle Optimization**: Tree shaking ve dead code elimination
- **Image Optimization**: Lazy loading ve responsive images

## 🔒 Güvenlik

- **Input Validation**: Tüm kullanıcı girdileri validate edilir
- **XSS Protection**: HTML injection koruması
- **CSRF Protection**: Cross-site request forgery koruması
- **Authentication**: JWT token tabanlı kimlik doğrulama

## 🧪 Test Stratejisi

- **Unit Tests**: Jest ile component ve utility testleri
- **Integration Tests**: API servis testleri
- **E2E Tests**: Cypress ile end-to-end testler
- **Visual Regression**: Storybook ile UI testleri

## 📈 Monitoring & Analytics

- **Error Tracking**: Sentry entegrasyonu
- **Performance Monitoring**: Web Vitals takibi
- **User Analytics**: Kullanıcı davranış analizi
- **API Monitoring**: Endpoint performans takibi

## 🚀 Deployment

- **Build Optimization**: Production build optimizasyonu
- **Environment Configuration**: Çevre bazlı konfigürasyon
- **CI/CD Pipeline**: Otomatik build ve deploy
- **Health Checks**: Uygulama sağlık kontrolü

---

Bu mimari, projenin ölçeklenebilirliğini, maintainability'sini ve developer experience'ını önemli ölçüde artırır. 