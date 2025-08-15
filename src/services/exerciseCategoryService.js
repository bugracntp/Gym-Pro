import { API_ENDPOINTS, HTTP_METHODS } from '../constants/api';
import { apiRequest } from '../utils/api';

class ExerciseCategoryService {
  // Tüm kategorileri getir
  async getAll() {
    return apiRequest(API_ENDPOINTS.EXERCISE_CATEGORIES, HTTP_METHODS.GET);
  }

  // ID'ye göre kategori getir
  async getById(id) {
    return apiRequest(`${API_ENDPOINTS.EXERCISE_CATEGORIES}/${id}`, HTTP_METHODS.GET);
  }

  // Yeni kategori ekle
  async create(categoryData) {
    return apiRequest(API_ENDPOINTS.EXERCISE_CATEGORIES, HTTP_METHODS.POST, categoryData);
  }

  // Kategori güncelle
  async update(id, categoryData) {
    return apiRequest(`${API_ENDPOINTS.EXERCISE_CATEGORIES}/${id}`, HTTP_METHODS.PUT, categoryData);
  }

  // Kategori sil
  async delete(id) {
    return apiRequest(`${API_ENDPOINTS.EXERCISE_CATEGORIES}/${id}`, HTTP_METHODS.DELETE);
  }
}

export const exerciseCategoryService = new ExerciseCategoryService(); 