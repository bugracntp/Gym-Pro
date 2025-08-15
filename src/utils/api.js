import { API_CONFIG, STATUS_CODES } from '../constants/api';

// API istekleri için yardımcı fonksiyonlar
export class ApiUtils {
  // Timeout ile fetch wrapper
  static async fetchWithTimeout(url, options = {}, timeout = API_CONFIG.TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('İstek zaman aşımına uğradı');
      }
      throw error;
    }
  }

  // Response kontrolü
  static checkResponse(response) {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  }

  // JSON parse with error handling
  static async parseJson(response) {
    try {
      return await response.json();
    } catch (error) {
      throw new Error('JSON parse hatası: ' + error.message);
    }
  }

  // Retry logic
  static async retryRequest(requestFn, maxAttempts = API_CONFIG.RETRY_ATTEMPTS) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        if (attempt === maxAttempts) {
          throw lastError;
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // Error message formatting
  static formatErrorMessage(error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.';
    }
    return error.message || 'Bilinmeyen bir hata oluştu.';
  }
}

// HTTP request helpers
export const httpClient = {
  async get(url, options = {}) {
    const response = await ApiUtils.fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    ApiUtils.checkResponse(response);
    return ApiUtils.parseJson(response);
  },

  async post(url, data, options = {}) {
    const response = await ApiUtils.fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data),
      ...options
    });
    
    ApiUtils.checkResponse(response);
    return ApiUtils.parseJson(response);
  },

  async put(url, data, options = {}) {
    const response = await ApiUtils.fetchWithTimeout(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data),
      ...options
    });
    
    ApiUtils.checkResponse(response);
    return ApiUtils.parseJson(response);
  },

  async patch(url, data, options = {}) {
    const response = await ApiUtils.fetchWithTimeout(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data),
      ...options
    });
    
    ApiUtils.checkResponse(response);
    return ApiUtils.parseJson(response);
  },

  async delete(url, options = {}) {
    const response = await ApiUtils.fetchWithTimeout(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    ApiUtils.checkResponse(response);
    return ApiUtils.parseJson(response);
  }
};

// Ana API request fonksiyonu
export const apiRequest = async (endpoint, method, data = null) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  try {
    switch (method) {
      case 'GET':
        return await httpClient.get(url);
      case 'POST':
        return await httpClient.post(url, data);
      case 'PUT':
        return await httpClient.put(url, data);
      case 'PATCH':
        return await httpClient.patch(url, data);
      case 'DELETE':
        return await httpClient.delete(url);
      default:
        throw new Error(`Desteklenmeyen HTTP metodu: ${method}`);
    }
  } catch (error) {
    console.error(`API Request Error (${method} ${endpoint}):`, error);
    throw new Error(ApiUtils.formatErrorMessage(error));
  }
}; 