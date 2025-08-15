// API base URL'ini environment variable'dan al
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// API istekleri için yardımcı fonksiyon
const apiRequest = async (endpoint, options = {}) => {
  // Endpoint'i düzelt - /api prefix'ini ekle
  const fullEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
  const url = `${API_BASE_URL}${fullEndpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    // Response type'ını kontrol et
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`API'den beklenmeyen response type: ${contentType}. URL: ${url}`);
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API Request Error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      url: url
    });
    throw error;
  }
};

// API methods
export const api = {
  // GET request
  get: (endpoint) => apiRequest(endpoint),
  
  // POST request
  post: (endpoint, data) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // PUT request
  put: (endpoint, data) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // DELETE request
  delete: (endpoint) => apiRequest(endpoint, {
    method: 'DELETE',
  }),
};

export default api; 