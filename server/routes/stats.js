const express = require('express');
const router = express.Router();
const Stats = require('../models/Stats');

// Dashboard istatistikleri
router.get('/dashboard', async (req, res) => {
  try {
    const stats = new Stats();
    const dashboardStats = await stats.getDashboardStats();
    stats.close();
    
    res.json(dashboardStats);
  } catch (error) {
    console.error('Dashboard istatistikleri getirilemedi:', error);
    res.status(500).json({ error: 'Dashboard istatistikleri getirilemedi' });
  }
});

// Ödemesi yapılmayan müşteriler
router.get('/unpaid-customers', async (req, res) => {
  try {
    const stats = new Stats();
    const unpaidCustomers = await stats.getUnpaidCustomers();
    stats.close();
    
    res.json(unpaidCustomers);
  } catch (error) {
    console.error('Ödemesi yapılmayan müşteriler getirilemedi:', error);
    res.status(500).json({ error: 'Ödemesi yapılmayan müşteriler getirilemedi' });
  }
});

module.exports = router; 