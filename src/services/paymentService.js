import { API_ENDPOINTS, HTTP_METHODS } from '../constants/api';
import { apiRequest } from '../utils/api';

class PaymentService {
  // Tüm ödemeleri getir
  async getAll() {
    return apiRequest(API_ENDPOINTS.PAYMENTS, HTTP_METHODS.GET);
  }

  // ID'ye göre ödeme getir
  async getById(id) {
    return apiRequest(`${API_ENDPOINTS.PAYMENTS}/${id}`, HTTP_METHODS.GET);
  }

  // Yeni ödeme ekle
  async create(paymentData) {
    return apiRequest(API_ENDPOINTS.PAYMENTS, HTTP_METHODS.POST, paymentData);
  }

  // Ödeme güncelle
  async update(id, paymentData) {
    return apiRequest(`${API_ENDPOINTS.PAYMENTS}/${id}`, HTTP_METHODS.PUT, paymentData);
  }

  // Ödeme sil
  async delete(id) {
    return apiRequest(`${API_ENDPOINTS.PAYMENTS}/${id}`, HTTP_METHODS.DELETE);
  }

  // Ödeme geçmişi
  async getPaymentHistory(customerId, params = {}) {
    try {
      const queryString = new URLSearchParams({ customer_id: customerId, ...params }).toString();
      const endpoint = `${API_ENDPOINTS.PAYMENTS}/history?${queryString}`;
      return await apiRequest(endpoint, HTTP_METHODS.GET);
    } catch (error) {
      throw new Error(`Ödeme geçmişi hatası: ${error.message}`);
    }
  }

