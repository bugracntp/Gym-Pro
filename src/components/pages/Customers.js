import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit, Trash2, Ruler } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { AddCustomerForm, EditCustomerForm, CustomerMeasurementForm } from '../forms';
import { customerMeasurementService, paymentService } from '../../services';

const Customers = ({ customers, loading, error, onCustomerAdded, onCustomerUpdated, onCustomerDeleted }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);
  const [measurementLoading, setMeasurementLoading] = useState(false);
  const [paymentStatuses, setPaymentStatuses] = useState({});

  // Müşteri düzenleme modal'ını aç
  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  // Düzenleme modal'ını kapat
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCustomer(null);
  };

  // Ölçü modal'ını aç
  const handleOpenMeasurementModal = async (customer) => {
    setSelectedCustomer(customer);
    setMeasurementLoading(true);
    
    try {
      // Müşterinin en son ölçüsünü getir
      const latestMeasurement = await customerMeasurementService.getLatestByCustomerId(customer.id);
      setSelectedMeasurement(latestMeasurement);
    } catch (error) {
      setSelectedMeasurement(null);
    } finally {
      setMeasurementLoading(false);
      setIsMeasurementModalOpen(true);
    }
  };

  // Ölçü modal'ını kapat
  const handleCloseMeasurementModal = () => {
    setIsMeasurementModalOpen(false);
    setSelectedCustomer(null);
    setSelectedMeasurement(null);
  };

  // Ölçü eklendiğinde
  const handleMeasurementAdded = (newMeasurement) => {
    setSelectedMeasurement(newMeasurement);
    if (onCustomerUpdated) {
      // Müşteri bilgilerini güncelle (ölçü eklendiğinde)
      onCustomerUpdated(selectedCustomer);
    }
  };

  // Ölçü güncellendiğinde
  const handleMeasurementUpdated = (updatedMeasurement) => {
    setSelectedMeasurement(updatedMeasurement);
    if (onCustomerUpdated) {
      // Müşteri bilgilerini güncelle (ölçü güncellendiğinde)
      onCustomerUpdated(selectedCustomer);
    }
  };

  // Müşteri güncellendiğinde çağrılacak
  const handleCustomerUpdated = (updatedCustomer) => {
    if (onCustomerUpdated) {
      onCustomerUpdated(updatedCustomer);
    }
    // Ödeme durumlarını yenile
    setTimeout(() => {
      loadPaymentStatuses();
    }, 1000);
  };

  // Müşteri silme işlemi
  const handleDeleteCustomer = (customer) => {
    if (window.confirm(`${customer.ad} ${customer.soyad} adlı müşteriyi silmek istediğinizden emin misiniz?`)) {
      if (onCustomerDeleted) {
        onCustomerDeleted(customer.id);
      }
    }
  };

  // Müşteri ödeme durumlarını yükle
  const loadPaymentStatuses = async () => {
    if (!customers || customers.length === 0) return;
    
    const statuses = {};
    for (const customer of customers) {
      try {
        const payments = await paymentService.getPaymentsByCustomerId(customer.id);
        if (payments && payments.length > 0) {
          // En son ödeme kaydını al
          const sortedPayments = payments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          const latestPayment = sortedPayments[0];
          
          // Güvenli erişim - odeme_durumu alanı yoksa varsayılan değer kullan
          const paymentStatus = latestPayment.odeme_durumu || latestPayment.odeme_durumu_text || 'ödenmedi';
          statuses[customer.id] = paymentStatus;
        } else {
          statuses[customer.id] = 'ödenmedi';
        }
      } catch (error) {
        console.error(`Müşteri ${customer.id} ödeme durumu yüklenirken hata:`, error);
        statuses[customer.id] = 'bilinmiyor';
      }
    }
    setPaymentStatuses(statuses);
  };

  // Müşteri eklendiğinde ödeme durumlarını yenile
  const handleCustomerAdded = (newCustomer) => {
    if (onCustomerAdded) {
      onCustomerAdded(newCustomer);
    }
    // Ödeme durumlarını yenile
    setTimeout(() => {
      loadPaymentStatuses();
    }, 1000);
  };

  // Component mount olduğunda ödeme durumlarını yükle
  useEffect(() => {
    loadPaymentStatuses();
  }, [customers]);

  // Ödeme durumu badge'ini render et
  const renderPaymentStatus = (customerId) => {
    const status = paymentStatuses[customerId];
    
    if (!status) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          Yükleniyor...
        </span>
      );
    }
    
    const statusConfig = {
      'ödenmedi': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Ödenmedi' },
      'ödendi': { bg: 'bg-green-100', text: 'text-green-800', label: 'Ödendi' },
      'beklemede': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Beklemede' },
      'iptal': { bg: 'bg-red-100', text: 'text-red-800', label: 'İptal' },
      'bilinmiyor': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Bilinmiyor' }
    };
    
    const config = statusConfig[status] || statusConfig['bilinmiyor'];
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
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
          Müşteriler yüklenirken hata oluştu
        </h3>
        <p className="mt-2 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  // Default customers (API'den veri gelmezse)
  const defaultCustomers = customers || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Müşteriler</h1>
          <p className="text-gray-600">
            Salon üyeleri ve müşteri yönetimi
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Yeni Müşteri
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input.Search
              placeholder="Müşteri ara..."
              leftIcon={<Search size={16} />}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Filtrele
            </Button>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Müşteri Listesi ({defaultCustomers.length})
          </h3>
        </div>
        
        {defaultCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Henüz müşteri yok
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              İlk müşterinizi ekleyerek başlayın.
            </p>
            <div className="mt-6">
              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Yeni Müşteri Ekle
              </Button>
            </div>
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
                    Üyelik Durumu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Son Ölçü
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Son Giriş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Üyelik Bitiş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {defaultCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {customer.fotoğraf ? (
                            <img
                              src={customer.fotoğraf}
                              alt={`${customer.ad} ${customer.soyad}`}
                              className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {customer.ad?.charAt(0) || 'M'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.ad} {customer.soyad}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.telefon}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Aktif
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.son_olcum_tarihi ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {customer.boy_cm ? `${customer.boy_cm}cm` : '-'} / {customer.kilo_kg ? `${customer.kilo_kg}kg` : '-'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(customer.son_olcum_tarihi).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Ölçü yok</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.son_giris || 'Henüz giriş yapmadı'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.uyelik_bitis_tarihi || 'Belirtilmedi'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Ruler size={14} />}
                          onClick={() => handleOpenMeasurementModal(customer)}
                        >
                          Ölçü
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Edit size={14} />}
                          onClick={() => handleEditCustomer(customer)}
                        >
                          Düzenle
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Trash2 size={14} />}
                          onClick={() => handleDeleteCustomer(customer)}
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

      {/* Add Customer Form Modal */}
      <AddCustomerForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCustomerAdded={handleCustomerAdded}
      />

      {/* Edit Customer Form Modal */}
      <EditCustomerForm
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        customer={selectedCustomer}
        onCustomerUpdated={handleCustomerUpdated}
      />

      {/* Customer Measurement Form Modal */}
      <CustomerMeasurementForm
        isOpen={isMeasurementModalOpen}
        onClose={handleCloseMeasurementModal}
        customer={selectedCustomer}
        measurement={selectedMeasurement}
        loading={measurementLoading}
        onMeasurementAdded={handleMeasurementAdded}
        onMeasurementUpdated={handleMeasurementUpdated}
      />
    </div>
  );
};

export default Customers; 