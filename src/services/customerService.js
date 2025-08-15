import { API_ENDPOINTS, HTTP_METHODS } from '../constants/api';
import { apiRequest } from '../utils/api';

class CustomerService {
  // Tüm müşterileri getir
  async getAll() {
    return apiRequest(API_ENDPOINTS.CUSTOMERS, HTTP_METHODS.GET);
  }

  // ID'ye göre müşteri getir
  async getById(id) {
    return apiRequest(`${API_ENDPOINTS.CUSTOMERS}/${id}`, HTTP_METHODS.GET);
  }

  // Yeni müşteri ekle
  async create(customerData) {
    return apiRequest(API_ENDPOINTS.CUSTOMERS, HTTP_METHODS.POST, customerData);
  }

  // Müşteri güncelle
  async update(id, customerData) {
    return apiRequest(`${API_ENDPOINTS.CUSTOMERS}/${id}`, HTTP_METHODS.PUT, customerData);
  }

  // Müşteri sil
  async delete(id) {
    return apiRequest(`${API_ENDPOINTS.CUSTOMERS}/${id}`, HTTP_METHODS.DELETE);
  }

  // Telefona göre müşteri ara
  async searchByPhone(phone) {
    return apiRequest(`${API_ENDPOINTS.CUSTOMERS}/search/phone/${phone}`, HTTP_METHODS.GET);
  }

  // TC kimlik numarasına göre müşteri ara
  async searchByTC(tc) {
    return apiRequest(`${API_ENDPOINTS.CUSTOMERS}/search/tc/${tc}`, HTTP_METHODS.GET);
  }

  // Email'e göre müşteri ara
  async searchByEmail(email) {
    return apiRequest(`${API_ENDPOINTS.CUSTOMERS}/search/email/${email}`, HTTP_METHODS.GET);
  }

  // Aktif müşterileri getir
  async getActiveCustomers() {
    return apiRequest(`${API_ENDPOINTS.CUSTOMERS}/status/active`, HTTP_METHODS.GET);
  }

  // Müşteri istatistikleri
  async getCustomerStats() {
    return apiRequest(`${API_ENDPOINTS.CUSTOMERS}/stats/overview`, HTTP_METHODS.GET);
  }
}

export const customerService = new CustomerService(); 