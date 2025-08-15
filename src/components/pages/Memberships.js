import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  RefreshCw, 
  Calendar, 
  CreditCard, 
  Users, 
  AlertTriangle,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { membershipService } from '../../services/membershipService';
import { membershipTypeService } from '../../services/membershipTypeService';
import { customerService } from '../../services/customerService';
import { paymentService } from '../../services/paymentService';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { MODAL_TYPES } from '../../constants/app';

const Memberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [membershipTypes, setMembershipTypes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [stats, setStats] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    musteri_id: '',
    uyelik_tipi_id: '',
    baslangic_tarihi: new Date().toISOString().split('T')[0], // Bugünün tarihi
    bitis_tarihi: '',
    ucret: '',
    odeme_durumu: 'Bekliyor'
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [membershipsData, typesData, customersData, statsData] = await Promise.all([
        membershipService.getAll(),
        membershipTypeService.getAll(),
        customerService.getAll(),
        membershipService.getMembershipStats()
      ]);

      setMemberships(membershipsData);
      setMembershipTypes(typesData);
      setCustomers(customersData);
      setStats(statsData);
    } catch (err) {
      setError('Veriler yüklenirken hata oluştu');
      console.error('Veri yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const openModal = (type, membership = null) => {
    setModalType(type);
    if (membership) {
      setSelectedMembership(membership);
      setFormData({
        musteri_id: membership.musteri_id,
        uyelik_tipi_id: membership.uyelik_tipi_id,
        baslangic_tarihi: membership.baslangic_tarihi,
        bitis_tarihi: membership.bitis_tarihi,
        ucret: membership.ucret,
        odeme_durumu: membership.odeme_durumu
      });
    } else {
      setSelectedMembership(null);
      setFormData({
        musteri_id: '',
        uyelik_tipi_id: '',
        baslangic_tarihi: new Date().toISOString().split('T')[0], // Bugünün tarihi
        bitis_tarihi: '',
        ucret: '',
        odeme_durumu: 'Bekliyor'
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedMembership(null);
    setFormData({
      musteri_id: '',
      uyelik_tipi_id: '',
      baslangic_tarihi: new Date().toISOString().split('T')[0], // Bugünün tarihi
      bitis_tarihi: '',
      ucret: '',
      odeme_durumu: 'Bekliyor'
    });
  };

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Üyelik tipi seçildiğinde otomatik bitiş tarihi ve ücret hesapla
    if (field === 'uyelik_tipi_id' && value) {
      const selectedType = membershipTypes.find(t => t.id === parseInt(value));
      if (selectedType) {
        const startDate = formData.baslangic_tarihi || new Date().toISOString().split('T')[0];
        const startDateObj = new Date(startDate);
        const endDate = new Date(startDateObj);
        endDate.setMonth(endDate.getMonth() + selectedType.sure_ay);
        
        setFormData(prev => ({
          ...prev,
          bitis_tarihi: endDate.toISOString().split('T')[0],
          ucret: selectedType.fiyat
        }));
      }
    }
    
    // Başlangıç tarihi değiştiğinde bitiş tarihini güncelle
    if (field === 'baslangic_tarihi' && value && formData.uyelik_tipi_id) {
      const selectedType = membershipTypes.find(t => t.id === parseInt(formData.uyelik_tipi_id));
      if (selectedType) {
        const startDate = new Date(value);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + selectedType.sure_ay);
        
        setFormData(prev => ({
          ...prev,
          bitis_tarihi: endDate.toISOString().split('T')[0]
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validasyonu
    if (!formData.musteri_id) {
      setError('Lütfen müşteri seçin');
      return;
    }
    
    if (!formData.uyelik_tipi_id) {
      setError('Lütfen üyelik tipi seçin');
      return;
    }
    
    if (!formData.baslangic_tarihi) {
      setError('Lütfen başlangıç tarihi seçin');
      return;
    }
    
    if (!formData.bitis_tarihi) {
      setError('Lütfen bitiş tarihi seçin');
      return;
    }
    
    if (!formData.ucret || formData.ucret <= 0) {
      setError('Lütfen geçerli bir ücret girin');
      return;
    }
    
    try {
      if (modalType === MODAL_TYPES.ADD_MEMBERSHIP) {
        // Önce üyeliği oluştur
        const newMembership = await membershipService.create(formData);
        
        // Sonra otomatik olarak ödeme kaydı ekle
        try {
          await paymentService.create({
            musteri_id: formData.musteri_id,
            uyelik_id: newMembership.id,
            odenen_tutar: formData.ucret,
            odeme_yontemi: 'Nakit',
            aciklama: 'Yeni Üyelik Ödemesi',
            odeme_durumu: formData.odeme_durumu === 'Ödendi' ? 1 : 0
          });
          
          setSuccessMessage('Üyelik başarıyla oluşturuldu ve ödeme kaydı eklendi!');
        } catch (paymentError) {
          console.error('Ödeme kaydı eklenirken hata:', paymentError);
          // Ödeme eklenemese bile üyelik oluşturuldu, sadece uyarı ver
          setError('Üyelik oluşturuldu ancak ödeme kaydı eklenemedi. Lütfen manuel olarak ödeme ekleyin.');
          loadData();
          return;
        }
      } else if (modalType === MODAL_TYPES.EDIT_MEMBERSHIP) {
        await membershipService.update(selectedMembership.id, formData);
        setSuccessMessage('Üyelik başarıyla güncellendi!');
      }
      
      closeModal();
      loadData();
      
      // Başarı mesajını 3 saniye sonra temizle
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('İşlem sırasında hata oluştu');
      console.error('Form submit hatası:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu üyeliği silmek istediğinizden emin misiniz?')) {
      try {
        await membershipService.delete(id);
        loadData();
      } catch (err) {
        setError('Silme işlemi sırasında hata oluştu');
        console.error('Silme hatası:', err);
      }
    }
  };

  const handleRenew = async (membership) => {
    // Üyelik tipine göre yeni bitiş tarihi hesapla
    const membershipType = membershipTypes.find(t => t.id === membership.uyelik_tipi_id);
    if (!membershipType) return;

    const currentEndDate = new Date(membership.bitis_tarihi);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setMonth(newEndDate.getMonth() + membershipType.sure_ay);

    try {
      const renewedMembership = await membershipService.renewMembership(
        membership.id, 
        newEndDate.toISOString().split('T')[0],
        membershipType.fiyat
      );
      
      // Yenileme sonrası otomatik ödeme kaydı ekle
      try {
        await paymentService.create({
          musteri_id: membership.musteri_id,
          uyelik_id: membership.id,
          odenen_tutar: membershipType.fiyat,
          odeme_yontemi: 'Nakit',
          aciklama: 'Üyelik Yenileme Ödemesi',
          odeme_durumu: 0 // Varsayılan olarak ödenmemiş
        });
        
        setSuccessMessage('Üyelik başarıyla yenilendi ve ödeme kaydı eklendi!');
      } catch (paymentError) {
        console.error('Yenileme ödeme kaydı eklenirken hata:', paymentError);
        // Ödeme eklenemese bile üyelik yenilendi, sadece uyarı ver
        setError('Üyelik yenilendi ancak ödeme kaydı eklenemedi. Lütfen manuel olarak ödeme ekleyin.');
      }
      
      loadData();
      
      // Başarı mesajını 3 saniye sonra temizle
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Yenileme işlemi sırasında hata oluştu');
      console.error('Yenileme hatası:', err);
    }
  };

  // Helper functions
  const getStatusColor = (endDate, paymentStatus) => {
    const today = new Date();
    const end = new Date(endDate);
    
    if (paymentStatus === 'Gecikmiş') return 'text-red-600 bg-red-100';
    if (end < today) return 'text-red-600 bg-red-100';
    if (end.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusText = (endDate, paymentStatus) => {
    const today = new Date();
    const end = new Date(endDate);
    
    if (paymentStatus === 'Gecikmiş') return 'Gecikmiş';
    if (end < today) return 'Süresi Dolmuş';
    if (end.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000) return 'Süresi Dolmak Üzere';
    return 'Aktif';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={loadData} variant="outline">
          Tekrar Dene
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Üyelik Yönetimi</h1>
          <p className="text-gray-600">Müşteri üyeliklerini yönetin ve takip edin</p>
        </div>
        <Button onClick={() => openModal(MODAL_TYPES.ADD_MEMBERSHIP)}>
          <Plus size={20} className="mr-2" />
          Yeni Üyelik
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Users className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Toplam Üyelik</p>
              <p className="text-2xl font-bold text-gray-900">{stats.toplam_uyelik || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Calendar className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Aktif Üyelik</p>
              <p className="text-2xl font-bold text-gray-900">{stats.aktif_uyelik || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <AlertTriangle className="text-yellow-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Süresi Dolmak Üzere</p>
              <p className="text-2xl font-bold text-gray-900">{stats.sureli_dolmus || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <CreditCard className="text-red-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Ödeme Bekleyen</p>
              <p className="text-2xl font-bold text-gray-900">{stats.bekliyor || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Memberships Table */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Üyelik Listesi</h2>
            <Button onClick={loadData} variant="outline" size="sm">
              <RefreshCw size={16} className="mr-2" />
              Yenile
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Üyelik Tipi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Başlangıç
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bitiş
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ücret
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
              {memberships.map((membership) => (
                <tr key={membership.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {membership.ad} {membership.soyad}
                      </div>
                      <div className="text-sm text-gray-500">{membership.telefon}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{membership.tip_adi}</div>
                    <div className="text-sm text-gray-500">{membership.sure_ay} ay</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(membership.baslangic_tarihi).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(membership.bitis_tarihi).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₺{membership.ucret}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(membership.bitis_tarihi, membership.odeme_durumu)}`}>
                      {getStatusText(membership.bitis_tarihi, membership.odeme_durumu)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      onClick={() => openModal(MODAL_TYPES.EDIT_MEMBERSHIP, membership)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      onClick={() => handleRenew(membership)}
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:text-green-700"
                    >
                      <RefreshCw size={14} />
                    </Button>
                    <Button
                      onClick={() => handleDelete(membership.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Membership Modal */}
      <Modal
        isOpen={modalType !== null}
        onClose={closeModal}
        title={modalType === MODAL_TYPES.ADD_MEMBERSHIP ? 'Yeni Üyelik Ekle' : 'Üyelik Düzenle'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Müşteri
              </label>
              <select
                value={formData.musteri_id}
                onChange={(e) => handleInputChange('musteri_id', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Müşteri Seçin</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.ad} {customer.soyad} - {customer.telefon}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Üyelik Tipi
              </label>
              <select
                value={formData.uyelik_tipi_id}
                onChange={(e) => handleInputChange('uyelik_tipi_id', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Üyelik Tipi Seçin</option>
                {membershipTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.tip_adi} - {type.sure_ay} ay - ₺{type.fiyat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Başlangıç Tarihi
              </label>
              <Input
                type="date"
                value={formData.baslangic_tarihi}
                onChange={(e) => handleInputChange('baslangic_tarihi', e.target.value)}
                required
              />
              <p className="mt-1 text-xs text-gray-500">Üyeliğin başlayacağı tarih</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bitiş Tarihi
              </label>
              <Input
                type="date"
                value={formData.bitis_tarihi}
                onChange={(e) => handleInputChange('bitis_tarihi', e.target.value)}
                min={formData.baslangic_tarihi} // Başlangıç tarihinden önce seçilemez
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.uyelik_tipi_id && formData.baslangic_tarihi 
                  ? 'Üyelik tipi seçildiğinde otomatik hesaplanır' 
                  : 'Üyelik tipi ve başlangıç tarihi seçin'
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ücret
              </label>
              <Input
                type="number"
                value={formData.ucret}
                onChange={(e) => handleInputChange('ucret', e.target.value)}
                placeholder="0.00"
                step="0.01"
                required
                readOnly={!!formData.uyelik_tipi_id}
                className={formData.uyelik_tipi_id ? 'bg-gray-100 cursor-not-allowed' : ''}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.uyelik_tipi_id 
                  ? 'Üyelik tipi seçildiğinde otomatik doldurulur' 
                  : 'Üyelik tipi seçin'
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ödeme Durumu
              </label>
              <select
                value={formData.odeme_durumu}
                onChange={(e) => handleInputChange('odeme_durumu', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Bekliyor">Bekliyor</option>
                <option value="Ödendi">Ödendi</option>
                <option value="Gecikmiş">Gecikmiş</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={closeModal} variant="outline">
              İptal
            </Button>
            <Button type="submit">
              {modalType === MODAL_TYPES.ADD_MEMBERSHIP ? 'Üyelik Ekle' : 'Güncelle'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Memberships; 