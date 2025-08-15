import { API_ENDPOINTS, HTTP_METHODS } from '../constants/api';
import { apiRequest } from '../utils/api';

class MemberProgramService {
  // Tüm üye programlarını getir
  async getAll() {
    return apiRequest(API_ENDPOINTS.MEMBER_PROGRAMS, HTTP_METHODS.GET);
  }

  // ID'ye göre program getir
  async getById(id) {
    return apiRequest(`${API_ENDPOINTS.MEMBER_PROGRAMS}/${id}`, HTTP_METHODS.GET);
  }

  // Müşteriye göre programları getir
  async getByCustomerId(customerId) {
    return apiRequest(`${API_ENDPOINTS.MEMBER_PROGRAMS}/customer/${customerId}`, HTTP_METHODS.GET);
  }

  // Yeni program ekle
  async create(programData) {
    return apiRequest(API_ENDPOINTS.MEMBER_PROGRAMS, HTTP_METHODS.POST, programData);
  }

  // Program güncelle
  async update(id, programData) {
    return apiRequest(`${API_ENDPOINTS.MEMBER_PROGRAMS}/${id}`, HTTP_METHODS.PUT, programData);
  }

  // Program sil
  async delete(id) {
    return apiRequest(`${API_ENDPOINTS.MEMBER_PROGRAMS}/${id}`, HTTP_METHODS.DELETE);
  }

  // Program durumunu güncelle
  async updateStatus(id, status) {
    return apiRequest(`${API_ENDPOINTS.MEMBER_PROGRAMS}/${id}/status`, HTTP_METHODS.PATCH, { aktif: status });
  }

  // Aktif programları getir
  async getActive() {
    return apiRequest(`${API_ENDPOINTS.MEMBER_PROGRAMS}/active`, HTTP_METHODS.GET);
  }

  // Pasif programları getir
  async getInactive() {
    return apiRequest(`${API_ENDPOINTS.MEMBER_PROGRAMS}/inactive`, HTTP_METHODS.GET);
  }
}

export const memberProgramService = new MemberProgramService(); 