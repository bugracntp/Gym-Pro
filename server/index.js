const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Middleware imports
const errorHandler = require('./middleware/errorHandler');

// Route imports
const customerRoutes = require('./routes/customers');
const paymentRoutes = require('./routes/payments');
const membershipTypeRoutes = require('./routes/membershipTypes');
const membershipRoutes = require('./routes/memberships');
const customerMeasurementRoutes = require('./routes/customerMeasurements');
const statsRoutes = require('./routes/stats');
const exerciseRoutes = require('./routes/exercises');
const exerciseCategoryRoutes = require('./routes/exerciseCategories');
const memberProgramRoutes = require('./routes/memberPrograms');
const programExerciseRoutes = require('./routes/programExercises');

// Database utility
const Database = require('./utils/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files (if needed)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/customers', customerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/membership-types', membershipTypeRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/customer-measurements', customerMeasurementRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/exercise-categories', exerciseCategoryRoutes);
app.use('/api/member-programs', memberProgramRoutes);
app.use('/api/program-exercises', programExerciseRoutes);

// Legacy endpoints for backward compatibility
app.get('/api/customers', (req, res) => {
  res.redirect('/api/customers');
});

app.get('/api/payments', (req, res) => {
  res.redirect('/api/payments');
});

app.get('/api/membership-types', (req, res) => {
  res.redirect('/api/membership-types');
});

app.get('/api/stats', (req, res) => {
  res.redirect('/api/stats/dashboard');
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint bulunamadı',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware (en son olmalı)
app.use(errorHandler);

// Database initialization
async function initializeDatabase() {
  try {
    const db = new Database();
    await db.connect();
    await db.initializeTables();
    await db.insertDefaultData();
    
    // Health check
    const health = await db.checkHealth();
    console.log('Veritabanı sağlık durumu:', health);
    
    db.close();
    console.log('Veritabanı başarıyla başlatıldı');
  } catch (error) {
    console.error('Veritabanı başlatılırken hata:', error);
    process.exit(1);
  }
}

// Server başlat
async function startServer() {
  try {
    // Veritabanını başlat
    await initializeDatabase();
    
    // Server'ı dinlemeye başla
    app.listen(PORT, () => {
      console.log(`🚀 Server http://localhost:${PORT} adresinde çalışıyor`);
      console.log(`📊 API Documentation: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Server başlatılırken hata:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Server kapatılıyor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Server kapatılıyor...');
  process.exit(0);
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Server'ı başlat
startServer(); 