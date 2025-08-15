import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Filter,
  Target,
  Zap
} from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { MODAL_TYPES } from '../../constants/app';
import { exerciseService, exerciseCategoryService } from '../../services';

const Exercises = () => {
  const [exercises, setExercises] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    egzersiz_adi: '',
    kategori_id: '',
    aciklama: '',
    hedef_kas_grubu: '',
    zorluk_seviyesi: 'Başlangıç'
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [exercisesData, categoriesData] = await Promise.all([
        exerciseService.getAll(),
        exerciseCategoryService.getAll()
      ]);
      
      setExercises(exercisesData);
      setCategories(categoriesData);
    } catch (err) {
      setError('Veriler yüklenirken hata oluştu');
      console.error('Veri yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const openModal = (type, exercise = null) => {
    setModalType(type);
    if (exercise) {
      setSelectedExercise(exercise);
      setFormData({
        egzersiz_adi: exercise.egzersiz_adi,
        kategori_id: exercise.kategori_id || '',
        aciklama: exercise.aciklama || '',
        hedef_kas_grubu: exercise.hedef_kas_grubu || '',
        zorluk_seviyesi: exercise.zorluk_seviyesi || 'Başlangıç'
      });
    } else {
      setSelectedExercise(null);
      setFormData({
        egzersiz_adi: '',
        kategori_id: '',
        aciklama: '',
        hedef_kas_grubu: '',
        zorluk_seviyesi: 'Başlangıç'
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedExercise(null);
    setFormData({
      egzersiz_adi: '',
      kategori_id: '',
      aciklama: '',
      hedef_kas_grubu: '',
      zorluk_seviyesi: 'Başlangıç'
    });
  };

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modalType === MODAL_TYPES.ADD_EXERCISE) {
        // Yeni egzersiz ekle
        await exerciseService.create(formData);
        setSuccessMessage('Egzersiz başarıyla eklendi!');
      } else if (modalType === MODAL_TYPES.EDIT_EXERCISE) {
        // Egzersiz güncelle
        await exerciseService.update(selectedExercise.id, formData);
        setSuccessMessage('Egzersiz başarıyla güncellendi!');
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
    if (window.confirm('Bu egzersizi silmek istediğinizden emin misiniz?')) {
      try {
        await exerciseService.delete(id);
        setSuccessMessage('Egzersiz başarıyla silindi!');
        loadData();
        
        // Başarı mesajını 3 saniye sonra temizle
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        setError('Silme işlemi sırasında hata oluştu');
        console.error('Silme hatası:', err);
      }
    }
  };

  // Filter exercises
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.egzersiz_adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.hedef_kas_grubu.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || exercise.kategori_adi === filterCategory;
    const matchesDifficulty = filterDifficulty === 'all' || exercise.zorluk_seviyesi === filterDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
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
          <h1 className="text-2xl font-bold text-gray-900">Egzersizler</h1>
          <p className="text-gray-600">Egzersiz kütüphanesi ve antrenman hareketleri</p>
        </div>
        <Button onClick={() => openModal(MODAL_TYPES.ADD_EXERCISE)}>
          <Plus size={20} className="mr-2" />
          Yeni Egzersiz
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
                placeholder="Egzersiz adı veya hedef kas grubu ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map(category => (
                <option key={category.id} value={category.kategori_adi}>
                  {category.kategori_adi}
                </option>
              ))}
            </select>
            
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tüm Seviyeler</option>
              <option value="Başlangıç">Başlangıç</option>
              <option value="Orta">Orta</option>
              <option value="İleri">İleri</option>
            </select>
          </div>
        </div>
      </div>

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => (
          <div key={exercise.id} className="bg-white rounded-lg shadow border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="text-blue-600" size={20} />
                <h3 className="font-semibold text-gray-900">{exercise.egzersiz_adi}</h3>
              </div>
              <div className="flex space-x-1">
                <Button
                  onClick={() => openModal(MODAL_TYPES.EDIT_EXERCISE, exercise)}
                  variant="outline"
                  size="sm"
                >
                  <Edit size={14} />
                </Button>
                <Button
                  onClick={() => handleDelete(exercise.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Target className="text-green-600" size={16} />
                <span className="text-sm text-gray-600">{exercise.hedef_kas_grubu}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Zap className="text-yellow-600" size={16} />
                <span className="text-sm text-gray-600">{exercise.zorluk_seviyesi}</span>
              </div>
              
              <div className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {exercise.kategori_adi}
              </div>
            </div>
            
            {exercise.aciklama && (
              <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
                {exercise.aciklama}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Exercise Modal */}
      <Modal
        isOpen={modalType !== null}
        onClose={closeModal}
        title={modalType === MODAL_TYPES.ADD_EXERCISE ? 'Yeni Egzersiz Ekle' : 'Egzersiz Düzenle'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Egzersiz Adı
            </label>
            <Input
              type="text"
              value={formData.egzersiz_adi}
              onChange={(e) => handleInputChange('egzersiz_adi', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              value={formData.kategori_id}
              onChange={(e) => handleInputChange('kategori_id', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Kategori Seçin</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.kategori_adi}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hedef Kas Grubu
            </label>
            <Input
              type="text"
              value={formData.hedef_kas_grubu}
              onChange={(e) => handleInputChange('hedef_kas_grubu', e.target.value)}
              placeholder="Örn: Pectoralis Major"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zorluk Seviyesi
            </label>
            <select
              value={formData.zorluk_seviyesi}
              onChange={(e) => handleInputChange('zorluk_seviyesi', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Başlangıç">Başlangıç</option>
              <option value="Orta">Orta</option>
              <option value="İleri">İleri</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              value={formData.aciklama}
              onChange={(e) => handleInputChange('aciklama', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Egzersiz hakkında detaylı bilgi..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={closeModal} variant="outline">
              İptal
            </Button>
            <Button type="submit">
              {modalType === MODAL_TYPES.ADD_EXERCISE ? 'Egzersiz Ekle' : 'Güncelle'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Exercises; 