import { API_ENDPOINTS, HTTP_METHODS } from '../constants/api';
import { apiRequest } from '../utils/api';

class ProgramExerciseService {
  // Programdaki tüm egzersizleri getir
  async getByProgramId(programId) {
    return apiRequest(`${API_ENDPOINTS.PROGRAM_EXERCISES}/program/${programId}`, HTTP_METHODS.GET);
  }

  // ID'ye göre program egzersizi getir
  async getById(id) {
    return apiRequest(`${API_ENDPOINTS.PROGRAM_EXERCISES}/${id}`, HTTP_METHODS.GET);
  }

  // Günlere göre program egzersizlerini getir
  async getByProgramIdAndDay(programId, day) {
    return apiRequest(`${API_ENDPOINTS.PROGRAM_EXERCISES}/program/${programId}/day/${day}`, HTTP_METHODS.GET);
  }

  // Yeni program egzersizi ekle
  async create(exerciseData) {
    return apiRequest(API_ENDPOINTS.PROGRAM_EXERCISES, HTTP_METHODS.POST, exerciseData);
  }

  // Program egzersizi güncelle
  async update(id, exerciseData) {
    return apiRequest(`${API_ENDPOINTS.PROGRAM_EXERCISES}/${id}`, HTTP_METHODS.PUT, exerciseData);
  }

  // Program egzersizi sil
  async delete(id) {
    return apiRequest(`${API_ENDPOINTS.PROGRAM_EXERCISES}/${id}`, HTTP_METHODS.DELETE);
  }

  // Programdaki tüm egzersizleri sil
  async deleteByProgramId(programId) {
    return apiRequest(`${API_ENDPOINTS.PROGRAM_EXERCISES}/program/${programId}`, HTTP_METHODS.DELETE);
  }

  // Toplu program egzersizi ekle
  async createBatch(exercisesData) {
    return apiRequest(`${API_ENDPOINTS.PROGRAM_EXERCISES}/batch`, HTTP_METHODS.POST, exercisesData);
  }

  // Program egzersiz istatistikleri
  async getProgramExerciseStats(programId) {
    return apiRequest(`${API_ENDPOINTS.PROGRAM_EXERCISES}/stats/${programId}`, HTTP_METHODS.GET);
  }
}

export const programExerciseService = new ProgramExerciseService(); 