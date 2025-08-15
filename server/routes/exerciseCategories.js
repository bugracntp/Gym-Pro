const express = require('express');
const router = express.Router();
const ExerciseCategory = require('../models/ExerciseCategory');

// Tüm kategorileri getir
router.get('/', async (req, res) => {
  try {
    const category = new ExerciseCategory();
    const categories = await category.getAll();
    category.close();
    
    res.json(categories);
  } catch (error) {
    console.error('Kategoriler getirilemedi:', error);
    res.status(500).json({ error: 'Kategoriler getirilemedi' });
  }
});

// ID'ye göre kategori getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = new ExerciseCategory();
    const categoryData = await category.getById(parseInt(id));
    category.close();
    
    if (!categoryData) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }
    
    res.json(categoryData);
  } catch (error) {
    console.error('Kategori getirilemedi:', error);
    res.status(500).json({ error: 'Kategori getirilemedi' });
  }
});

// Yeni kategori ekle
router.post('/', async (req, res) => {
  try {
    const { kategori_adi, aciklama } = req.body;
    
    if (!kategori_adi) {
      return res.status(400).json({ 
        error: 'Kategori adı zorunludur' 
      });
    }

    const category = new ExerciseCategory();
    const result = await category.create({
      kategori_adi,
      aciklama: aciklama || ''
    });
    category.close();
    
    res.status(201).json({ 
      id: result.id, 
      message: 'Kategori başarıyla eklendi' 
    });
  } catch (error) {
    console.error('Kategori eklenirken hata:', error);
    res.status(500).json({ error: 'Kategori eklenemedi' });
  }
});

// Kategori güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { kategori_adi, aciklama } = req.body;
    
    if (!kategori_adi) {
      return res.status(400).json({ 
        error: 'Kategori adı zorunludur' 
      });
    }

    const category = new ExerciseCategory();
    const result = await category.update(parseInt(id), {
      kategori_adi,
      aciklama: aciklama || ''
    });
    category.close();
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }
    
    res.json({ message: 'Kategori başarıyla güncellendi' });
  } catch (error) {
    console.error('Kategori güncellenirken hata:', error);
    res.status(500).json({ error: 'Kategori güncellenemedi' });
  }
});

// Kategori sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = new ExerciseCategory();
    const result = await category.delete(parseInt(id));
    category.close();
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }
    
    res.json({ message: 'Kategori başarıyla silindi' });
  } catch (error) {
    console.error('Kategori silinirken hata:', error);
    res.status(500).json({ error: 'Kategori silinemedi' });
  }
});

module.exports = router; 