import { API_CONFIG } from '../constants/api';
import { httpClient } from '../utils/api';

export class BaseService {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  // Tam URL oluştur
  getFullUrl(path = '') {
    return `${this.baseUrl}${this.endpoint}${path}`;
  }

  // Tüm kayıtları getir
  async getAll(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = this.getFullUrl(queryString ? `?${queryString}` : '');
      return await httpClient.get(url);
    } catch (error) {
      throw new Error(`Veri getirme hatası: ${error.message}`);
    }
  }

  // ID'ye göre getir
  async getById(id) {
    try {
      const url = this.getFullUrl(`/${id}`);
      return await httpClient.get(url);
    } catch (error) {
      throw new Error(`ID ile getirme hatası: ${error.message}`);
    }
  }

  // Yeni kayıt ekle
  async create(data) {
    try {
      const url = this.getFullUrl();
      return await httpClient.post(url, data);
    } catch (error) {
      throw new Error(`Oluşturma hatası: ${error.message}`);
    }
  }

  // Kayıt güncelle
  async update(id, data) {
    try {
      const url = this.getFullUrl(`/${id}`);
      return await httpClient.put(url, data);
    } catch (error) {
      throw new Error(`Güncelleme hatası: ${error.message}`);
    }
  }

  // Kayıt sil
  async delete(id) {
    try {
      const url = this.getFullUrl(`/${id}`);
      return await httpClient.delete(url);
    } catch (error) {
      throw new Error(`Silme hatası: ${error.message}`);
    }
  }

  // Arama yap
  async search(query, filters = {}) {
    try {
      const searchParams = { q: query, ...filters };
      const queryString = new URLSearchParams(searchParams).toString();
      const url = this.getFullUrl(`/search?${queryString}`);
      return await httpClient.get(url);
    } catch (error) {
      throw new Error(`Arama hatası: ${error.message}`);
    }
  }

  // Sayfalama ile getir
  async getPaginated(page = 1, limit = 10, filters = {}) {
    try {
      const params = { page, limit, ...filters };
      const queryString = new URLSearchParams(params).toString();
      const url = this.getFullUrl(`/paginated?${queryString}`);
      return await httpClient.get(url);
    } catch (error) {
      throw new Error(`Sayfalama hatası: ${error.message}`);
    }
  }
} 