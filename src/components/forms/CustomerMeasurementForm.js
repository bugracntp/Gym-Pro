import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { customerMeasurementService } from '../../services';

const CustomerMeasurementForm = ({ isOpen, onClose, customer, onMeasurementAdded, onMeasurementUpdated, measurement = null, loading = false }) => {
  const [formData, setFormData] = useState({
    olcum_tarihi: '',
    boy_cm: '',
    kilo_kg: '',
    bel_cevresi_cm: '',
    kalca_cevresi_cm: '',
    kol_cevresi_cm: '',
    boyun_cevresi_cm: '',
    notlar: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vke, setVke] = useState(null);
  const [yagOrani, setYagOrani] = useState(null);

  // VKE hesaplama fonksiyonu
  const calculateVKE = (boy, kilo) => {
    if (boy && kilo && boy > 0 && kilo > 0) {
      const boyM = boy / 100;
      const vkeValue = kilo / (boyM * boyM);
      return vkeValue.toFixed(1);
    }
    return null;
  };

  // Navy metoduna göre yağ oranı hesaplama
  const calculateYagOrani = (boy, kilo, bel, kalca, boyun, cinsiyet) => {
    if (!boy || !kilo || !bel || !boyun || !cinsiyet) {
      return null;
    }
    
    const boyM = boy / 100;
    let yagOraniValue;
    
    if (cinsiyet === 'Erkek') {
      // Erkekler için Navy formülü: %BF = 495 / (1.0324 - 0.19077 × log10(waist - neck) + 0.15456 × log10(height)) - 450
      yagOraniValue = 495 / (1.0324 - 0.19077 * Math.log10(bel - boyun) + 0.15456 * Math.log10(boy)) - 450;
    } else if (cinsiyet === 'Kadın') {
      // Kadınlar için Navy formülü: %BF = 495 / (1.29579 - 0.35004 × log10(waist + hip - neck) + 0.22100 × log10(height)) - 450
      if (!kalca) return null;
      yagOraniValue = 495 / (1.29579 - 0.35004 * Math.log10(bel + kalca - boyun) + 0.22100 * Math.log10(boy)) - 450;
    } else {
      return null;
    }
    
    return Math.max(0, Math.min(100, yagOraniValue)).toFixed(1);
  };

  // Yağ oranı kategorisi belirleme
  const getYagOraniCategory = (yagOraniValue, cinsiyet) => {
    
    if (!yagOraniValue || !cinsiyet) return '';
    
    const yag = parseFloat(yagOraniValue);
    
    if (cinsiyet === 'Erkek') {
      if (yag < 6) return 'Çok Düşük';
      if (yag < 14) return 'Düşük';
      if (yag < 18) return 'Normal';
      if (yag < 25) return 'Yüksek';
      if (yag < 32) return 'Çok Yüksek';
      return 'Aşırı Yüksek';
    } else {
      if (yag < 14) return 'Çok Düşük';
      if (yag < 21) return 'Düşük';
      if (yag < 25) return 'Normal';
      if (yag < 32) return 'Yüksek';
      if (yag < 38) return 'Çok Yüksek';
      return 'Aşırı Yüksek';
    }
  };

  // Yağ oranı kategorisine göre renk belirleme
  const getYagOraniColor = (yagOraniValue, cinsiyet) => {
    if (!yagOraniValue || !cinsiyet) return 'gray';
    
    const yag = parseFloat(yagOraniValue);
    
    if (cinsiyet === 'Erkek') {
      if (yag < 18) return 'green';    // Normal ve altı - Yeşil
      if (yag < 25) return 'yellow';   // Yüksek - Sarı
      return 'red';                     // Çok yüksek ve üstü - Kırmızı
    } else {
      if (yag < 25) return 'green';    // Normal ve altı - Yeşil
      if (yag < 32) return 'yellow';   // Yüksek - Sarı
      return 'red';                     // Çok yüksek ve üstü - Kırmızı
    }
  };

  // Yağ oranı kategorisine göre CSS sınıfları
  const getYagOraniColorClasses = (yagOraniValue, cinsiyet) => {
    const color = getYagOraniColor(yagOraniValue, cinsiyet);
    switch (color) {
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'green':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'red':
        return 'bg-red-50 border-red-200 text-red-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  // Yağ oranı kategorisine göre metin renkleri
  const getYagOraniTextColorClasses = (yagOraniValue, cinsiyet) => {
    const color = getYagOraniColor(yagOraniValue, cinsiyet);
    switch (color) {
      case 'yellow':
        return 'text-yellow-700 text-yellow-600';
      case 'green':
        return 'text-green-700 text-green-600';
      case 'red':
        return 'text-red-700 text-red-600';
      default:
        return 'text-gray-700 text-gray-600';
    }
  };

  // VKE kategorisi belirleme
  const getVKECategory = (vkeValue) => {
    if (!vkeValue) return '';
    const vke = parseFloat(vkeValue);
    if (vke < 18.5) return 'Zayıf';
    if (vke < 25) return 'Normal';
    if (vke < 30) return 'Fazla Kilolu';
    if (vke < 35) return 'Obez (1. Derece)';
    if (vke < 40) return 'Obez (2. Derece)';
    return 'Aşırı Obez (3. Derece)';
  };

  // VKE kategorisine göre renk belirleme
  const getVKEColor = (vkeValue) => {
    if (!vkeValue) return 'gray';
    const vke = parseFloat(vkeValue);
    if (vke < 18.5) return 'yellow'; // Zayıf - Sarı
    if (vke < 25) return 'green';    // Normal - Yeşil
    if (vke < 30) return 'orange';   // Fazla Kilolu - Turuncu
    return 'red';                     // Obez - Kırmızı
  };

  // VKE kategorisine göre CSS sınıfları
  const getVKEColorClasses = (vkeValue) => {
    const color = getVKEColor(vkeValue);
    switch (color) {
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'green':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'orange':
        return 'bg-orange-50 border-orange-200 text-orange-900';
      case 'red':
        return 'bg-red-50 border-red-200 text-red-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  // VKE kategorisine göre metin renkleri
  const getVKETextColorClasses = (vkeValue) => {
    const color = getVKEColor(vkeValue);
    switch (color) {
      case 'yellow':
        return 'text-yellow-700 text-yellow-600';
      case 'green':
        return 'text-green-700 text-green-600';
      case 'orange':
        return 'text-orange-700 text-orange-600';
      case 'red':
        return 'text-red-700 text-red-600';
      default:
        return 'text-gray-700 text-gray-600';
    }
  };

  // Form başlığını belirle
  const isEditMode = !!measurement;
  const modalTitle = isEditMode ? 'Ölçü Düzenle' : 'Yeni Ölçü Ekle';

  // Form verilerini doldur
  useEffect(() => {
    if (isOpen && customer) {
      if (isEditMode && measurement) {
        // Düzenleme modunda mevcut verileri doldur
        setFormData({
          olcum_tarihi: measurement.olcum_tarihi || '',
          boy_cm: measurement.boy_cm || '',
          kilo_kg: measurement.kilo_kg || '',
          bel_cevresi_cm: measurement.bel_cevresi_cm || '',
          kalca_cevresi_cm: measurement.kalca_cevresi_cm || '',
          kol_cevresi_cm: measurement.kol_cevresi_cm || '',
          boyun_cevresi_cm: measurement.boyun_cevresi_cm || '',
          notlar: measurement.notlar || ''
        });
        // VKE'yi hesapla
        setVke(calculateVKE(measurement.boy_cm, measurement.kilo_kg));
        // Yağ oranını hesapla
        setYagOrani(calculateYagOrani(measurement.boy_cm, measurement.kilo_kg, measurement.bel_cevresi_cm, measurement.kalca_cevresi_cm, measurement.boyun_cevresi_cm, customer?.cinsiyet));
      } else {
        // Yeni ölçü modunda bugünün tarihini ayarla ve önceki ölçümleri yükle
        const today = new Date().toISOString().split('T')[0];
        
        // Önceki ölçümleri yüklemek için customer.measurements array'ini kontrol et
        let previousMeasurement = null;
        if (customer.measurements && customer.measurements.length > 0) {
          // En son ölçümü al (tarihe göre sırala)
          const sortedMeasurements = [...customer.measurements].sort((a, b) => 
            new Date(b.olcum_tarihi) - new Date(a.olcum_tarihi)
          );
          previousMeasurement = sortedMeasurements[0];
        }
        
        setFormData({
          olcum_tarihi: today,
          boy_cm: previousMeasurement?.boy_cm || '',
          kilo_kg: previousMeasurement?.kilo_kg || '',
          bel_cevresi_cm: previousMeasurement?.bel_cevresi_cm || '',
          kalca_cevresi_cm: previousMeasurement?.kalca_cevresi_cm || '',
          kol_cevresi_cm: previousMeasurement?.kol_cevresi_cm || '',
          boyun_cevresi_cm: previousMeasurement?.boyun_cevresi_cm || '',
          notlar: ''
        });
        
        // Önceki ölçüm varsa VKE ve yağ oranını hesapla
        if (previousMeasurement) {
          setVke(calculateVKE(previousMeasurement.boy_cm, previousMeasurement.kilo_kg));
          setYagOrani(calculateYagOrani(
            previousMeasurement.boy_cm, 
            previousMeasurement.kilo_kg, 
            previousMeasurement.bel_cevresi_cm, 
            previousMeasurement.kalca_cevresi_cm, 
            previousMeasurement.boyun_cevresi_cm, 
            customer?.cinsiyet
          ));
        } else {
          setVke(null);
          setYagOrani(null);
        }
      }
      setFormErrors({});
    }
  }, [isOpen, measurement, isEditMode, customer?.cinsiyet, customer?.measurements]);

  // Form verilerini güncelle
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Boy, kilo, bel, kalça veya boyun değiştiğinde VKE ve yağ oranını hesapla
    if (name === 'boy_cm' || name === 'kilo_kg' || name === 'bel_cevresi_cm' || name === 'kalca_cevresi_cm' || name === 'boyun_cevresi_cm') {
      const newBoy = name === 'boy_cm' ? value : formData.boy_cm;
      const newKilo = name === 'kilo_kg' ? value : formData.kilo_kg;
      const newBel = name === 'bel_cevresi_cm' ? value : formData.bel_cevresi_cm;
      const newKalca = name === 'kalca_cevresi_cm' ? value : formData.kalca_cevresi_cm;
      const newBoyun = name === 'boyun_cevresi_cm' ? value : formData.boyun_cevresi_cm;
      
      setVke(calculateVKE(newBoy, newKilo));
      setYagOrani(calculateYagOrani(newBoy, newKilo, newBel, newKalca, newBoyun, customer?.cinsiyet));
    }
    
    // Hata mesajını temizle
    if (formErrors[name]) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  // Form validasyonu
  const validateForm = () => {
    const errors = {};
    
    if (!formData.olcum_tarihi) errors.olcum_tarihi = 'Ölçüm tarihi zorunludur';
    
    // Sayısal değerler için validasyon
    if (formData.boy_cm && (parseFloat(formData.boy_cm) < 100 || parseFloat(formData.boy_cm) > 250)) {
      errors.boy_cm = 'Boy 100-250 cm arasında olmalıdır';
    }
    
    if (formData.kilo_kg && (parseFloat(formData.kilo_kg) < 30 || parseFloat(formData.kilo_kg) > 300)) {
      errors.kilo_kg = 'Kilo 30-300 kg arasında olmalıdır';
    }
    
    if (formData.bel_cevresi_cm && (parseFloat(formData.bel_cevresi_cm) < 50 || parseFloat(formData.bel_cevresi_cm) > 200)) {
      errors.bel_cevresi_cm = 'Bel çevresi 50-200 cm arasında olmalıdır';
    }
    
    if (formData.kalca_cevresi_cm && (parseFloat(formData.kalca_cevresi_cm) < 60 || parseFloat(formData.kalca_cevresi_cm) > 200)) {
      errors.kalca_cevresi_cm = 'Kalça çevresi 60-200 cm arasında olmalıdır';
    }
    
    if (formData.kol_cevresi_cm && (parseFloat(formData.kol_cevresi_cm) < 15 || parseFloat(formData.kol_cevresi_cm) > 80)) {
      errors.kol_cevresi_cm = 'Kol çevresi 15-80 cm arasında olmalıdır';
    }
    
    if (formData.boyun_cevresi_cm && (parseFloat(formData.boyun_cevresi_cm) < 30 || parseFloat(formData.boyun_cevresi_cm) > 100)) {
      errors.boyun_cevresi_cm = 'Boyun çevresi 30-100 cm arasında olmalıdır';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const measurementData = {
        musteri_id: customer?.id,
        ...formData,
        boy_cm: formData.boy_cm ? parseFloat(formData.boy_cm) : null,
        kilo_kg: formData.kilo_kg ? parseFloat(formData.kilo_kg) : null,
        bel_cevresi_cm: formData.bel_cevresi_cm ? parseFloat(formData.bel_cevresi_cm) : null,
        kalca_cevresi_cm: formData.kalca_cevresi_cm ? parseFloat(formData.kalca_cevresi_cm) : null,
        kol_cevresi_cm: formData.kol_cevresi_cm ? parseFloat(formData.kol_cevresi_cm) : null,
        boyun_cevresi_cm: formData.boyun_cevresi_cm ? parseFloat(formData.boyun_cevresi_cm) : null
      };

      let result;
      if (isEditMode) {
        result = await customerMeasurementService.update(measurement.id, measurementData);
        if (onMeasurementUpdated) {
          onMeasurementUpdated(result);
        }
      } else {
        result = await customerMeasurementService.create(measurementData);
        if (onMeasurementAdded) {
          onMeasurementAdded(result);
        }
      }
      
      // Modal'ı kapat
      onClose();
      
      // Başarı mesajı göster
      const action = isEditMode ? 'güncellendi' : 'eklendi';
    } catch (error) {
      console.error('Ölçü işlemi hatası:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal'ı kapat
  const closeModal = () => {
    onClose();
    setFormErrors({});
    // Form verilerini temizle
    setFormData({
      olcum_tarihi: '',
      boy_cm: '',
      kilo_kg: '',
      bel_cevresi_cm: '',
      kalca_cevresi_cm: '',
      kol_cevresi_cm: '',
      boyun_cevresi_cm: '',
      notlar: ''
    });
    setVke(null);
    setYagOrani(null);
  };

  if (!customer) return null;

  // Customer bilgileri eksikse formu gösterme
  if (!customer.id || !customer.ad || !customer.soyad) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={`${customer?.ad || ''} ${customer?.soyad || ''} - ${modalTitle}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Müşteri Bilgileri */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Müşteri Bilgileri</h4>
          <p className="text-sm text-blue-700">
            {customer?.ad} {customer?.soyad} - {customer?.telefon}
          </p>
          {customer?.cinsiyet && (
            <p className="text-sm text-blue-600 mt-1">
              Cinsiyet: {customer.cinsiyet === 'Erkek' ? 'Erkek' : 'Kadın'}
            </p>
          )}
        </div>

        {/* Loading Göstergesi */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-sm text-gray-600">Ölçüm bilgileri yükleniyor...</span>
          </div>
        )}

        {/* Form Alanları - Loading durumunda gizle */}
        {!loading && (
          <>
            {/* Ölçüm Tarihi */}
            <Input.Date
              label="Ölçüm Tarihi"
              name="olcum_tarihi"
              value={formData.olcum_tarihi}
              onChange={handleInputChange}
              error={formErrors.olcum_tarihi}
              required
            />

            {/* Temel Ölçüler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input.Number
                label="Boy (cm)"
                name="boy_cm"
                value={formData.boy_cm}
                onChange={handleInputChange}
                error={formErrors.boy_cm}
                placeholder="175"
                step="0.1"
                min="100"
                max="250"
              />
              
              <Input.Number
                label="Kilo (kg)"
                name="kilo_kg"
                value={formData.kilo_kg}
                onChange={handleInputChange}
                error={formErrors.kilo_kg}
                placeholder="70.5"
                step="0.1"
                min="30"
                max="300"
              />
            </div>

            {/* VKE ve Yağ Oranı Bilgisi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* VKE Bilgisi */}
              {vke && (
                <div className={`${getVKEColorClasses(vke)} border rounded-lg p-4`}>
                  <div>
                    <h4 className="text-sm font-medium">Vücut Kitle Endeksi (VKE)</h4>
                    <p className={`text-2xl font-bold ${getVKETextColorClasses(vke).split(' ')[0]}`}>{vke}</p>
                    <p className={`text-sm ${getVKETextColorClasses(vke).split(' ')[1]}`}>{getVKECategory(vke)}</p>
                  </div>
                </div>
              )}

              {/* Yağ Oranı Bilgisi */}
              {yagOrani && (
                <div className={`${getYagOraniColorClasses(yagOrani, customer.cinsiyet)} border rounded-lg p-4`}>
                  <div>
                    <h4 className="text-sm font-medium">Vücut Yağ Oranı (Navy Metodu)</h4>
                    <p className={`text-2xl font-bold ${getYagOraniTextColorClasses(yagOrani, customer.cinsiyet).split(' ')[0]}`}>{yagOrani}%</p>
                    <p className={`text-sm ${getYagOraniTextColorClasses(yagOrani, customer.cinsiyet).split(' ')[1]}`}>
                      {getYagOraniCategory(yagOrani, customer.cinsiyet)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Yağ Oranı Hesaplama Bilgisi */}
            {!yagOrani && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Yağ Oranı Hesaplama</h4>
                <p className="text-sm text-blue-700">
                  Yağ oranı hesaplanması için şu alanların doldurulması gerekiyor:
                </p>
                <div className="mt-2 text-sm text-blue-600">
                  <p>• Boy (cm)</p>
                  <p>• Bel Çevresi (cm)</p>
                  <p>• Boyun Çevresi (cm)</p>
                  {customer?.cinsiyet === 'Kadın' && <p>• Kalça Çevresi (cm) - Sadece kadınlar için</p>}
                </div>
              </div>
            )}

            {/* Önceki Ölçüm Bilgisi */}
            {!isEditMode && customer?.measurements && customer.measurements.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-900 mb-2">Önceki Ölçümler Yüklendi</h4>
                <p className="text-sm text-green-700">
                  Müşterinin en son ölçüm değerleri otomatik olarak yüklendi. Gerekirse bu değerleri güncelleyebilirsiniz.
                </p>
                <div className="mt-2 text-sm text-green-600">
                  <p>• Boy: {formData.boy_cm || 'Yok'}</p>
                  <p>• Kilo: {formData.kilo_kg || 'Yok'}</p>
                  <p>• Bel: {formData.bel_cevresi_cm || 'Yok'}</p>
                  <p>• Kalça: {formData.kalca_cevresi_cm || 'Yok'}</p>
                  <p>• Kol: {formData.kol_cevresi_cm || 'Yok'}</p>
                  <p>• Boyun: {formData.boyun_cevresi_cm || 'Yok'}</p>
                </div>
              </div>
            )}

            {/* VKE Referans Değerleri */}
            {vke && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">VKE Referans Değerleri</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
                  <div>
                    <p className="font-medium">18.5 altı: Zayıf</p>
                  </div>
                  <div>
                    <p className="font-medium">18.5-24.9: Normal</p>
                  </div>
                  <div>
                    <p className="font-medium">25-29.9: Fazla Kilolu</p>
                  </div>
                  <div>
                    <p className="font-medium">30+ : Obez</p>
                  </div>
                </div>
              </div>
            )}

            {/* Yağ Oranı Referans Değerleri */}
            {yagOrani && customer?.cinsiyet && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Yağ Oranı Referans Değerleri ({customer.cinsiyet})</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs text-gray-600">
                  {customer.cinsiyet === 'Erkek' ? (
                    <>
                      <div><p className="font-medium">6% altı: Çok Düşük</p></div>
                      <div><p className="font-medium">6-14%: Düşük</p></div>
                      <div><p className="font-medium">14-18%: Normal</p></div>
                      <div><p className="font-medium">18-25%: Yüksek</p></div>
                      <div><p className="font-medium">25-32%: Çok Yüksek</p></div>
                      <div><p className="font-medium">32% üstü: Aşırı Yüksek</p></div>
                    </>
                  ) : (
                    <>
                      <div><p className="font-medium">14% altı: Çok Düşük</p></div>
                      <div><p className="font-medium">14-21%: Düşük</p></div>
                      <div><p className="font-medium">21-25%: Normal</p></div>
                      <div><p className="font-medium">25-32%: Yüksek</p></div>
                      <div><p className="font-medium">32-38%: Çok Yüksek</p></div>
                      <div><p className="font-medium">38% üstü: Aşırı Yüksek</p></div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Çevre Ölçüleri */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input.Number
                label="Bel Çevresi (cm)"
                name="bel_cevresi_cm"
                value={formData.bel_cevresi_cm}
                onChange={handleInputChange}
                error={formErrors.bel_cevresi_cm}
                placeholder="80"
                step="0.1"
                min="50"
                max="200"
              />
              
              <Input.Number
                label="Kalça Çevresi (cm)"
                name="kalca_cevresi_cm"
                value={formData.kalca_cevresi_cm}
                onChange={handleInputChange}
                error={formErrors.kalca_cevresi_cm}
                placeholder="95"
                step="0.1"
                min="60"
                max="200"
              />
              
              <Input.Number
                label="Kol Çevresi (cm)"
                name="kol_cevresi_cm"
                value={formData.kol_cevresi_cm}
                onChange={handleInputChange}
                error={formErrors.kol_cevresi_cm}
                placeholder="30"
                step="0.1"
                min="15"
                max="80"
              />

              <Input.Number
                label="Boyun Çevresi (cm)"
                name="boyun_cevresi_cm"
                value={formData.boyun_cevresi_cm}
                onChange={handleInputChange}
                error={formErrors.boyun_cevresi_cm}
                placeholder="40"
                step="0.1"
                min="30"
                max="100"
              />
            </div>

            {/* Notlar */}
            <Input.Textarea
              label="Notlar"
              name="notlar"
              value={formData.notlar}
              onChange={handleInputChange}
              rows={3}
              placeholder="Ölçüm hakkında notlar..."
            />
          </>
        )}

        {/* Form Actions */}
        {!loading && (
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isEditMode ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default CustomerMeasurementForm; 