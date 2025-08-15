import { API_ENDPOINTS, HTTP_METHODS } from '../constants/api';
import { apiRequest } from '../utils/api';

class MembershipTypeService {
  // Tüm üyelik tiplerini getir
  async getAll() {
    return apiRequest(API_ENDPOINTS.MEMBERSHIP_TYPES, HTTP_METHODS.GET);
  }

  // Tüm üyelik tiplerini getir (aktif ve pasif dahil)
  async getAllWithInactive() {
    return apiRequest(`${API_ENDPOINTS.MEMBERSHIP_TYPES}/all`, HTTP_METHODS.GET);
  }

  // ID'ye göre üyelik tipi getir
  async getById(id) {
    return apiRequest(`${API_ENDPOINTS.MEMBERSHIP_TYPES}/${id}`, HTTP_METHODS.GET);
  }

  // Yeni üyelik tipi ekle
  async create(typeData) {
    return apiRequest(API_ENDPOINTS.MEMBERSHIP_TYPES, HTTP_METHODS.POST, typeData);
  }

  // Üyelik tipi güncelle
  async update(id, typeData) {
    return apiRequest(`${API_ENDPOINTS.MEMBERSHIP_TYPES}/${id}`, HTTP_METHODS.PUT, typeData);
  }

  // Üyelik tipi durumunu güncelle
  async updateStatus(id, aktif) {
    return apiRequest(`${API_ENDPOINTS.MEMBERSHIP_TYPES}/${id}/status`, HTTP_METHODS.PATCH, { aktif });
  }

  // Üyelik tipi sil
  async delete(id) {
    return apiRequest(`${API_ENDPOINTS.MEMBERSHIP_TYPES}/${id}`, HTTP_METHODS.DELETE);
  }

  // Aktif üyelik tiplerini getir
  async getActive() {
    return apiRequest(`${API_ENDPOINTS.MEMBERSHIP_TYPES}/active`, HTTP_METHODS.GET);
  }

  // Pasif üyelik tiplerini getir
  async getInactive() {
    return apiRequest(`${API_ENDPOINTS.MEMBERSHIP_TYPES}/inactive`, HTTP_METHODS.GET);
  }

  // Fiyata göre üyelik tipi getir
  async getByPrice(price) {
    return apiRequest(`${API_ENDPOINTS.MEMBERSHIP_TYPES}/search/price/${price}`, HTTP_METHODS.GET);
  }

  // Aylık süreye göre üyelik tipi getir
  async getByMonths(months) {
    return apiRequest(`${API_ENDPOINTS.MEMBERSHIP_TYPES}/search/months/${months}`, HTTP_METHODS.GET);
  }

  // En popüler üyelik tiplerini getir
  async getPopularTypes(limit = 5) {
    return apiRequest(`${API_ENDPOINTS.MEMBERSHIP_TYPES}/popular/${limit}`, HTTP_METHODS.GET);
  }

  // Fiyat aralığına göre üyelik tiplerini getir
  async getByPriceRange(minPrice, maxPrice) {
    return apiRequest(`${API_ENDPOINTS.MEMBERSHIP_TYPES}/search/price-range/${minPrice}/${maxPrice}`, HTTP_METHODS.GET);
  }

  // Süre aralığına göre üyelik tiplerini getir
  async getByDurationRange(minMonths, maxMonths) {
    return apiRequest(`${API_ENDPOINTS.MEMBERSHIP_TYPES}/search/duration-range/${minMonths}/${maxMonths}`, HTTP_METHODS.GET);
  }
}

export const membershipTypeService = new MembershipTypeService(); 