import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { MODAL_TYPES } from '../../constants/app';
import { membershipTypeService } from '../../services';

const MembershipTypes = () => {
  const [membershipTypes, setMembershipTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    tip_adi: '',
    sure_ay: 1,
    fiyat: '',
    aciklama: '',
    aktif: true
  });

  // Load data
  useEffect(() => {
    loadData();
  }, [showInactive]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = showInactive 
        ? await membershipTypeService.getAllWithInactive()
        : await membershipTypeService.getAll();
      setMembershipTypes(data);
    } catch (err) {
      setError('Veriler yüklenirken hata oluştu');
      console.error('Veri yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const openModal = (type, membershipType = null) => {
    setModalType(type);
    if (membershipType) {
      setSelectedType(membershipType);
      setFormData({
        tip_adi: membershipType.tip_adi,
        sure_ay: membershipType.sure_ay,
        fiyat: membershipType.fiyat,
        aciklama: membershipType.aciklama || '',
        aktif: membershipType.aktif
      });
    } else {
      setSelectedType(null);
      setFormData({
        tip_adi: '',
        sure_ay: 1,
        fiyat: '',
        aciklama: '',
        aktif: true
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedType(null);
    setFormData({
      tip_adi: '',
      sure_ay: 1,
      fiyat: '',
      aciklama: '',
      aktif: true
    });
  };

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modalType === MODAL_TYPES.ADD_MEMBERSHIP_TYPE) {
        // Yeni üyelik tipi ekle
        await membershipTypeService.create(formData);
        setSuccessMessage('Üyelik tipi başarıyla eklendi!');
      } else if (modalType === MODAL_TYPES.EDIT_MEMBERSHIP_TYPE) {
        // Üyelik tipi güncelle
        await membershipTypeService.update(selectedType.id, formData);
        setSuccessMessage('Üyelik tipi başarıyla güncellendi!');
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
    const deleteType = window.confirm(
      'Bu üyelik tipini nasıl silmek istiyorsunuz?\n\n' +
      'Tamam: Kalıcı olarak sil (geri alınamaz)\n' +
      'İptal: Sadece pasif yap (geri getirilebilir)'
    );
    
    if (deleteType) {
      // Hard delete - kalıcı silme
      try {
        await membershipTypeService.delete(id);
        setSuccessMessage('Üyelik tipi kalıcı olarak silindi!');
        loadData();
        
        // Başarı mesajını 3 saniye sonra temizle
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        setError('Silme işlemi sırasında hata oluştu');
        console.error('Silme hatası:', err);
      }
    } else {
      // Soft delete - sadece pasif yap
      try {
        await membershipTypeService.updateStatus(id, false);
        setSuccessMessage('Üyelik tipi pasif yapıldı!');
        loadData();
        
        // Başarı mesajını 3 saniye sonra temizle
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        setError('Durum güncellenirken hata oluştu');
        console.error('Durum güncelleme hatası:', err);
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const membershipType = membershipTypes.find(t => t.id === id);
      const newStatus = !membershipType.aktif;
      
      await membershipTypeService.updateStatus(id, newStatus);
      setSuccessMessage(`Üyelik tipi durumu ${newStatus ? 'aktif' : 'pasif'} olarak güncellendi!`);
      loadData();
      
      // Başarı mesajını 3 saniye sonra temizle
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Durum güncellenirken hata oluştu');
      console.error('Durum güncelleme hatası:', err);
    }
  };

  // Filter membership types
  const filteredTypes = membershipTypes.filter(type => {
    const matchesSearch = type.tip_adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         type.aciklama?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && type.aktif) ||
                         (filterStatus === 'inactive' && !type.aktif);
    
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Üyelik Tipleri</h1>
          <p className="text-gray-600">Üyelik paketleri ve fiyat yönetimi</p>
        </div>
        <Button onClick={() => openModal(MODAL_TYPES.ADD_MEMBERSHIP_TYPE)}>
          <Plus size={20} className="mr-2" />
          Yeni Üyelik Tipi
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

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Üyelik tipi adı veya açıklama ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
            
            <label className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Pasif Verileri Göster</span>
            </label>
          </div>
        </div>
      </div>

      {/* Membership Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTypes.map((type) => (
          <div key={type.id} className="bg-white rounded-lg shadow border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Package className="text-blue-600" size={20} />
                <h3 className="font-semibold text-gray-900">{type.tip_adi}</h3>
              </div>
              <div className="flex space-x-1">
                <Button
                  onClick={() => openModal(MODAL_TYPES.EDIT_MEMBERSHIP_TYPE, type)}
                  variant="outline"
                  size="sm"
                >
                  <Edit size={14} />
                </Button>
                <Button
                  onClick={() => handleDelete(type.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="text-green-600" size={16} />
                <span className="text-sm text-gray-600">{type.sure_ay} ay</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <DollarSign className="text-purple-600" size={16} />
                <span className="text-sm text-gray-600 font-medium">{type.fiyat} ₺</span>
              </div>
              
              {type.aciklama && (
                <div className="text-sm text-gray-600">
                  {type.aciklama}
                </div>
              )}
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  {type.aktif ? (
                    <CheckCircle className="text-green-600" size={16} />
                  ) : (
                    <XCircle className="text-gray-400" size={16} />
                  )}
                  <span className={`text-sm ${type.aktif ? 'text-green-600' : 'text-gray-500'}`}>
                    {type.aktif ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                
                <Button
                  onClick={() => handleToggleStatus(type.id)}
                  variant="outline"
                  size="sm"
                  className={type.aktif ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'}
                >
                  {type.aktif ? 'Pasif Yap' : 'Aktif Yap'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Membership Type Modal */}
      <Modal
        isOpen={modalType !== null}
        onClose={closeModal}
        title={modalType === MODAL_TYPES.ADD_MEMBERSHIP_TYPE ? 'Yeni Üyelik Tipi Ekle' : 'Üyelik Tipi Düzenle'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Üyelik Tipi Adı
            </label>
            <Input
              type="text"
              value={formData.tip_adi}
              onChange={(e) => handleInputChange('tip_adi', e.target.value)}
              placeholder="Örn: Aylık Üyelik"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Süre (Ay)
              </label>
              <Input
                type="number"
                value={formData.sure_ay}
                onChange={(e) => handleInputChange('sure_ay', parseInt(e.target.value))}
                min="1"
                max="60"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fiyat (₺)
              </label>
              <Input
                type="number"
                value={formData.fiyat}
                onChange={(e) => handleInputChange('fiyat', parseFloat(e.target.value))}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama (Opsiyonel)
            </label>
            <textarea
              value={formData.aciklama}
              onChange={(e) => handleInputChange('aciklama', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Üyelik tipi hakkında açıklama..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="aktif"
              checked={formData.aktif}
              onChange={(e) => handleInputChange('aktif', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="aktif" className="text-sm text-gray-700">
              Üyelik tipi aktif
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={closeModal} variant="outline">
              İptal
            </Button>
            <Button type="submit">
              {modalType === MODAL_TYPES.ADD_MEMBERSHIP_TYPE ? 'Üyelik Tipi Ekle' : 'Güncelle'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MembershipTypes; 