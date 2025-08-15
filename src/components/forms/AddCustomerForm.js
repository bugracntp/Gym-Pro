import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import WebcamCapture from '../ui/WebcamCapture';
import { membershipTypeService, paymentService, membershipService } from '../../services';
import api from '../../services/api';

const AddCustomerForm = ({ isOpen, onClose, onCustomerAdded }) => {
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    telefon: '',
    email: '',
    tc_no: '',
    dogum_tarihi: '',
    cinsiyet: '',
    adres: '',
    acil_durum_kisi: '',
    acil_durum_telefon: '',
    notlar: '',
    fotoğraf: '',
    // Üyelik bilgileri
    uyelik_tipi_id: '',
    baslangic_tarihi: '',
    ucret: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [membershipTypes, setMembershipTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);

  // Üyelik tiplerini yükle
  useEffect(() => {
    const loadMembershipTypes = async () => {
      setLoadingTypes(true);
      try {
        
        // Önce test endpoint'ini çağır
        try {
          const testResponse = await fetch('http://localhost:3001/api/membership-types/test');
          const testData = await testResponse.json();
          
          // Eğer hiç üyelik tipi yoksa test üyelik tipi ekle
          if (testData.count === 0) {
            const addResponse = await fetch('http://localhost:3001/api/membership-types/test-add', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            const addData = await addResponse.json();
          }
        } catch (testError) {
          console.error('Test endpoint hatası:', testError);
        }
        
        const types = await membershipTypeService.getAll();
        setMembershipTypes(types);
      } catch (error) {
        console.error('Üyelik tipleri yüklenirken hata:', error);
      } finally {
        setLoadingTypes(false);
      }
    };

    if (isOpen) {
      loadMembershipTypes();
      // Bugünün tarihini başlangıç tarihi olarak ayarla
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, baslangic_tarihi: today }));
    }
  }, [isOpen]);

  // Form verilerini güncelle
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Value undefined ise işlemi durdur
    if (value === undefined || value === null) {
      return;
    }
    
    // Üyelik tipi seçildiğinde fiyatı otomatik doldur
    if (name === 'uyelik_tipi_id') {
      
      const selectedType = membershipTypes.find(type => {
        return type && type.id && type.id.toString() === value.toString();
      });
      
      if (selectedType) {
        setFormData(prevData => ({
          ...prevData,
          [name]: value,
          ucret: selectedType.fiyat.toString()
        }));
      } else {
        // Üyelik tipi seçilmediğinde fiyatı temizle
        setFormData(prevData => ({
          ...prevData,
          [name]: value,
          ucret: ''
        }));
      }
    } else {
      // Diğer alanlar için normal güncelleme
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
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
    
    if (!formData.ad.trim()) errors.ad = 'Ad zorunludur';
    if (!formData.soyad.trim()) errors.soyad = 'Soyad zorunludur';
    if (!formData.telefon.trim()) errors.telefon = 'Telefon zorunludur';
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Geçerli bir email adresi giriniz';
    }
    
    if (formData.tc_no && formData.tc_no.length !== 11) {
      errors.tc_no = 'TC kimlik numarası 11 haneli olmalıdır';
    }

    // Üyelik validasyonu - string olarak kontrol et
    if (!formData.uyelik_tipi_id || formData.uyelik_tipi_id.toString().trim() === '') {
      errors.uyelik_tipi_id = 'Üyelik tipi seçiniz';
    }
    if (!formData.baslangic_tarihi) errors.baslangic_tarihi = 'Başlangıç tarihi zorunludur';
    if (!formData.ucret || parseFloat(formData.ucret) <= 0) errors.ucret = 'Geçerli bir ücret giriniz';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fotoğraf çekme işlemleri
  const handlePhotoCapture = (photoData) => {
    console.log('Fotoğraf yakalandı, form data güncelleniyor...');
    console.log('Fotoğraf boyutu:', photoData.length, 'karakter');
    setFormData(prev => ({
      ...prev,
      fotoğraf: photoData
    }));
    console.log('Fotoğraf form data\'ya eklendi');
  };

  const removePhoto = () => {
    console.log('Fotoğraf kaldırılıyor...');
    setFormData(prev => ({
      ...prev,
      fotoğraf: ''
    }));
    console.log('Fotoğraf form data\'dan kaldırıldı');
  };

  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Tarih formatını düzelt
      const formDataToSend = {
        ...formData,
        dogum_tarihi: formData.dogum_tarihi ? new Date(formData.dogum_tarihi).toISOString() : null,
        baslangic_tarihi: new Date(formData.baslangic_tarihi).toISOString(),
        ucret: parseFloat(formData.ucret)
      };
      
      const result = await api.post('/customers', formDataToSend);
      
      // Müşteri eklendikten sonra otomatik ödeme kaydı oluştur
      try {
        // Önce üyelik kaydı oluştur
        const selectedMembershipType = membershipTypes.find(type => type.id.toString() === formData.uyelik_tipi_id.toString());
        const membershipDurationDays = selectedMembershipType ? selectedMembershipType.sure_ay * 30 : 30; // Varsayılan 30 gün
        
        const membershipData = {
          musteri_id: result.id,
          uyelik_tipi_id: formData.uyelik_tipi_id,
          baslangic_tarihi: new Date(formData.baslangic_tarihi).toISOString(),
          bitis_tarihi: new Date(new Date(formData.baslangic_tarihi).getTime() + (membershipDurationDays * 24 * 60 * 60 * 1000)).toISOString(),
          ucret: parseFloat(formData.ucret)
        };
      
        const membershipResult = await membershipService.create(membershipData);
        
        // Şimdi ödeme kaydını oluştur
        const paymentData = {
          musteri_id: result.id,
          uyelik_id: membershipResult.id, // Oluşturulan üyelik ID'si
          odenen_tutar: parseFloat(formData.ucret),
          odeme_yontemi: 'nakit', // Varsayılan olarak nakit
          aciklama: `${formData.ad} ${formData.soyad} - ${formData.baslangic_tarihi} tarihli üyelik ödemesi`,
          odeme_durumu: 0, // 0: ödenmedi, 1: ödendi
          odeme_tarihi: null,
          created_at: new Date().toISOString()
        };
        
        await paymentService.create(paymentData);
      } catch (paymentError) {
        console.error('Ödeme kaydı oluşturulurken hata:', paymentError);
        // Ödeme kaydı oluşturulamasa bile müşteri ekleme işlemi başarılı
        // Kullanıcıya bilgi ver
      }
      
      // Modal'ı kapat
      onClose();
      
      // Form'u temizle
      setFormData({
        ad: '',
        soyad: '',
        telefon: '',
        email: '',
        tc_no: '',
        dogum_tarihi: '',
        cinsiyet: '',
        adres: '',
        acil_durum_kisi: '',
        acil_durum_telefon: '',
        notlar: '',
        fotoğraf: '',
        uyelik_tipi_id: '',
        baslangic_tarihi: '',
        ucret: ''
      });
      
      // Parent component'e bildir
      if (onCustomerAdded) {
        onCustomerAdded(result);
      }
      
      // Başarı mesajı göster
    } catch (error) {
      console.error('Müşteri eklenirken hata:', error);
      
      // Daha detaylı hata mesajı
      if (error.message.includes('API\'den beklenmeyen response type')) {
        console.error('API sunucusu çalışmıyor veya yanlış endpoint. Lütfen backend\'i kontrol edin.');
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('Ağ hatası. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        console.error(`Hata: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal'ı kapat
  const closeModal = () => {
    onClose();
    setFormData({
      ad: '',
      soyad: '',
      telefon: '',
      email: '',
      tc_no: '',
      dogum_tarihi: '',
      cinsiyet: '',
      adres: '',
      acil_durum_kisi: '',
      acil_durum_telefon: '',
      notlar: '',
      fotoğraf: '',
      uyelik_tipi_id: '',
      baslangic_tarihi: '',
      ucret: ''
    });
    setFormErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Yeni Müşteri Ekle"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ad */}
          <Input.Text
            label="Ad"
            name="ad"
            value={formData.ad}
            onChange={handleInputChange}
            error={formErrors.ad}
            required
            placeholder="Müşteri adı"
          />

          {/* Soyad */}
          <Input.Text
            label="Soyad"
            name="soyad"
            value={formData.soyad}
            onChange={handleInputChange}
            error={formErrors.soyad}
            required
            placeholder="Müşteri soyadı"
          />

          {/* Telefon */}
          <Input.Tel
            label="Telefon"
            name="telefon"
            value={formData.telefon}
            onChange={handleInputChange}
            error={formErrors.telefon}
            required
            placeholder="0555 123 45 67"
          />

          {/* Email */}
          <Input.Email
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            error={formErrors.email}
            placeholder="ornek@email.com"
          />

          {/* TC No */}
          <Input.Text
            label="TC Kimlik No"
            name="tc_no"
            value={formData.tc_no}
            onChange={handleInputChange}
            error={formErrors.tc_no}
            placeholder="12345678901"
            maxLength={11}
          />

          {/* Fotoğraf */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Fotoğraf
            </label>
            <div className="flex items-center space-x-3">
              {formData.fotoğraf ? (
                <div className="relative">
                  <img
                    src={formData.fotoğraf}
                    alt="Müşteri fotoğrafı"
                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-2xl">📷</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowWebcam(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                {formData.fotoğraf ? 'Fotoğrafı Değiştir' : 'Fotoğraf Çek'}
              </button>
            </div>
          </div>

          {/* Doğum Tarihi */}
          <Input.Date
            label="Doğum Tarihi"
            name="dogum_tarihi"
            value={formData.dogum_tarihi}
            onChange={handleInputChange}
          />

          {/* Cinsiyet */}
          <Input.Select
            label="Cinsiyet"
            name="cinsiyet"
            value={formData.cinsiyet}
            onChange={handleInputChange}
            options={[
              { value: '', label: 'Seçiniz' },
              { value: 'Erkek', label: 'Erkek' },
              { value: 'Kadın', label: 'Kadın' },
              { value: 'diğer', label: 'Diğer' }
            ]}
          />
        </div>

        {/* Adres */}
        <Input.Text
          label="Adres"
          name="adres"
          value={formData.adres}
          onChange={handleInputChange}
          placeholder="Müşteri adresi"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Acil Durum Kişisi */}
          <Input.Text
            label="Acil Durum Kişisi"
            name="acil_durum_kisi"
            value={formData.acil_durum_kisi}
            onChange={handleInputChange}
            placeholder="Ad soyad"
          />

          {/* Acil Durum Telefonu */}
          <Input.Tel
            label="Acil Durum Telefonu"
            name="acil_durum_telefon"
            value={formData.acil_durum_telefon}
            onChange={handleInputChange}
            placeholder="0555 123 45 67"
          />
        </div>

        {/* Notlar */}
        <Input.Textarea
          label="Notlar"
          name="notlar"
          value={formData.notlar}
          onChange={handleInputChange}
          rows={3}
          placeholder="Müşteri hakkında notlar..."
        />

        {/* Üyelik Bilgileri Bölümü */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Üyelik Bilgileri</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Üyelik Tipi */}
            <Input.Select
              label="Üyelik Tipi"
              name="uyelik_tipi_id"
              value={formData.uyelik_tipi_id}
              onChange={handleInputChange}
              error={formErrors.uyelik_tipi_id}
              required
              options={(() => {
                const options = [
                  { value: '', label: 'Seçiniz' },
                  ...membershipTypes
                    .filter(type => type && type.id) // Sadece geçerli ID'si olan tipleri al
                    .map(type => {
                      const option = {
                        value: type.id,
                        label: `${type.tip_adi || 'Bilinmeyen'} (${type.sure_ay || '?'} ay - ${type.fiyat || '0'}₺)`
                      };
                      return option;
                    })
                ];
                return options;
              })()}
            />

            {/* Başlangıç Tarihi */}
            <Input.Date
              label="Başlangıç Tarihi"
              name="baslangic_tarihi"
              value={formData.baslangic_tarihi}
              onChange={handleInputChange}
              error={formErrors.baslangic_tarihi}
              required
            />

            {/* Ücret */}
            <Input.Number
              label="Ücret (₺)"
              name="ucret"
              value={formData.ucret}
              onChange={handleInputChange}
              error={formErrors.ucret}
              required
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
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
            disabled={isSubmitting || loadingTypes}
          >
            {isSubmitting ? 'Ekleniyor...' : 'Müşteri Ekle'}
          </Button>
        </div>
      </form>

      {/* Webcam Modal */}
      <WebcamCapture
        isOpen={showWebcam}
        onClose={() => setShowWebcam(false)}
        onPhotoCapture={handlePhotoCapture}
      />
    </Modal>
  );
};

export default AddCustomerForm; 