import React, { useState, useMemo } from 'react';
import { 
  Users, 
  CreditCard, 
  Activity, 
  TrendingUp,
  Calendar,
  AlertCircle,
  DollarSign,
  Clock,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';

const Dashboard = ({ stats, loading, error, unpaidCustomers = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // CSV export fonksiyonu
  const exportToCSV = () => {
    if (filteredUnpaidCustomers.length === 0) return;

    const headers = ['Ad Soyad', 'Telefon', 'Üyelik Tipi', 'Başlangıç Tarihi', 'Bitiş Tarihi', 'Tutar', 'Ödeme Durumu', 'Ödeme Tarihi'];
    const csvContent = [
      headers.join(','),
      ...filteredUnpaidCustomers.map(customer => [
        customer.ad_soyad,
        customer.telefon || '',
        customer.uyelik_tipi,
        formatDate(new Date(customer.baslangic_tarihi), 'dd/MM/yyyy'),
        formatDate(new Date(customer.bitis_tarihi), 'dd/MM/yyyy'),
        customer.ucret,
        customer.odeme_durumu,
        customer.odeme_tarihi ? formatDate(new Date(customer.odeme_tarihi), 'dd/MM/yyyy') : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `odemesi_yapilmayan_musteriler_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fotoğraf büyütme fonksiyonu
  const handlePhotoClick = (photoData, customerName) => {
    setSelectedPhoto({ photo: photoData, name: customerName });
    setShowPhotoModal(true);
  };

  // Fotoğraf modal'ını kapat
  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPhoto(null);
  };

  // Ödemesi yapılmayan müşterileri filtrele
  const filteredUnpaidCustomers = useMemo(() => {
    let filtered = unpaidCustomers;

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.ad_soyad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.telefon?.includes(searchTerm) ||
        customer.uyelik_tipi.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Tip filtresi
    if (filterType !== 'all') {
      filtered = filtered.filter(customer => customer.uyelik_tipi === filterType);
    }

    return filtered;
  }, [unpaidCustomers, searchTerm, filterType]);

  // Benzersiz üyelik tiplerini al
  const uniqueMembershipTypes = useMemo(() => {
    const types = [...new Set(unpaidCustomers.map(customer => customer.uyelik_tipi))];
    return types.filter(type => type);
  }, [unpaidCustomers]);

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
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <h3 className="text-sm font-medium text-red-800">
            Dashboard yüklenirken hata oluştu
          </h3>
        </div>
        <p className="mt-2 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  // Default stats (API'den veri gelmezse)
  const defaultStats = {
    totalCustomers: 0,
    activeMembers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    todayEntries: 0,
    expiringMemberships: 0
  };

  const currentStats = stats || defaultStats;

  // Ödemesi yapılmayan müşteriler için toplam tutar hesapla
  const totalUnpaidAmount = unpaidCustomers.reduce((total, customer) => {
    return total + (parseFloat(customer.ucret) || 0);
  }, 0);

  // Stat cards
  const statCards = [
    {
      title: 'Toplam Müşteri',
      value: currentStats.totalCustomers || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: currentStats.changes?.totalCustomers || '0%',
      changeType: currentStats.changes?.totalCustomers === '0%' ? 'neutral' : 
                 currentStats.changes?.totalCustomers?.startsWith('+') ? 'positive' : 'negative'
    },
    {
      title: 'Aktif Üyeler',
      value: currentStats.activeMembers || 0,
      icon: Activity,
      color: 'bg-green-500',
      change: currentStats.changes?.activeMembers || '0%',
      changeType: currentStats.changes?.activeMembers === '0%' ? 'neutral' : 
                 currentStats.changes?.activeMembers?.startsWith('+') ? 'positive' : 'negative'
    },
    {
      title: 'Toplam Gelir',
      value: formatCurrency(currentStats.totalRevenue || 0),
      icon: CreditCard,
      color: 'bg-purple-500',
      change: currentStats.changes?.totalRevenue || '0%',
      changeType: currentStats.changes?.totalRevenue === '0%' ? 'neutral' : 
                 currentStats.changes?.totalRevenue?.startsWith('+') ? 'positive' : 'negative'
    },
    {
      title: 'Aylık Gelir',
      value: formatCurrency(currentStats.monthlyRevenue || 0),
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: currentStats.changes?.monthlyRevenue || '0%',
      changeType: currentStats.changes?.monthlyRevenue === '0%' ? 'neutral' : 
                 currentStats.changes?.monthlyRevenue?.startsWith('+') ? 'positive' : 'negative'
    },
    {
      title: 'Bugün Giriş',
      value: currentStats.todayEntries || 0,
      icon: Calendar,
      color: 'bg-indigo-500',
      change: currentStats.changes?.todayEntries || '0%',
      changeType: currentStats.changes?.todayEntries === '0%' ? 'neutral' : 
                 currentStats.changes?.todayEntries?.startsWith('+') ? 'positive' : 'negative'
    },
    {
      title: 'Süresi Dolan',
      value: currentStats.expiringMemberships || 0,
      icon: AlertCircle,
      color: 'bg-red-500',
      change: currentStats.changes?.expiringMemberships || '0%',
      changeType: currentStats.changes?.expiringMemberships === '0%' ? 'neutral' : 
                 currentStats.changes?.expiringMemberships?.startsWith('+') ? 'positive' : 'negative'
    },
    {
      title: 'Ödemesi Bekleyen',
      value: unpaidCustomers.length || 0,
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '0%',
      changeType: 'neutral'
    }
  ];

  // Son aktiviteleri formatla
  const formatRecentActivities = (activities) => {
    if (!activities || activities.length === 0) {
      return [
        {
          type: 'info',
          description: 'Henüz aktivite bulunmuyor',
          customerName: '',
          time: formatDate(new Date(), 'HH:mm')
        }
      ];
    }

    return activities.slice(0, 5).map(activity => {
      let iconColor = 'bg-blue-500';
      let description = activity.description;

      if (activity.type === 'odeme') {
        iconColor = 'bg-green-500';
      } else if (activity.type === 'giris') {
        iconColor = 'bg-yellow-500';
      }

      return {
        type: activity.type,
        description,
        customerName: activity.customer_name,
        time: formatDate(new Date(activity.date), 'HH:mm'),
        iconColor
      };
    });
  };

  const recentActivities = formatRecentActivities(currentStats.recentActivities);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Spor salonu genel durumu ve istatistikleri
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {card.value}
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
              </div>
              
              {/* Change indicator */}
              <div className="mt-4 flex items-center">
                <span
                  className={`text-sm font-medium ${
                    card.changeType === 'positive' 
                      ? 'text-green-600' 
                      : card.changeType === 'negative'
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}
                >
                  {card.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  geçen aya göre
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section - Grafikler kaldırıldı, ödeme yapmayan müşteriler tablosu buraya taşındı */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Ödemesi Yapılmayan Müşteriler
            </h3>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Toplam Tutar</div>
                <div className="text-lg font-bold text-red-600">
                  {formatCurrency(totalUnpaidAmount)}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium text-red-600">
                  {unpaidCustomers.length} Müşteri
                </span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Üyeliği aktif ancak ödemesi alınmamış müşteriler
          </p>
        </div>
        <div className="p-6">
          {/* Arama ve Filtreleme */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Müşteri adı, telefon veya üyelik tipi ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Tüm Üyelik Tipleri</option>
                {uniqueMembershipTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
              <button
                onClick={exportToCSV}
                disabled={filteredUnpaidCustomers.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                title="CSV olarak dışa aktar"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Arama Sonuç Bilgisi */}
          {(searchTerm || filterType !== 'all') && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-blue-800">
                  <span className="font-medium">Filtreleme Sonuçları:</span>
                  {searchTerm && <span className="ml-2">"{searchTerm}" için arama</span>}
                  {filterType !== 'all' && <span className="ml-2">• {filterType} üyelik tipi</span>}
                </div>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Filtreleri Temizle
                </button>
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {filteredUnpaidCustomers.length} müşteri bulundu
              </div>
            </div>
          )}

          {/* Özet Bilgi Kartı */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800">Toplam Müşteri</p>
                  <p className="text-2xl font-bold text-yellow-900">{filteredUnpaidCustomers.length}</p>
                </div>
                <Users className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800">Toplam Tutar</p>
                  <p className="text-2xl font-bold text-red-900">
                    {formatCurrency(filteredUnpaidCustomers.reduce((total, customer) => 
                      total + (parseFloat(customer.ucret) || 0), 0
                    ))}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Ortalama Tutar</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {filteredUnpaidCustomers.length > 0 
                      ? formatCurrency(filteredUnpaidCustomers.reduce((total, customer) => 
                          total + (parseFloat(customer.ucret) || 0), 0
                        ) / filteredUnpaidCustomers.length)
                      : formatCurrency(0)
                    }
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          {filteredUnpaidCustomers.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Tüm ödemeler tamamlanmış</p>
              <p className="text-sm text-gray-400 mt-2">Ödemesi bekleyen müşteri bulunmuyor</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUnpaidCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    {customer.fotoğraf ? (
                      <img
                        src={customer.fotoğraf}
                        alt={customer.ad_soyad}
                        className="w-10 h-10 rounded-full object-cover border-2 border-red-200 cursor-pointer hover:scale-110 transition-transform duration-200"
                        onClick={() => handlePhotoClick(customer.fotoğraf, customer.ad_soyad)}
                        title="Fotoğrafı büyütmek için tıklayın"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-red-600" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {customer.ad_soyad}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {customer.uyelik_tipi}
                        </span>
                        <span>Başlangıç: {formatDate(new Date(customer.baslangic_tarihi))}</span>
                        <span>Bitiş: {formatDate(new Date(customer.bitis_tarihi))}</span>
                      </div>
                      {customer.telefon && (
                        <p className="text-xs text-gray-500 mt-1">
                          📞 {customer.telefon}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">
                      {formatCurrency(customer.ucret)}
                    </div>
                    <div className="text-sm text-red-500 font-medium">
                      {customer.odeme_durumu === 1 ? 'Ödendi' : 'Ödenmedi'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {customer.odeme_tarihi ? 
                        `Son Ödeme: ${formatDate(new Date(customer.odeme_tarihi))}` : 
                        'Ödeme tarihi belirtilmemiş'
                      }
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(selectedCustomer === customer.id ? null : customer.id)}
                    className="ml-4 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    {selectedCustomer === customer.id ? 'Gizle' : 'Detay'}
                  </button>
                </div>
              ))}

              {/* Müşteri Detayları */}
              {selectedCustomer && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-3">Müşteri Detayları</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><span className="font-medium">Ad Soyad:</span> {filteredUnpaidCustomers.find(c => c.id === selectedCustomer)?.ad_soyad}</p>
                      <p><span className="font-medium">Telefon:</span> {filteredUnpaidCustomers.find(c => c.id === selectedCustomer)?.telefon || 'Belirtilmemiş'}</p>
                      <p><span className="font-medium">E-posta:</span> {filteredUnpaidCustomers.find(c => c.id === selectedCustomer)?.email || 'Belirtilmemiş'}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Üyelik Tipi:</span> {filteredUnpaidCustomers.find(c => c.id === selectedCustomer)?.uyelik_tipi}</p>
                      <p><span className="font-medium">Başlangıç:</span> {formatDate(new Date(filteredUnpaidCustomers.find(c => c.id === selectedCustomer)?.baslangic_tarihi))}</p>
                      <p><span className="font-medium">Bitiş:</span> {formatDate(new Date(filteredUnpaidCustomers.find(c => c.id === selectedCustomer)?.bitis_tarihi))}</p>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-white rounded border border-blue-300">
                    <p className="font-medium text-blue-900">Ödeme Bilgileri</p>
                    <p><span className="font-medium">Tutar:</span> {formatCurrency(filteredUnpaidCustomers.find(c => c.id === selectedCustomer)?.ucret)}</p>
                    <p><span className="font-medium">Durum:</span> {filteredUnpaidCustomers.find(c => c.id === selectedCustomer)?.odeme_durumu === 1 ? 'Ödendi' : 'Ödenmedi'}</p>
                    <p><span className="font-medium">Son Ödeme:</span> {filteredUnpaidCustomers.find(c => c.id === selectedCustomer)?.odeme_tarihi ? 
                      formatDate(new Date(filteredUnpaidCustomers.find(c => c.id === selectedCustomer)?.odeme_tarihi)) : 
                      'Belirtilmemiş'}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Son Aktiviteler */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Son Aktiviteler
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {/* Sample activities */}
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${activity.iconColor}`}></div>
                <span className="text-sm text-gray-600">
                  {activity.description}
                  {activity.customerName && `: ${activity.customerName}`}
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fotoğraf Büyütme Modal */}
      {showPhotoModal && selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedPhoto.name} - Fotoğraf
              </h3>
              <button
                onClick={closePhotoModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="flex justify-center">
              <img
                src={selectedPhoto.photo}
                alt={selectedPhoto.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Fotoğraf boyutu: {Math.round(selectedPhoto.photo.length / 1024)} KB
              </p>
            </div>
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={closePhotoModal}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 