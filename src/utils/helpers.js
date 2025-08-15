// Genel yardımcı fonksiyonlar

// Tarih formatlama
export const formatDate = (dateString, format = 'DD/MM/YYYY') => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year);
};

// Tarih karşılaştırma
export const isDateExpired = (dateString) => {
  if (!dateString) return true;
  const date = new Date(dateString);
  return date < new Date();
};

// Tarih arasındaki gün sayısı
export const daysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Para formatı
export const formatCurrency = (amount, currency = '₺') => {
  if (amount === null || amount === undefined) return '0 ₺';
  return `${parseFloat(amount).toLocaleString('tr-TR')} ${currency}`;
};

// Telefon numarası formatı
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

// TC Kimlik numarası doğrulama
export const validateTCKN = (tckn) => {
  if (!tckn || tckn.length !== 11) return false;
  
  const digits = tckn.split('').map(Number);
  
  // İlk hane 0 olamaz
  if (digits[0] === 0) return false;
  
  // 1, 3, 5, 7, 9. hanelerin toplamının 7 katından, 2, 4, 6, 8. hanelerin toplamı çıkartıldığında, elde edilen sonucun 10'a bölümünden kalan, yani Mod10'u 10. haneyi vermelidir
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  const digit10 = ((oddSum * 7) - evenSum) % 10;
  
  if (digit10 !== digits[9]) return false;
  
  // İlk 10 hanenin toplamından elde edilen sonucun 10'a bölümünden kalan, yani Mod10'u 11. haneyi vermelidir
  const firstTenSum = digits.slice(0, 10).reduce((sum, digit) => sum + digit, 0);
  const digit11 = firstTenSum % 10;
  
  return digit11 === digits[10];
};

// Email doğrulama
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// String temizleme
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/\s+/g, ' ');
};

// Debounce fonksiyonu
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle fonksiyonu
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Local Storage yardımcıları
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('LocalStorage set hatası:', error);
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('LocalStorage get hatası:', error);
      return defaultValue;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('LocalStorage remove hatası:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('LocalStorage clear hatası:', error);
    }
  }
}; 