  // Ödeme raporu
  async getPaymentReport(startDate, endDate, filters = {}) {
    try {
      const queryString = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        ...filters
      }).toString();
      const endpoint = `${API_ENDPOINTS.PAYMENTS}/report?${queryString}`;
      return await apiRequest(endpoint, HTTP_METHODS.GET);
    } catch (error) {
      throw new Error(`Ödeme raporu hatası: ${error.message}`);
    }
  }

  // Ödeme istatistikleri
  async getPaymentStats(period = 'month') {
    try {
      const endpoint = `${API_ENDPOINTS.PAYMENTS}/stats?period=${period}`;
      return await apiRequest(endpoint, HTTP_METHODS.GET);
    } catch (error) {
      throw new Error(`Ödeme istatistikleri hatası: ${error.message}`);
    }
  }

  // Ödeme onaylama
  async approvePayment(paymentId, approvalData = {}) {
    try {
      const endpoint = `${API_ENDPOINTS.PAYMENTS}/${paymentId}/approve`;
      return await apiRequest(endpoint, HTTP_METHODS.POST, approvalData);
    } catch (error) {
      throw new Error(`Ödeme onaylama hatası: ${error.message}`);
    }
  }

  // Ödeme iptal etme
  async cancelPayment(paymentId, cancellationData = {}) {
    try {
      const endpoint = `${API_ENDPOINTS.PAYMENTS}/${paymentId}/cancel`;
      return await apiRequest(endpoint, HTTP_METHODS.POST, cancellationData);
    } catch (error) {
      throw new Error(`Ödeme iptal hatası: ${error.message}`);
    }
  }

  // Ödeme iadesi
  async refundPayment(paymentId, refundData) {
    try {
      const endpoint = `${API_ENDPOINTS.PAYMENTS}/${paymentId}/refund`;
      return await apiRequest(endpoint, HTTP_METHODS.POST, refundData);
    } catch (error) {
      throw new Error(`Ödeme iadesi hatası: ${error.message}`);
    }
  }

  // Toplu ödeme işlemi
  async processBulkPayments(payments) {
    try {
      const endpoint = `${API_ENDPOINTS.PAYMENTS}/bulk-process`;
      return await apiRequest(endpoint, HTTP_METHODS.POST, { payments });
    } catch (error) {
      throw new Error(`Toplu ödeme işlemi hatası: ${error.message}`);
    }
  }

  // Ödeme hatırlatıcıları
  async sendPaymentReminders(customerIds, reminderData = {}) {
    try {
      const endpoint = `${API_ENDPOINTS.PAYMENTS}/reminders`;
      return await apiRequest(endpoint, HTTP_METHODS.POST, {
        customer_ids: customerIds,
        ...reminderData
      });
    } catch (error) {
      throw new Error(`Ödeme hatırlatıcı hatası: ${error.message}`);
    }
  }

  // Ödeme planı oluşturma
  async createPaymentPlan(planData) {
    try {
      const endpoint = `${API_ENDPOINTS.PAYMENTS}/plans`;
      return await apiRequest(endpoint, HTTP_METHODS.POST, planData);
    } catch (error) {
      throw new Error(`Ödeme planı oluşturma hatası: ${error.message}`);
    }
  }

  // Ödeme planı güncelleme
  async updatePaymentPlan(planId, planData) {
    try {
      const endpoint = `${API_ENDPOINTS.PAYMENTS}/plans/${planId}`;
      return await apiRequest(endpoint, HTTP_METHODS.PUT, planData);
    } catch (error) {
      throw new Error(`Ödeme planı güncelleme hatası: ${error.message}`);
    }
  }

  // Ödeme planı silme
  async deletePaymentPlan(planId) {
    try {
      const endpoint = `${API_ENDPOINTS.PAYMENTS}/plans/${planId}`;
      return await apiRequest(endpoint, HTTP_METHODS.DELETE);
    } catch (error) {
      throw new Error(`Ödeme planı silme hatası: ${error.message}`);
    }
  }

  // Ödeme planları listesi
  async getPaymentPlans(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const endpoint = `${API_ENDPOINTS.PAYMENTS}/plans${queryString ? `?${queryString}` : ''}`;
      return await apiRequest(endpoint, HTTP_METHODS.GET);
    } catch (error) {
      throw new Error(`Ödeme planları listesi hatası: ${error.message}`);
    }
  }

  // Ödeme yöntemi istatistikleri
  async getPaymentMethodStats(period = 'month') {
    try {
      const endpoint = `${API_ENDPOINTS.PAYMENTS}/methods/stats?period=${period}`;
      return await apiRequest(endpoint, HTTP_METHODS.GET);
    } catch (error) {
      throw new Error(`Ödeme yöntemi istatistikleri hatası: ${error.message}`);
    }
  }

  // Ödeme durumu istatistikleri
  async getPaymentStatusStats(period = 'month') {
    try {
      const endpoint = `${API_ENDPOINTS.PAYMENTS}/status/stats?period=${period}`;
      return await apiRequest(endpoint, HTTP_METHODS.GET);
    } catch (error) {
      throw new Error(`Ödeme durumu istatistikleri hatası: ${error.message}`);
    }
  }

  // Müşteri ID'sine göre ödeme kayıtlarını getir
  async getPaymentsByCustomerId(customerId) {
    try {
      const endpoint = `${API_ENDPOINTS.PAYMENTS}/customer/${customerId}`;
      return await apiRequest(endpoint, HTTP_METHODS.GET);
    } catch (error) {
      throw new Error(`Müşteri ödemeleri getirme hatası: ${error.message}`);
    }
  }

  // Ödeme durumunu güncelle (ödenmedi -> ödendi)
  async updateStatus(paymentId, status) {
    
    try {
      // Sadece çalışan endpoint'i kullan
      const endpoint = `${API_ENDPOINTS.PAYMENTS}/${paymentId}/status`;
      const method = HTTP_METHODS.PATCH;
      const data = { odeme_durumu: status };

      const result = await apiRequest(endpoint, method, data);
      
      return result;
    } catch (error) {
      console.error('PaymentService.updateStatus hatası:', error);
      throw new Error(`Ödeme durumu güncelleme hatası: ${error.message}`);
    }
  }

  // Ödeme durumunu güncelle (ödenmedi -> ödendi) - Alias
  async updatePaymentStatus(paymentId, status) {
    return this.updateStatus(paymentId, status);
  }

  // Ödenmemiş ödemeleri getir
  async getUnpaidPayments() {
    try {
      const endpoint = `${API_ENDPOINTS.PAYMENTS}/unpaid`;
      return await apiRequest(endpoint, HTTP_METHODS.GET);
    } catch (error) {
      throw new Error(`Ödenmemiş ödemeler getirme hatası: ${error.message}`);
    }
  }

  // Ödenmiş ödemeleri getir
  async getPaidPayments() {
    try {
      const endpoint = `${API_ENDPOINTS.PAYMENTS}/paid`;
      return await apiRequest(endpoint, HTTP_METHODS.GET);
    } catch (error) {
      throw new Error(`Ödenmiş ödemeler getirme hatası: ${error.message}`);
    }
  }

  // Aylık gelir hesapla
  async getMonthlyIncome(month, year) {
    try {
      const endpoint = `${API_ENDPOINTS.PAYMENTS}/monthly-income?month=${month}&year=${year}`;
      return await apiRequest(endpoint, HTTP_METHODS.GET);
    } catch (error) {
      throw new Error(`Aylık gelir hesaplama hatası: ${error.message}`);
    }
  }
}

export const paymentService = new PaymentService(); 