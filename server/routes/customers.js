const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// Tüm müşterileri getir
router.get('/', async (req, res) => {
  try {
    const customer = new Customer();
    const customers = await customer.getAll();
    customer.close();
    
    res.json(customers);
  } catch (error) {
    console.error('Müşteriler getirilemedi:', error);
    res.status(500).json({ error: 'Müşteriler getirilemedi' });
  }
});

// Yeni müşteri ekle
router.post('/', async (req, res) => {
  try {
    
    const customer = new Customer();
    const newCustomer = await customer.create(req.body);
    customer.close();
    
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Müşteri eklenirken hata:', error);
    res.status(500).json({ error: 'Müşteri eklenemedi: ' + error.message });
  }
});

// Müşteri güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = new Customer();
    const result = await customer.update(id, req.body);
    customer.close();
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }
    
    res.json({ message: 'Müşteri başarıyla güncellendi', changes: result.changes });
  } catch (error) {
    console.error('Müşteri güncellenirken hata:', error);
    res.status(500).json({ error: 'Müşteri güncellenemedi: ' + error.message });
  }
});

// Müşteri sil (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = new Customer();
    const result = await customer.delete(id);
    customer.close();
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }
    
    res.json({ message: 'Müşteri başarıyla silindi', changes: result.changes });
  } catch (error) {
    console.error('Müşteri silinirken hata:', error);
    res.status(500).json({ error: 'Müşteri silinemedi: ' + error.message });
  }
});

module.exports = router; 