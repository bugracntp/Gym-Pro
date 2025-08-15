import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  Dumbbell,
  Clock,
  CheckCircle,
  Activity,
  Eye,
  PlusCircle
} from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { MODAL_TYPES } from '../../constants/app';
import { memberProgramService, customerService, exerciseService, programExerciseService } from '../../services';

const MemberPrograms = () => {
  const [memberPrograms, setMemberPrograms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedProgramForExercises, setSelectedProgramForExercises] = useState(null);
  const [programExercises, setProgramExercises] = useState([]);
  const [exerciseModalType, setExerciseModalType] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    musteri_id: '',
    program_adi: '',
    baslangic_tarihi: new Date().toISOString().split('T')[0],
    bitis_tarihi: '',
    hedef: '',
    aktif: true
  });

  // Egzersiz form state
  const [exerciseFormData, setExerciseFormData] = useState({
    egzersiz_id: '',
    gun: 'Pazartesi',
    set_sayisi: 3,
    tekrar_sayisi: '12',
    notlar: ''
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [programsData, customersData, exercisesData] = await Promise.all([
        memberProgramService.getAll(),
        customerService.getAll(),
        exerciseService.getAll()
      ]);
      
      setMemberPrograms(programsData);
      setCustomers(customersData);
      setExercises(exercisesData);
    } catch (err) {
      setError('Veriler yüklenirken hata oluştu');
      console.error('Veri yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  // Program egzersizlerini yükle
  const loadProgramExercises = async (programId) => {
    try {
      const exercises = await programExerciseService.getByProgramId(programId);
      setProgramExercises(exercises);
    } catch (err) {
      console.error('Program egzersizleri yüklenirken hata:', err);
    }
  };

  // Modal handlers
  const openModal = (type, program = null) => {
    setModalType(type);
    if (program) {
      setSelectedProgram(program);
      setFormData({
        musteri_id: program.musteri_id || '',
        program_adi: program.program_adi,
        baslangic_tarihi: program.baslangic_tarihi,
        bitis_tarihi: program.bitis_tarihi,
        hedef: program.hedef,
        aktif: program.aktif
      });
    } else {
      setSelectedProgram(null);
      setFormData({
        musteri_id: '',
        program_adi: '',
        baslangic_tarihi: new Date().toISOString().split('T')[0],
        bitis_tarihi: '',
        hedef: '',
        aktif: true
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedProgram(null);
    setFormData({
      musteri_id: '',
      program_adi: '',
      baslangic_tarihi: new Date().toISOString().split('T')[0],
      bitis_tarihi: '',
      hedef: '',
      aktif: true
    });
  };

  // Egzersiz modal handlers
  const openExerciseModal = (type, exercise = null, program = null) => {
    setExerciseModalType(type);
    setSelectedProgramForExercises(program);
    if (exercise) {
      setSelectedExercise(exercise);
      setExerciseFormData({
        egzersiz_id: exercise.egzersiz_id,
        gun: exercise.gun,
        set_sayisi: exercise.set_sayisi,
        tekrar_sayisi: exercise.tekrar_sayisi,
        notlar: exercise.notlar || ''
      });
    } else {
      setSelectedExercise(null);
      setExerciseFormData({
        egzersiz_id: '',
        gun: 'Pazartesi',
        set_sayisi: 3,
        tekrar_sayisi: '12',
        notlar: ''
      });
    }
    setShowExerciseModal(true);
  };

  const closeExerciseModal = () => {
    setShowExerciseModal(false);
    setExerciseModalType(null);
    setSelectedExercise(null);
    setSelectedProgramForExercises(null);
    setExerciseFormData({
      egzersiz_id: '',
      gun: 'Pazartesi',
      set_sayisi: 3,
      tekrar_sayisi: '12',
      notlar: ''
    });
  };

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExerciseInputChange = (field, value) => {
    setExerciseFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modalType === MODAL_TYPES.ADD_MEMBER_PROGRAM) {
        // Yeni program ekle
        await memberProgramService.create(formData);
        setSuccessMessage('Program başarıyla eklendi!');
      } else if (modalType === MODAL_TYPES.EDIT_MEMBER_PROGRAM) {
        // Program güncelle
        await memberProgramService.update(selectedProgram.id, formData);
        setSuccessMessage('Program başarıyla güncellendi!');
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

  const handleExerciseSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (exerciseModalType === 'add') {
        // Yeni egzersiz ekle
        await programExerciseService.create({
          ...exerciseFormData,
          program_id: selectedProgramForExercises.id
        });
        setSuccessMessage('Egzersiz başarıyla programa eklendi!');
      } else if (exerciseModalType === 'edit') {
        // Egzersiz güncelle
        await programExerciseService.update(selectedExercise.id, exerciseFormData);
        setSuccessMessage('Egzersiz başarıyla güncellendi!');
      }
      
      closeExerciseModal();
      loadProgramExercises(selectedProgramForExercises.id);
      
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
    if (window.confirm('Bu programı silmek istediğinizden emin misiniz?')) {
      try {
        await memberProgramService.delete(id);
        setSuccessMessage('Program başarıyla silindi!');
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

  const handleDeleteExercise = async (id) => {
    if (window.confirm('Bu egzersizi programdan silmek istediğinizden emin misiniz?')) {
      try {
        await programExerciseService.delete(id);
        setSuccessMessage('Egzersiz başarıyla programdan silindi!');
        loadProgramExercises(selectedProgramForExercises.id);
        
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

  const handleToggleStatus = async (id) => {
    try {
      const program = memberPrograms.find(p => p.id === id);
      const newStatus = !program.aktif;
      
      await memberProgramService.updateStatus(id, newStatus);
      setSuccessMessage(`Program durumu ${newStatus ? 'aktif' : 'pasif'} olarak güncellendi!`);
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

  // Program egzersizlerini görüntüle
  const viewProgramExercises = async (program) => {
    setSelectedProgramForExercises(program);
    await loadProgramExercises(program.id);
    setShowExerciseModal(true);
  };

  // Filter programs
  const filteredPrograms = memberPrograms.filter(program => {
    const matchesSearch = program.program_adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.musteri_adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.hedef.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && program.aktif) ||
                         (filterStatus === 'inactive' && !program.aktif);
    
    return matchesSearch && matchesStatus;
  });

  // Günlere göre egzersizleri grupla
  const groupExercisesByDay = (exercises) => {
    const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const grouped = {};
    
    days.forEach(day => {
      grouped[day] = exercises.filter(ex => ex.gun === day);
    });
    
    return grouped;
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
          <h1 className="text-2xl font-bold text-gray-900">Üye Programları</h1>
          <p className="text-gray-600">Kişisel antrenman planları ve programları</p>
        </div>
        <Button onClick={() => openModal(MODAL_TYPES.ADD_MEMBER_PROGRAM)}>
          <Plus size={20} className="mr-2" />
          Yeni Program
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
                placeholder="Program adı, müşteri adı veya hedef ara..."
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
          </div>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map((program) => (
          <div key={program.id} className="bg-white rounded-lg shadow border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Target className="text-blue-600" size={20} />
                <h3 className="font-semibold text-gray-900">{program.program_adi}</h3>
              </div>
              <div className="flex space-x-1">
                <Button
                  onClick={() => viewProgramExercises(program)}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Eye size={14} />
                </Button>
                <Button
                  onClick={() => openModal(MODAL_TYPES.EDIT_MEMBER_PROGRAM, program)}
                  variant="outline"
                  size="sm"
                >
                  <Edit size={14} />
                </Button>
                <Button
                  onClick={() => handleDelete(program.id)}
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
                <User className="text-green-600" size={16} />
                <span className="text-sm text-gray-600">{program.musteri_adi}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="text-purple-600" size={16} />
                <span className="text-sm text-gray-600">
                  {new Date(program.baslangic_tarihi).toLocaleDateString('tr-TR')} - {new Date(program.bitis_tarihi).toLocaleDateString('tr-TR')}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="text-blue-600" size={16} />
                <span className="text-sm text-gray-600">{program.hedef}</span>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <CheckCircle 
                    className={program.aktif ? "text-green-600" : "text-gray-400"} 
                    size={16} 
                  />
                  <span className={`text-sm ${program.aktif ? 'text-green-600' : 'text-gray-500'}`}>
                    {program.aktif ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                
                <Button
                  onClick={() => handleToggleStatus(program.id)}
                  variant="outline"
                  size="sm"
                  className={program.aktif ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'}
                >
                  {program.aktif ? 'Pasif Yap' : 'Aktif Yap'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Program Modal */}
      <Modal
        isOpen={modalType !== null}
        onClose={closeModal}
        title={modalType === MODAL_TYPES.ADD_MEMBER_PROGRAM ? 'Yeni Üye Programı Ekle' : 'Program Düzenle'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
                  {customer.ad} {customer.soyad}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program Adı
            </label>
            <Input
              type="text"
              value={formData.program_adi}
              onChange={(e) => handleInputChange('program_adi', e.target.value)}
              placeholder="Örn: Güç Antrenmanı"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bitiş Tarihi
              </label>
              <Input
                type="date"
                value={formData.bitis_tarihi}
                onChange={(e) => handleInputChange('bitis_tarihi', e.target.value)}
                min={formData.baslangic_tarihi}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hedef
            </label>
            <textarea
              value={formData.hedef}
              onChange={(e) => handleInputChange('hedef', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Programın hedefi ve amacı..."
              required
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
              Program aktif
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={closeModal} variant="outline">
              İptal
            </Button>
            <Button type="submit">
              {modalType === MODAL_TYPES.ADD_MEMBER_PROGRAM ? 'Program Ekle' : 'Güncelle'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Program Egzersizleri Modal */}
      <Modal
        isOpen={showExerciseModal}
        onClose={closeExerciseModal}
        title={`${selectedProgramForExercises?.program_adi} - Egzersiz Programı`}
        size="4xl"
      >
        <div className="space-y-6">
          {/* Egzersiz Ekleme Butonu */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Program Egzersizleri
            </h3>
            <Button onClick={() => openExerciseModal('add', null, selectedProgramForExercises)}>
              <PlusCircle size={20} className="mr-2" />
              Egzersiz Ekle
            </Button>
          </div>

          {/* Günlük Egzersizler */}
          {(() => {
            const groupedExercises = groupExercisesByDay(programExercises);
            const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
            
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {days.map(day => (
                  <div key={day} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{day}</h4>
                    {groupedExercises[day] && groupedExercises[day].length > 0 ? (
                      <div className="space-y-2">
                        {groupedExercises[day].map((exercise) => (
                          <div key={exercise.id} className="bg-white rounded border p-3">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-sm text-gray-900">
                                {exercise.egzersiz_adi}
                              </h5>
                              <div className="flex space-x-1">
                                <Button
                                  onClick={() => openExerciseModal('edit', exercise, selectedProgramForExercises)}
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Edit size={12} />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteExercise(exercise.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 size={12} />
                                </Button>
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>Set: {exercise.set_sayisi} × {exercise.tekrar_sayisi}</div>
                              {exercise.notlar && <div>Not: {exercise.notlar}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Bu gün için egzersiz yok</p>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </Modal>

      {/* Add/Edit Exercise Modal */}
      <Modal
        isOpen={showExerciseModal && exerciseModalType !== null}
        onClose={closeExerciseModal}
        title={exerciseModalType === 'add' ? 'Egzersiz Ekle' : 'Egzersiz Düzenle'}
      >
        <form onSubmit={handleExerciseSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Egzersiz
            </label>
            <select
              value={exerciseFormData.egzersiz_id}
              onChange={(e) => handleExerciseInputChange('egzersiz_id', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Egzersiz Seçin</option>
              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.egzersiz_adi} - {exercise.hedef_kas_grubu}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gün
            </label>
            <select
              value={exerciseFormData.gun}
              onChange={(e) => handleExerciseInputChange('gun', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Pazartesi">Pazartesi</option>
              <option value="Salı">Salı</option>
              <option value="Çarşamba">Çarşamba</option>
              <option value="Perşembe">Perşembe</option>
              <option value="Cuma">Cuma</option>
              <option value="Cumartesi">Cumartesi</option>
              <option value="Pazar">Pazar</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Set Sayısı
              </label>
              <Input
                type="number"
                value={exerciseFormData.set_sayisi}
                onChange={(e) => handleExerciseInputChange('set_sayisi', parseInt(e.target.value))}
                min="1"
                max="10"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tekrar Sayısı
              </label>
              <Input
                type="text"
                value={exerciseFormData.tekrar_sayisi}
                onChange={(e) => handleExerciseInputChange('tekrar_sayisi', e.target.value)}
                placeholder="12"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notlar (opsiyonel)
            </label>
            <textarea
              value={exerciseFormData.notlar}
              onChange={(e) => handleExerciseInputChange('notlar', e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Egzersiz hakkında notlar..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={closeExerciseModal} variant="outline">
              İptal
            </Button>
            <Button type="submit">
              {exerciseModalType === 'add' ? 'Egzersiz Ekle' : 'Güncelle'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MemberPrograms; 