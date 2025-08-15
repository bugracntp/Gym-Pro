const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

// Tüm ödemeleri getir
router.get('/', async (req, res) => {
  try {
    const payment = new Payment();
    const payments = await payment.getAll();
    payment.close();
    
    res.json(payments);
  } catch (error) {
    console.error('Ödemeler getirilemedi:', error);
    res.status(500).json({ error: 'Ödemeler getirilemedi' });
  }
});

// Yeni ödeme ekle
router.post('/', async (req, res) => {
  try {
    const payment = new Payment();
    const result = await payment.create(req.body);
    payment.close();
    
    res.status(201).json({ id: result.id, message: 'Ödeme başarıyla eklendi' });
  } catch (error) {
    console.error('Ödeme eklenirken hata:', error);
    res.status(500).json({ error: 'Ödeme eklenemedi' });
  }
});

// Müşteriye göre ödemeleri getir
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const payment = new Payment();
    const payments = await payment.getByCustomerId(customerId);
    payment.close();
    
    res.json(payments);
  } catch (error) {
    console.error('Müşteri ödemeleri getirilemedi:', error);
    res.status(500).json({ error: 'Müşteri ödemeleri getirilemedi: ' + error.message });
  }
});

// Ödeme güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = new Payment();
    const result = await payment.update(id, req.body);
    payment.close();
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Ödeme bulunamadı' });
    }
    
    res.json({ message: 'Ödeme başarıyla güncellendi', changes: result.changes });
  } catch (error) {
    console.error('Ödeme güncellenirken hata:', error);
    res.status(500).json({ error: 'Ödeme güncellenemedi: ' + error.message });
  }
});

module.exports = router; 