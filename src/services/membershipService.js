import { API_ENDPOINTS, HTTP_METHODS } from '../constants/api';
import { apiRequest } from '../utils/api';

class MembershipService {
  // Tüm üyelikleri getir
  async getAll() {
    return apiRequest(API_ENDPOINTS.MEMBERSHIPS, HTTP_METHODS.GET);
  }

  // ID'ye göre üyelik getir
  async getById(id) {
    return apiRequest(`${API_ENDPOINTS.MEMBERSHIPS}/${id}`, HTTP_METHODS.GET);
  }

  // Müşteriye göre üyelikleri getir
  async getByCustomerId(customerId) {
    return apiRequest(`${API_ENDPOINTS.MEMBERSHIPS}/customer/${customerId}`, HTTP_METHODS.GET);
  }

  // Yeni üyelik ekle
  async create(membershipData) {
    return apiRequest(API_ENDPOINTS.MEMBERSHIPS, HTTP_METHODS.POST, membershipData);
  }

  // Üyelik güncelle
  async update(id, membershipData) {
    return apiRequest(`${API_ENDPOINTS.MEMBERSHIPS}/${id}`, HTTP_METHODS.PUT, membershipData);
  }

  // Üyelik sil
  async delete(id) {
    return apiRequest(`${API_ENDPOINTS.MEMBERSHIPS}/${id}`, HTTP_METHODS.DELETE);
  }

  // Aktif üyelikleri getir
  async getActiveMemberships() {
    return apiRequest(`${API_ENDPOINTS.MEMBERSHIPS}/status/active`, HTTP_METHODS.GET);
  }

  // Süresi dolmak üzere olan üyelikleri getir
  async getExpiringMemberships(days = 7) {
    return apiRequest(`${API_ENDPOINTS.MEMBERSHIPS}/status/expiring/${days}`, HTTP_METHODS.GET);
  }

  // Süresi dolmuş üyelikleri getir
  async getExpiredMemberships() {
    return apiRequest(`${API_ENDPOINTS.MEMBERSHIPS}/status/expired`, HTTP_METHODS.GET);
  }

  // Ödeme durumuna göre üyelikleri getir
  async getByPaymentStatus(status) {
    return apiRequest(`${API_ENDPOINTS.MEMBERSHIPS}/payment/${status}`, HTTP_METHODS.GET);
  }

  // Üyelik istatistikleri
  async getMembershipStats() {
    return apiRequest(`${API_ENDPOINTS.MEMBERSHIPS}/stats/overview`, HTTP_METHODS.GET);
  }

  // Üyelik yenileme (mevcut üyeliği uzatma)
  async renewMembership(membershipId, newEndDate, newPrice) {
    const membership = await this.getById(membershipId);
    if (!membership) {
      throw new Error('Üyelik bulunamadı');
    }

    const updatedData = {
      ...membership,
      bitis_tarihi: newEndDate,
      ucret: newPrice,
      odeme_durumu: 'Bekliyor'
    };

    return this.update(membershipId, updatedData);
  }
}

export const membershipService = new MembershipService(); 