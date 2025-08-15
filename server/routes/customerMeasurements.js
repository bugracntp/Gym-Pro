const express = require('express');
const router = express.Router();
const CustomerMeasurement = require('../models/CustomerMeasurement');

// Tüm müşteri ölçümlerini getir
router.get('/', async (req, res) => {
  try {
    const measurement = new CustomerMeasurement();
    const measurements = await measurement.getAll();
    measurement.close();
    
    res.json(measurements);
  } catch (error) {
    console.error('Müşteri ölçümleri getirilemedi:', error);
    res.status(500).json({ error: 'Müşteri ölçümleri getirilemedi' });
  }
});

// ID'ye göre ölçüm getir
router.get('/:id', async (req, res) => {
  try {
    const measurement = new CustomerMeasurement();
    const measurementData = await measurement.getById(req.params.id);
    measurement.close();
    
    if (!measurementData) {
      return res.status(404).json({ error: 'Ölçüm bulunamadı' });
    }
    
    res.json(measurementData);
  } catch (error) {
    console.error('Ölçüm getirilemedi:', error);
    res.status(500).json({ error: 'Ölçüm getirilemedi' });
  }
});

// Müşteri ID'sine göre ölçümleri getir
router.get('/customer/:customerId', async (req, res) => {
  try {
    const measurement = new CustomerMeasurement();
    const measurements = await measurement.getByCustomerId(req.params.customerId);
    measurement.close();
    
    res.json(measurements);
  } catch (error) {
    console.error('Müşteri ölçümleri getirilemedi:', error);
    res.status(500).json({ error: 'Müşteri ölçümleri getirilemedi' });
  }
});

// Müşterinin en son ölçümünü getir
router.get('/customer/:customerId/latest', async (req, res) => {
  try {
    const measurement = new CustomerMeasurement();
    const latestMeasurement = await measurement.getLatestByCustomerId(req.params.customerId);
    measurement.close();
    
    if (!latestMeasurement) {
      return res.status(404).json({ error: 'Müşteri ölçümü bulunamadı' });
    }
    
    res.json(latestMeasurement);
  } catch (error) {
    console.error('Müşteri son ölçümü getirilemedi:', error);
    res.status(500).json({ error: 'Müşteri son ölçümü getirilemedi' });
  }
});

// Yeni müşteri ölçümü ekle
router.post('/', async (req, res) => {
  try {
    const measurement = new CustomerMeasurement();
    const newMeasurement = await measurement.create(req.body);
    measurement.close();
    
    res.status(201).json(newMeasurement);
  } catch (error) {
    console.error('Müşteri ölçümü eklenirken hata:', error);
    res.status(500).json({ error: 'Müşteri ölçümü eklenemedi: ' + error.message });
  }
});

// Ölçüm güncelle
router.put('/:id', async (req, res) => {
  try {
    const measurement = new CustomerMeasurement();
    const result = await measurement.update(req.params.id, req.body);
    measurement.close();
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Güncellenecek ölçüm bulunamadı' });
    }
    
    res.json({ message: 'Ölçüm başarıyla güncellendi' });
  } catch (error) {
    console.error('Ölçüm güncellenirken hata:', error);
    res.status(500).json({ error: 'Ölçüm güncellenemedi: ' + error.message });
  }
});

// Ölçüm sil
router.delete('/:id', async (req, res) => {
  try {
    const measurement = new CustomerMeasurement();
    const result = await measurement.delete(req.params.id);
    measurement.close();
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Silinecek ölçüm bulunamadı' });
    }
    
    res.json({ message: 'Ölçüm başarıyla silindi' });
  } catch (error) {
    console.error('Ölçüm silinirken hata:', error);
    res.status(500).json({ error: 'Ölçüm silinemedi: ' + error.message });
  }
});

module.exports = router; 