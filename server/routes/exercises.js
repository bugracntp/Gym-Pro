const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');

// Tüm egzersizleri getir
router.get('/', async (req, res) => {
  try {
    const exercise = new Exercise();
    const exercises = await exercise.getAll();
    exercise.close();
    
    res.json(exercises);
  } catch (error) {
    console.error('Egzersizler getirilemedi:', error);
    res.status(500).json({ error: 'Egzersizler getirilemedi' });
  }
});

// ID'ye göre egzersiz getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const exercise = new Exercise();
    const exerciseData = await exercise.getById(parseInt(id));
    exercise.close();
    
    if (!exerciseData) {
      return res.status(404).json({ error: 'Egzersiz bulunamadı' });
    }
    
    res.json(exerciseData);
  } catch (error) {
    console.error('Egzersiz getirilemedi:', error);
    res.status(500).json({ error: 'Egzersiz getirilemedi' });
  }
});

// Yeni egzersiz ekle
router.post('/', async (req, res) => {
  try {
    const { egzersiz_adi, kategori_id, aciklama, hedef_kas_grubu, zorluk_seviyesi } = req.body;
    
    if (!egzersiz_adi || !hedef_kas_grubu) {
      return res.status(400).json({ 
        error: 'Egzersiz adı ve hedef kas grubu zorunludur' 
      });
    }

    const exercise = new Exercise();
    const result = await exercise.create({
      egzersiz_adi,
      kategori_id: kategori_id || null,
      aciklama: aciklama || '',
      hedef_kas_grubu,
      zorluk_seviyesi: zorluk_seviyesi || 'Başlangıç'
    });
    exercise.close();
    
    res.status(201).json({ 
      id: result.id, 
      message: 'Egzersiz başarıyla eklendi' 
    });
  } catch (error) {
    console.error('Egzersiz eklenirken hata:', error);
    res.status(500).json({ error: 'Egzersiz eklenemedi' });
  }
});

// Egzersiz güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { egzersiz_adi, kategori_id, aciklama, hedef_kas_grubu, zorluk_seviyesi } = req.body;
    
    if (!egzersiz_adi || !hedef_kas_grubu) {
      return res.status(400).json({ 
        error: 'Egzersiz adı ve hedef kas grubu zorunludur' 
      });
    }

    const exercise = new Exercise();
    const result = await exercise.update(parseInt(id), {
      egzersiz_adi,
      kategori_id: kategori_id || null,
      aciklama: aciklama || '',
      hedef_kas_grubu,
      zorluk_seviyesi: zorluk_seviyesi || 'Başlangıç'
    });
    exercise.close();
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Egzersiz bulunamadı' });
    }
    
    res.json({ message: 'Egzersiz başarıyla güncellendi' });
  } catch (error) {
    console.error('Egzersiz güncellenirken hata:', error);
    res.status(500).json({ error: 'Egzersiz güncellenemedi' });
  }
});

// Egzersiz sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const exercise = new Exercise();
    const result = await exercise.delete(parseInt(id));
    exercise.close();
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Egzersiz bulunamadı' });
    }
    
    res.json({ message: 'Egzersiz başarıyla silindi' });
  } catch (error) {
    console.error('Egzersiz silinirken hata:', error);
    res.status(500).json({ error: 'Egzersiz silinemedi' });
  }
});

// Kategoriye göre egzersizleri getir
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const exercise = new Exercise();
    const exercises = await exercise.getByCategory(parseInt(categoryId));
    exercise.close();
    
    res.json(exercises);
  } catch (error) {
    console.error('Kategori egzersizleri getirilemedi:', error);
    res.status(500).json({ error: 'Kategori egzersizleri getirilemedi' });
  }
});

// Zorluk seviyesine göre egzersizleri getir
router.get('/difficulty/:difficulty', async (req, res) => {
  try {
    const { difficulty } = req.params;
    const exercise = new Exercise();
    const exercises = await exercise.getByDifficulty(difficulty);
    exercise.close();
    
    res.json(exercises);
  } catch (error) {
    console.error('Zorluk seviyesi egzersizleri getirilemedi:', error);
    res.status(500).json({ error: 'Zorluk seviyesi egzersizleri getirilemedi' });
  }
});

// Egzersiz arama
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Arama terimi gerekli' });
    }
    
    const exercise = new Exercise();
    const exercises = await exercise.search(q);
    exercise.close();
    
    res.json(exercises);
  } catch (error) {
    console.error('Egzersiz arama hatası:', error);
    res.status(500).json({ error: 'Egzersiz arama yapılamadı' });
  }
});

module.exports = router; 