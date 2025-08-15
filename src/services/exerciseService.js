import { API_ENDPOINTS, HTTP_METHODS } from '../constants/api';
import { apiRequest } from '../utils/api';

class ExerciseService {
  // Tüm egzersizleri getir
  async getAll() {
    return apiRequest(API_ENDPOINTS.EXERCISES, HTTP_METHODS.GET);
  }

  // ID'ye göre egzersiz getir
  async getById(id) {
    return apiRequest(`${API_ENDPOINTS.EXERCISES}/${id}`, HTTP_METHODS.GET);
  }

  // Yeni egzersiz ekle
  async create(exerciseData) {
    return apiRequest(API_ENDPOINTS.EXERCISES, HTTP_METHODS.POST, exerciseData);
  }

  // Egzersiz güncelle
  async update(id, exerciseData) {
    return apiRequest(`${API_ENDPOINTS.EXERCISES}/${id}`, HTTP_METHODS.PUT, exerciseData);
  }

  // Egzersiz sil
  async delete(id) {
    return apiRequest(`${API_ENDPOINTS.EXERCISES}/${id}`, HTTP_METHODS.DELETE);
  }

  // Kategoriye göre egzersizleri getir
  async getByCategory(categoryId) {
    return apiRequest(`${API_ENDPOINTS.EXERCISES}/category/${categoryId}`, HTTP_METHODS.GET);
  }

  // Zorluk seviyesine göre egzersizleri getir
  async getByDifficulty(difficulty) {
    return apiRequest(`${API_ENDPOINTS.EXERCISES}/difficulty/${difficulty}`, HTTP_METHODS.GET);
  }

  // Egzersiz arama
  async search(query) {
    return apiRequest(`${API_ENDPOINTS.EXERCISES}/search?q=${query}`, HTTP_METHODS.GET);
  }
}

export const exerciseService = new ExerciseService(); 