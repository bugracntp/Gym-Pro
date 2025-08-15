// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Hata oluştu:', err);

  // Varsayılan hata mesajı
  let error = {
    message: 'Sunucu hatası oluştu',
    status: 500
  };

  // SQLite hataları
  if (err.code === 'SQLITE_CONSTRAINT') {
    error = {
      message: 'Veri bütünlüğü hatası',
      status: 400
    };
  } else if (err.code === 'SQLITE_NOTFOUND') {
    error = {
      message: 'Kayıt bulunamadı',
      status: 404
    };
  } else if (err.code === 'SQLITE_BUSY') {
    error = {
      message: 'Veritabanı meşgul, lütfen tekrar deneyin',
      status: 503
    };
  }

  // Validation hataları
  if (err.name === 'ValidationError') {
    error = {
      message: err.message,
      status: 400
    };
  }

  // Cast hataları (ID formatı)
  if (err.name === 'CastError') {
    error = {
      message: 'Geçersiz ID formatı',
      status: 400
    };
  }

  // Duplicate key hataları
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    error = {
      message: 'Bu kayıt zaten mevcut',
      status: 409
    };
  }

  // Response gönder
  res.status(error.status).json({
    error: error.message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
};

module.exports = errorHandler; 