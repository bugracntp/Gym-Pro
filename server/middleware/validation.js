// Validation middleware
const validateCustomer = (req, res, next) => {
  const { name, surname, phone } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Ad en az 2 karakter olmalıdır');
  }

  if (!surname || surname.trim().length < 2) {
    errors.push('Soyad en az 2 karakter olmalıdır');
  }

  if (!phone || phone.trim().length < 10) {
    errors.push('Geçerli bir telefon numarası giriniz');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validasyon hatası',
      details: errors
    });
  }

  next();
};

const validatePayment = (req, res, next) => {
  const { customerId, amount, date, method, status } = req.body;
  const errors = [];

  if (!customerId || isNaN(customerId)) {
    errors.push('Geçerli bir müşteri ID giriniz');
  }

  if (!amount || amount <= 0) {
    errors.push('Geçerli bir tutar giriniz');
  }

  if (!date) {
    errors.push('Geçerli bir tarih giriniz');
  }

  if (!method || !['Nakit', 'Kart', 'Havale'].includes(method)) {
    errors.push('Geçerli bir ödeme yöntemi seçiniz');
  }

  if (!status || !['Ödendi', 'Bekliyor', 'İptal'].includes(status)) {
    errors.push('Geçerli bir durum seçiniz');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validasyon hatası',
      details: errors
    });
  }

  next();
};

const validateProgram = (req, res, next) => {
  const { customerId, name, startDate } = req.body;
  const errors = [];

  if (!customerId || isNaN(customerId)) {
    errors.push('Geçerli bir müşteri ID giriniz');
  }

  if (!name || name.trim().length < 3) {
    errors.push('Program adı en az 3 karakter olmalıdır');
  }

  if (!startDate) {
    errors.push('Geçerli bir başlangıç tarihi giriniz');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validasyon hatası',
      details: errors
    });
  }

  next();
};

const validateEntry = (req, res, next) => {
  const { customerId } = req.body;
  const errors = [];

  if (!customerId || isNaN(customerId)) {
    errors.push('Geçerli bir müşteri ID giriniz');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validasyon hatası',
      details: errors
    });
  }

  next();
};

const validateMembershipType = (req, res, next) => {
  const { name, months, price } = req.body;
  const errors = [];

  if (!name || name.trim().length < 3) {
    errors.push('Üyelik tipi adı en az 3 karakter olmalıdır');
  }

  if (!months || months <= 0 || months > 60) {
    errors.push('Geçerli bir ay sayısı giriniz (1-60)');
  }

  if (!price || price <= 0) {
    errors.push('Geçerli bir fiyat giriniz');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validasyon hatası',
      details: errors
    });
  }

  next();
};

// ID parametresi validasyonu
const validateId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || isNaN(id) || parseInt(id) <= 0) {
    return res.status(400).json({
      error: 'Geçersiz ID formatı'
    });
  }

  next();
};

module.exports = {
  validateCustomer,
  validatePayment,
  validateProgram,
  validateEntry,
  validateMembershipType,
  validateId
}; 