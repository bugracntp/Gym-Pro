import React, { useState } from 'react';
import { CreditCard, Plus, Search, Eye, Download, CheckCircle, XCircle, Filter, Edit, Trash2, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const Payments = ({ payments, loading, error, customers, memberships, onUpdatePaymentStatus, onAddPayment, onEditPayment, onDeletePayment }) => {
  const [statusFilter, setStatusFilter] = useState('all'); // all, paid, unpaid
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState({});
  const [formData, setFormData] = useState({
    musteri_id: '',
    uyelik_id: '',
    ad: '',
    soyad: '',
    odenen_tutar: '',
    odeme_yontemi: 'Nakit',
    odeme_tarihi: '',
    odeme_durumu: 0,
    aciklama: ''
  });

  // Seçilen müşteri bilgileri
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Müşteri seçimi
  const handleCustomerSelect = (customerId) => {
    const customer = customers?.find(c => c.id === parseInt(customerId));
    if (customer) {
      setSelectedCustomer(customer);
      setFormData(prev => ({
        ...prev,
        musteri_id: customer.id,
        ad: customer.ad || '',
        soyad: customer.soyad || '',
        uyelik_id: '' // Üyelik seçimini sıfırla
      }));
    }
  };

  // Üyelik seçimi
  const handleMembershipSelect = (membershipId) => {
    const membership = memberships?.find(m => m.id === parseInt(membershipId));
    setFormData(prev => ({
      ...prev,
      uyelik_id: membershipId,
      odenen_tutar: membership?.ucret || prev.odenen_tutar
    }));
  };

  // Seçilen müşteriye ait üyelikleri filtrele
  const customerMemberships = selectedCustomer 
    ? memberships?.filter(m => m.musteri_id === selectedCustomer.id) || []
    : memberships || [];
  
  // Başarı mesajını göster
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Modal'ları kapat ve state'leri temizle
  const closeAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedPayment(null);
    resetForm();
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedPayment(null);
  };

  // Form validasyonu
  const validateForm = () => {
    const errors = {};
    
    if (!formData.musteri_id) {
      errors.musteri_id = 'Müşteri ID zorunludur';
    }
    
    if (!formData.uyelik_id) {
      errors.uyelik_id = 'Üyelik ID zorunludur';
    }
    
    if (!formData.ad.trim()) {
      errors.ad = 'Ad alanı zorunludur';
    }
    
    if (!formData.soyad.trim()) {
      errors.soyad = 'Soyad alanı zorunludur';
    }
    
    if (!formData.odenen_tutar || parseFloat(formData.odenen_tutar) <= 0) {
      errors.odenen_tutar = 'Geçerli bir tutar giriniz';
    }
    
    if (!formData.odeme_tarihi) {
      errors.odeme_tarihi = 'Ödeme tarihi zorunludur';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form verilerini sıfırla
  const resetForm = () => {
    setFormData({
      musteri_id: '',
      uyelik_id: '',
      ad: '',
      soyad: '',
      odenen_tutar: '',
      odeme_yontemi: 'Nakit',
      odeme_tarihi: '',
      odeme_durumu: 0,
      aciklama: ''
    });
    setFormErrors({});
    setSelectedCustomer(null);
  };

  // Yeni ödeme ekleme modal'ını aç
  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Düzenleme modal'ını aç
  const openEditModal = (payment) => {
    setSelectedPayment(payment);
    
    // Müşteri bilgilerini bul
    const customer = customers?.find(c => c.id === payment.musteri_id);
    setSelectedCustomer(customer);
    
    setFormData({
      musteri_id: payment.musteri_id || '',
      uyelik_id: payment.uyelik_id || '',
      ad: payment.ad || '',
      soyad: payment.soyad || '',
      odenen_tutar: payment.odenen_tutar || '',
      odeme_yontemi: payment.odeme_yontemi || 'Nakit',
      odeme_tarihi: payment.odeme_tarihi ? payment.odeme_tarihi.split('T')[0] : '',
      odeme_durumu: payment.odeme_durumu || 0,
      aciklama: payment.aciklama || ''
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  // Silme modal'ını aç
  const openDeleteModal = (payment) => {
    setSelectedPayment(payment);
    setShowDeleteModal(true);
  };

  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setFormLoading(true);
    
    try {
      if (showAddModal && onAddPayment) {
        await onAddPayment(formData);
        showSuccessMessage('Ödeme başarıyla eklendi!');
        closeAddModal();
      } else if (showEditModal && onEditPayment && selectedPayment) {
        await onEditPayment(selectedPayment.id, formData);
        showSuccessMessage('Ödeme başarıyla güncellendi!');
        closeEditModal();
      }
    } catch (error) {
      console.error('Form gönderim hatası:', error);
    } finally {
      setFormLoading(false);
    }
  };

  // Ödeme silme
  const handleDelete = async () => {
    if (onDeletePayment && selectedPayment) {
      setFormLoading(true);
      try {
        await onDeletePayment(selectedPayment.id);
        showSuccessMessage('Ödeme başarıyla silindi!');
        closeDeleteModal();
      } catch (error) {
        console.error('Silme hatası:', error);
      } finally {
        setFormLoading(false);
      }
    }
  };

  // CSV Export
  const handleExport = () => {
    if (filteredPayments.length === 0) {
      return;
    }

    const headers = ['Ad', 'Soyad', 'Tutar (₺)', 'Ödeme Yöntemi', 'Tarih', 'Durum', 'Açıklama'];
    const csvData = filteredPayments.map(payment => [
      payment.ad || '',
      payment.soyad || '',
      payment.odenen_tutar || 0,
      payment.odeme_yontemi || 'Nakit',
      payment.odeme_tarihi ? new Date(payment.odeme_tarihi).toLocaleDateString('tr-TR') : '',
      payment.odeme_durumu === 1 ? 'Ödendi' : 'Ödenmedi',
      payment.aciklama || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `odemeler_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccessMessage('Ödemeler başarıyla export edildi!');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-red-800">
          Ödemeler yüklenirken hata oluştu
        </h3>
        <p className="mt-2 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  // Default payments (API'den veri gelmezse)
  const defaultPayments = payments || [];

  // Filtreleme ve arama
  const filteredPayments = defaultPayments.filter(payment => {
    const matchesSearch = payment.ad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.soyad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.odeme_yontemi?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'paid' && payment.odeme_durumu === 1) ||
                         (statusFilter === 'unpaid' && payment.odeme_durumu === 0);
    
    // Tarih aralığı kontrolü
    let matchesDate = true;
    if (dateFilter.startDate && payment.odeme_tarihi) {
      const paymentDate = new Date(payment.odeme_tarihi);
      const startDate = new Date(dateFilter.startDate);
      if (paymentDate < startDate) {
        matchesDate = false;
      }
    }
    if (dateFilter.endDate && payment.odeme_tarihi) {
      const paymentDate = new Date(payment.odeme_tarihi);
      const endDate = new Date(dateFilter.endDate);
      endDate.setHours(23, 59, 59); // Günün sonuna kadar
      if (paymentDate > endDate) {
        matchesDate = false;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Ödeme durumu değiştir
  const handleStatusChange = async (paymentId, newStatus) => {
    
    try {
      setStatusUpdateLoading(prev => ({ ...prev, [paymentId]: true }));
      
      if (onUpdatePaymentStatus) {
        await onUpdatePaymentStatus(paymentId, newStatus);
        const statusText = newStatus === 1 ? 'Ödendi' : 'Ödenmedi';
        showSuccessMessage(`Ödeme durumu başarıyla ${statusText} olarak güncellendi!`);
      } 
    } catch (error) {
      console.error('Ödeme durumu güncellenirken hata:', error);
      // Hata mesajını göster
      setSuccessMessage('Ödeme durumu güncellenirken hata oluştu!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setStatusUpdateLoading(prev => ({ ...prev, [paymentId]: false }));
    }
  };

  // Ödeme durumu badge'i
  const PaymentStatusBadge = ({ status, onClick, paymentId }) => {
    const isPaid = status === 1;
    const isLoading = statusUpdateLoading[paymentId];
    
    return (
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
          isPaid 
            ? 'bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50' 
            : 'bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50'
        }`}
        title={onClick ? (isLoading ? 'Güncelleniyor...' : 'Durumu değiştirmek için tıklayın') : ''}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
            Güncelleniyor...
          </>
        ) : isPaid ? (
          <>
            <CheckCircle size={12} className="mr-1" />
            Ödendi
          </>
        ) : (
          <>
            <XCircle size={12} className="mr-1" />
            Ödenmedi
          </>
        )}
      </button>
    );
  };

  // Modal bileşeni
  const PaymentModal = ({ isOpen, onClose, title, children, onSubmit }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={onSubmit} className="p-6 space-y-4">
            {children}
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <p className="text-sm font-medium text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ödemeler</h1>
          <p className="text-gray-600">
            Ödeme işlemleri ve finansal takip
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={openAddModal}
        >
          Yeni Ödeme
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-4">
          {/* Arama */}
          <div className="flex-1">
            <Input.Search
              placeholder="Ödeme ara..."
              leftIcon={<Search size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filtreler */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="paid">Ödenenler</option>
                <option value="unpaid">Ödenmeyenler</option>
              </select>
              <Button variant="outline" size="sm" onClick={handleExport}>
                Export
              </Button>
            </div>
            
            {/* Tarih Filtreleri */}
            <div className="flex gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Başlangıç</label>
                <input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Bitiş</label>
                <input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDateFilter({ startDate: '', endDate: '' })}
                className="self-end"
              >
                Temizle
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Ödeme Durumu Özeti */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Ödeme</p>
              <p className="text-2xl font-bold text-gray-900">{filteredPayments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ödenen</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredPayments.filter(p => p.odeme_durumu === 1).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ödenmeyen</p>
              <p className="text-2xl font-bold text-red-600">
                {filteredPayments.filter(p => p.odeme_durumu === 0).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
              <p className="text-2xl font-bold text-yellow-600">
                {filteredPayments
                  .filter(p => p.odeme_durumu === 1)
                  .reduce((sum, p) => sum + (parseFloat(p.odenen_tutar) || 0), 0)
                  .toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Ödeme Listesi ({filteredPayments.length})
          </h3>
        </div>
        
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm || statusFilter !== 'all' || dateFilter.startDate || dateFilter.endDate ? 'Filtrelere uygun ödeme bulunamadı' : 'Henüz ödeme yok'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || dateFilter.startDate || dateFilter.endDate ? 'Filtreleri değiştirmeyi deneyin.' : 'İlk ödemenizi ekleyerek başlayın.'}
            </p>
            {(searchTerm || statusFilter !== 'all' || dateFilter.startDate || dateFilter.endDate) ? (
              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setDateFilter({ startDate: '', endDate: '' });
                  }}
                >
                  Filtreleri Temizle
                </Button>
              </div>
            ) : (
              <div className="mt-6">
                <Button
                  variant="primary"
                  icon={<Plus size={16} />}
                  onClick={openAddModal}
                >
                  Yeni Ödeme Ekle
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yöntem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.ad && payment.soyad ? `${payment.ad} ${payment.soyad}` : 'Bilinmeyen'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.odenen_tutar || 0} ₺
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {payment.odeme_yontemi || 'Nakit'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.odeme_tarihi ? new Date(payment.odeme_tarihi).toLocaleDateString('tr-TR') : 'Belirtilmedi'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PaymentStatusBadge 
                        status={payment.odeme_durumu} 
                        onClick={() => handleStatusChange(payment.id, payment.odeme_durumu === 1 ? 0 : 1)}
                        paymentId={payment.id}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Edit size={14} />}
                          onClick={() => openEditModal(payment)}
                        >
                          Düzenle
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Trash2 size={14} />}
                          onClick={() => openDeleteModal(payment)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          Sil
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Yeni Ödeme Ekleme Modal */}
      <PaymentModal
        isOpen={showAddModal}
        onClose={closeAddModal}
        title="Yeni Ödeme Ekle"
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri</label>
            <select
              value={formData.musteri_id || ''}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Müşteri seçin</option>
              {customers?.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.ad} {customer.soyad}
                </option>
              ))}
            </select>
            {formErrors.musteri_id && (
              <p className="mt-1 text-sm text-red-600">{formErrors.musteri_id}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Üyelik</label>
            <select
              value={formData.uyelik_id || ''}
              onChange={(e) => handleMembershipSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Üyelik seçin</option>
              {customerMemberships?.map((membership) => (
                <option key={membership.id} value={membership.id}>
                  {membership.uyelik_adi || `Üyelik ${membership.id}`} - {membership.ucret || 0} ₺
                </option>
              ))}
            </select>
            {formErrors.uyelik_id && (
              <p className="mt-1 text-sm text-red-600">{formErrors.uyelik_id}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
            <Input
              value={formData.ad}
              onChange={(e) => setFormData({...formData, ad: e.target.value})}
              placeholder="Müşteri adı"
              required
              error={formErrors.ad}
              readOnly={!!selectedCustomer}
              className={selectedCustomer ? 'bg-gray-100' : ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
            <Input
              value={formData.soyad}
              onChange={(e) => setFormData({...formData, soyad: e.target.value})}
              placeholder="Müşteri soyadı"
              required
              error={formErrors.soyad}
              readOnly={!!selectedCustomer}
              className={selectedCustomer ? 'bg-gray-100' : ''}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tutar (₺)</label>
            <Input
              type="number"
              value={formData.odenen_tutar}
              onChange={(e) => setFormData({...formData, odenen_tutar: e.target.value})}
              placeholder="0.00"
              step="0.01"
              required
              error={formErrors.odenen_tutar}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Yöntemi</label>
            <select
              value={formData.odeme_yontemi}
              onChange={(e) => setFormData({...formData, odeme_yontemi: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Nakit">Nakit</option>
              <option value="Kart">Kredi Kartı</option>
              <option value="Havale">Banka Transferi</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Tarihi</label>
            <Input
              type="date"
              value={formData.odeme_tarihi}
              onChange={(e) => setFormData({...formData, odeme_tarihi: e.target.value})}
              required
              error={formErrors.odeme_tarihi}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Durumu</label>
            <select
              value={formData.odeme_durumu}
              onChange={(e) => setFormData({...formData, odeme_durumu: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0}>Ödenmedi</option>
              <option value={1}>Ödendi</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
          <textarea
            value={formData.aciklama}
            onChange={(e) => setFormData({...formData, aciklama: e.target.value})}
            placeholder="Ödeme hakkında ek bilgi..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={closeAddModal}
            disabled={formLoading}
          >
            İptal
          </Button>
          <Button type="submit" variant="primary" disabled={formLoading}>
            {formLoading ? 'Eklemek için bekleyin...' : 'Ödeme Ekle'}
          </Button>
        </div>
      </PaymentModal>

      {/* Ödeme Düzenleme Modal */}
      <PaymentModal
        isOpen={showEditModal}
        onClose={closeEditModal}
        title="Ödeme Düzenle"
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri</label>
            <select
              value={formData.musteri_id || ''}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Müşteri seçin</option>
              {customers?.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.ad} {customer.soyad}
                </option>
              ))}
            </select>
            {formErrors.musteri_id && (
              <p className="mt-1 text-sm text-red-600">{formErrors.musteri_id}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Üyelik</label>
            <select
              value={formData.uyelik_id || ''}
              onChange={(e) => handleMembershipSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Üyelik seçin</option>
              {customerMemberships?.map((membership) => (
                <option key={membership.id} value={membership.id}>
                  {membership.uyelik_adi || `Üyelik ${membership.id}`} - {membership.ucret || 0} ₺
                </option>
              ))}
            </select>
            {formErrors.uyelik_id && (
              <p className="mt-1 text-sm text-red-600">{formErrors.uyelik_id}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
            <Input
              value={formData.ad}
              onChange={(e) => setFormData({...formData, ad: e.target.value})}
              placeholder="Müşteri adı"
              required
              error={formErrors.ad}
              readOnly={!!selectedCustomer}
              className={selectedCustomer ? 'bg-gray-100' : ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
            <Input
              value={formData.soyad}
              onChange={(e) => setFormData({...formData, soyad: e.target.value})}
              placeholder="Müşteri soyadı"
              required
              error={formErrors.soyad}
              readOnly={!!selectedCustomer}
              className={selectedCustomer ? 'bg-gray-100' : ''}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tutar (₺)</label>
            <Input
              type="number"
              value={formData.odenen_tutar}
              onChange={(e) => setFormData({...formData, odenen_tutar: e.target.value})}
              placeholder="0.00"
              step="0.01"
              required
              error={formErrors.odenen_tutar}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Yöntemi</label>
            <select
              value={formData.odeme_yontemi}
              onChange={(e) => setFormData({...formData, odeme_yontemi: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Nakit">Nakit</option>
              <option value="Kart">Kredi Kartı</option>
              <option value="Havale">Banka Transferi</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Tarihi</label>
            <Input
              type="date"
              value={formData.odeme_tarihi}
              onChange={(e) => setFormData({...formData, odeme_tarihi: e.target.value})}
              required
              error={formErrors.odeme_tarihi}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Durumu</label>
            <select
              value={formData.odeme_durumu}
              onChange={(e) => setFormData({...formData, odeme_durumu: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0}>Ödenmedi</option>
              <option value={1}>Ödendi</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
          <textarea
            value={formData.aciklama}
            onChange={(e) => setFormData({...formData, aciklama: e.target.value})}
            placeholder="Ödeme hakkında ek bilgi..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={closeEditModal}
            disabled={formLoading}
          >
            İptal
          </Button>
          <Button type="submit" variant="primary" disabled={formLoading}>
            {formLoading ? 'Güncellemek için bekleyin...' : 'Güncelle'}
          </Button>
        </div>
      </PaymentModal>

      {/* Silme Onay Modal */}
      <PaymentModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        title="Ödeme Sil"
        onSubmit={(e) => { e.preventDefault(); handleDelete(); }}
      >
        <div className="text-center">
          <Trash2 className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Bu ödemeyi silmek istediğinizden emin misiniz?
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {selectedPayment && `${selectedPayment.ad} ${selectedPayment.soyad} - ${selectedPayment.odenen_tutar} ₺`}
            <br />
            Bu işlem geri alınamaz.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={closeDeleteModal}
            disabled={formLoading}
          >
            İptal
          </Button>
          <Button type="submit" variant="danger" disabled={formLoading}>
            {formLoading ? 'Silmek için bekleyin...' : 'Sil'}
          </Button>
        </div>
      </PaymentModal>
    </div>
  );
};

export default Payments; 