import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import WebcamCapture from '../ui/WebcamCapture';
import { customerService } from '../../services';

const EditCustomerForm = ({ isOpen, onClose, customer, onCustomerUpdated }) => {
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
    fotoğraf: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);

  // Müşteri verisi geldiğinde form'u doldur
  useEffect(() => {
    if (customer) {
      // Tarih formatını düzelt (YYYY-MM-DD formatına çevir)
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
      };

      setFormData({
        ad: customer.ad || '',
        soyad: customer.soyad || '',
        telefon: customer.telefon || '',
        email: customer.email || '',
        tc_no: customer.tc_no || '',
        dogum_tarihi: formatDate(customer.dogum_tarihi),
        cinsiyet: customer.cinsiyet || '',
        adres: customer.adres || '',
        acil_durum_kisi: customer.acil_durum_kisi || '',
        acil_durum_telefon: customer.acil_durum_telefon || '',
        notlar: customer.notlar || '',
        fotoğraf: customer.fotoğraf || ''
      });
      setFormErrors({});
    }
  }, [customer]);

  // Form verilerini güncelle
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
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
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fotoğraf çekme işlemleri
  const handlePhotoCapture = (photoData) => {
    setFormData(prev => ({
      ...prev,
      fotoğraf: photoData
    }));
  };

  const removePhoto = () => {
    setFormData(prev => ({
      ...prev,
      fotoğraf: ''
    }));
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
        dogum_tarihi: formData.dogum_tarihi ? new Date(formData.dogum_tarihi).toISOString() : null
      };
      
      const result = await customerService.update(customer.id, formDataToSend);
      
      // Modal'ı kapat
      onClose();
      
      // Parent component'e bildir
      if (onCustomerUpdated) {
        onCustomerUpdated(result);
      }
      
      // Başarı mesajı göster
    } catch (error) {
      console.error('Müşteri güncellenirken hata:', error);
      
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
    setFormErrors({});
  };

  if (!customer) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Müşteri Bilgilerini Düzenle"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Ad Soyad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input.Text
            label="Ad"
            name="ad"
            value={formData.ad}
            onChange={handleInputChange}
            error={formErrors.ad}
            required
          />
          <Input.Text
            label="Soyad"
            name="soyad"
            value={formData.soyad}
            onChange={handleInputChange}
            error={formErrors.soyad}
            required
          />
        </div>

        {/* İletişim Bilgileri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input.Text
            label="Telefon"
            name="telefon"
            value={formData.telefon}
            onChange={handleInputChange}
            error={formErrors.telefon}
            required
          />
          <Input.Text
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            error={formErrors.email}
          />
        </div>

        {/* Kimlik Bilgileri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input.Text
            label="TC Kimlik No"
            name="tc_no"
            value={formData.tc_no}
            onChange={handleInputChange}
            error={formErrors.tc_no}
            maxLength={11}
          />
          <Input.Text
            label="Doğum Tarihi"
            name="dogum_tarihi"
            type="date"
            value={formData.dogum_tarihi}
            onChange={handleInputChange}
          />
        </div>

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

        {/* Cinsiyet ve Adres */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Input.Text
            label="Adres"
            name="adres"
            value={formData.adres}
            onChange={handleInputChange}
          />
        </div>

        {/* Acil Durum Bilgileri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input.Text
            label="Acil Durum Kişisi"
            name="acil_durum_kisi"
            value={formData.acil_durum_kisi}
            onChange={handleInputChange}
          />
          <Input.Text
            label="Acil Durum Telefonu"
            name="acil_durum_telefon"
            value={formData.acil_durum_telefon}
            onChange={handleInputChange}
          />
        </div>

        {/* Notlar */}
        <Input.Textarea
          label="Notlar"
          name="notlar"
          value={formData.notlar}
          onChange={handleInputChange}
          rows={3}
        />

        {/* Üyelik Bilgileri (Sadece Görüntüleme) */}
        {customer.uyelik_tipi_id && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Mevcut Üyelik Bilgileri</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">Üyelik Tipi</label>
                <p className="text-sm text-gray-900">{customer.uyelik_tipi || 'Belirtilmedi'}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
                <p className="text-sm text-gray-900">{customer.baslangic_tarihi || 'Belirtilmedi'}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
                <p className="text-sm text-gray-900">{customer.uyelik_bitis_tarihi || 'Belirtilmedi'}</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mt-3">
              Not: Üyelik bilgileri ayrı bir form üzerinden düzenlenebilir.
            </p>
          </div>
        )}

        {/* Form Actions */}
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
            Güncelle
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

export default EditCustomerForm; 