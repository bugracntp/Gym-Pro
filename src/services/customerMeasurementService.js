import { API_ENDPOINTS, HTTP_METHODS } from '../constants/api';
import { apiRequest } from '../utils/api';

class CustomerMeasurementService {
  // Tüm ölçümleri getir
  async getAll() {
    return apiRequest(API_ENDPOINTS.CUSTOMER_MEASUREMENTS, HTTP_METHODS.GET);
  }

  // ID'ye göre ölçüm getir
  async getById(id) {
    return apiRequest(`${API_ENDPOINTS.CUSTOMER_MEASUREMENTS}/${id}`, HTTP_METHODS.GET);
  }

  // Müşteriye göre ölçümleri getir
  async getByCustomerId(customerId) {
    return apiRequest(`${API_ENDPOINTS.CUSTOMER_MEASUREMENTS}/customer/${customerId}`, HTTP_METHODS.GET);
  }

  // Yeni ölçüm ekle
  async create(measurementData) {
    return apiRequest(API_ENDPOINTS.CUSTOMER_MEASUREMENTS, HTTP_METHODS.POST, measurementData);
  }

  // Ölçüm güncelle
  async update(id, measurementData) {
    return apiRequest(`${API_ENDPOINTS.CUSTOMER_MEASUREMENTS}/${id}`, HTTP_METHODS.PUT, measurementData);
  }

  // Ölçüm sil
  async delete(id) {
    return apiRequest(`${API_ENDPOINTS.CUSTOMER_MEASUREMENTS}/${id}`, HTTP_METHODS.DELETE);
  }

  // Müşteri ölçüm geçmişi
  async getMeasurementHistory(customerId) {
    return apiRequest(`${API_ENDPOINTS.CUSTOMER_MEASUREMENTS}/customer/${customerId}/history`, HTTP_METHODS.GET);
  }

  // Son ölçümleri getir
  async getLatestMeasurements(limit = 10) {
    return apiRequest(`${API_ENDPOINTS.CUSTOMER_MEASUREMENTS}/latest/${limit}`, HTTP_METHODS.GET);
  }

  // Müşterinin en son ölçümünü getir
  async getLatestByCustomerId(customerId) {
    try {
      const measurements = await this.getByCustomerId(customerId);
      if (measurements && measurements.length > 0) {
        // En son tarihli ölçümü döndür
        return measurements.sort((a, b) => new Date(b.olcum_tarihi) - new Date(a.olcum_tarihi))[0];
      }
      return null;
    } catch (error) {
      console.error('Müşteri ölçümü getirilirken hata:', error);
      return null;
    }
  }
}

export const customerMeasurementService = new CustomerMeasurementService(); 