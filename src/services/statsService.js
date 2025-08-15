import { API_ENDPOINTS, HTTP_METHODS } from '../constants/api';
import { apiRequest } from '../utils/api';

class StatsService {
  // Dashboard istatistikleri
  async getDashboardStats(params = {}, signal) {
    try {
      return await apiRequest(`${API_ENDPOINTS.STATS}/dashboard`, HTTP_METHODS.GET);
    } catch (error) {
      throw new Error(`Dashboard istatistikleri hatası: ${error.message}`);
    }
  }

  // Genel istatistikler
  async getGeneralStats(period = 'month', signal) {
    try {
      return await apiRequest(`${API_ENDPOINTS.STATS}/general?period=${period}`, HTTP_METHODS.GET);
    } catch (error) {
      throw new Error(`Genel istatistikler hatası: ${error.message}`);
    }
  }

  // Müşteri istatistikleri
  async getCustomerStats(filters = {}, signal) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const endpoint = `${API_ENDPOINTS.STATS}/customers${queryString ? `?${queryString}` : ''}`;
      return await apiRequest(endpoint, HTTP_METHODS.GET);
    } catch (error) {
      throw new Error(`Müşteri istatistikleri hatası: ${error.message}`);
    }
  }

  // Gelir istatistikleri
  async getRevenueStats(startDate, endDate, groupBy = 'day', signal) {
    try {
      const queryString = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        group_by: groupBy
      }).toString();
      const endpoint = `${API_ENDPOINTS.STATS}/revenue?${queryString}`;
      return await apiRequest(endpoint, HTTP_METHODS.GET);
    } catch (error) {
      throw new Error(`Gelir istatistikleri hatası: ${error.message}`);
    }
  }

  // Üyelik istatistikleri
  async getMembershipStats(filters = {}, signal) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const endpoint = `${API_ENDPOINTS.STATS}/memberships${queryString ? `?${queryString}` : ''}`;
      return await apiRequest(endpoint, HTTP_METHODS.GET);
    } catch (error) {
      throw new Error(`Üyelik istatistikleri hatası: ${error.message}`);
    }
  }

  // Giriş istatistikleri
  async getEntryStats(startDate, endDate, groupBy = 'day', signal) {
    try {
      const queryString = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        group_by: groupBy
      }).toString();
      const endpoint = `${API_ENDPOINTS.STATS}/entries?${queryString}`;
      return await apiRequest(endpoint, HTTP_METHODS.GET);
    } catch (error) {
      throw new Error(`Giriş istatistikleri hatası: ${error.message}`);
    }
  }

  // Program istatistikleri
  async getProgramStats(filters = {}, signal) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const endpoint = `${API_ENDPOINTS.STATS}/programs${queryString ? `?${queryString}` : ''}`;
      return await apiRequest(endpoint, HTTP_METHODS.GET);
    } catch (error) {
      throw new Error(`Program istatistikleri hatası: ${error.message}`);
    }
  }

  // Yaş ve cinsiyet dağılımı
  async getDemographicStats(params = {}, signal) {
    try {
      return await apiRequest(`${API_ENDPOINTS.STATS}/demographics`, HTTP_METHODS.GET);
    } catch (error) {
      throw new Error(`Demografik istatistikler hatası: ${error.message}`);
    }
  }

  // Zaman bazlı analiz
  async getTimeBasedStats(startDate, endDate, interval = 'hour', signal) {
    try {
      const queryString = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        interval
      }).toString();
      const endpoint = `${API_ENDPOINTS.STATS}/time-based?${queryString}`;
      return await apiRequest(endpoint, HTTP_METHODS.GET);
    } catch (error) {
      throw new Error(`Zaman bazlı istatistikler hatası: ${error.message}`);
    }
  }

  // Karşılaştırmalı analiz
  async getComparativeStats(period1, period2, metrics = [], signal) {
    try {
      const queryString = new URLSearchParams({
        period1,
        period2,
        metrics: metrics.join(',')
      }).toString();
      const endpoint = `${API_ENDPOINTS.STATS}/comparative?${queryString}`;
      return await apiRequest(endpoint, HTTP_METHODS.GET);
    } catch (error) {
      throw new Error(`Karşılaştırmalı istatistikler hatası: ${error.message}`);
    }
  }

  // Tahmin istatistikleri
  async getForecastStats(periods = 12, metric = 'revenue', signal) {
    try {
      const queryString = new URLSearchParams({
        periods,
        metric
      }).toString();
      const endpoint = `${API_ENDPOINTS.STATS}/forecast?${queryString}`;
      return await apiRequest(endpoint, HTTP_METHODS.GET);
    } catch (error) {
      throw new Error(`Tahmin istatistikleri hatası: ${error.message}`);
    }
  }

  // Export istatistikleri
  async exportStats(format = 'csv', filters = {}, signal) {
    try {
      const queryString = new URLSearchParams({ format, ...filters }).toString();
      const endpoint = `${API_ENDPOINTS.STATS}/export?${queryString}`;
      return await apiRequest(endpoint, HTTP_METHODS.GET);
    } catch (error) {
      throw new Error(`İstatistik export hatası: ${error.message}`);
    }
  }

  // Real-time istatistikler
  async getRealTimeStats(params = {}, signal) {
    try {
      return await apiRequest(`${API_ENDPOINTS.STATS}/realtime`, HTTP_METHODS.GET);
    } catch (error) {
      throw new Error(`Real-time istatistikler hatası: ${error.message}`);
    }
  }

  // Ödemesi yapılmayan müşterileri getir
  async getUnpaidCustomers(signal) {
    try {
      return await apiRequest(`${API_ENDPOINTS.STATS}/unpaid-customers`, HTTP_METHODS.GET);
    } catch (error) {
      throw new Error(`Ödemesi yapılmayan müşteriler hatası: ${error.message}`);
    }
  }
}

export const statsService = new StatsService(); 