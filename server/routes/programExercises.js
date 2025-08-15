const express = require('express');
const router = express.Router();
const ProgramExercise = require('../models/ProgramExercise');

// Programdaki tüm egzersizleri getir
router.get('/program/:programId', async (req, res) => {
  try {
    const { programId } = req.params;
    const programExercise = new ProgramExercise();
    const exercises = await programExercise.getByProgramId(parseInt(programId));
    programExercise.close();
    
    res.json(exercises);
  } catch (error) {
    console.error('Program egzersizleri getirilemedi:', error);
    res.status(500).json({ error: 'Program egzersizleri getirilemedi' });
  }
});

// ID'ye göre program egzersizi getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const programExercise = new ProgramExercise();
    const exercise = await programExercise.getById(parseInt(id));
    programExercise.close();
    
    if (!exercise) {
      return res.status(404).json({ error: 'Program egzersizi bulunamadı' });
    }
    
    res.json(exercise);
  } catch (error) {
    console.error('Program egzersizi getirilemedi:', error);
    res.status(500).json({ error: 'Program egzersizi getirilemedi' });
  }
});

// Günlere göre program egzersizlerini getir
router.get('/program/:programId/day/:day', async (req, res) => {
  try {
    const { programId, day } = req.params;
    const programExercise = new ProgramExercise();
    const exercises = await programExercise.getByProgramIdAndDay(parseInt(programId), day);
    programExercise.close();
    
    res.json(exercises);
  } catch (error) {
    console.error('Günlük program egzersizleri getirilemedi:', error);
    res.status(500).json({ error: 'Günlük program egzersizleri getirilemedi' });
  }
});

// Yeni program egzersizi ekle
router.post('/', async (req, res) => {
  try {
    const { 
      program_id, 
      egzersiz_id, 
      gun, 
      set_sayisi, 
      tekrar_sayisi, 
      notlar 
    } = req.body;
    
    if (!program_id || !egzersiz_id || !gun || !set_sayisi || !tekrar_sayisi) {
      return res.status(400).json({ 
        error: 'Program ID, egzersiz ID, gün, set sayısı ve tekrar sayısı zorunludur' 
      });
    }

    const programExercise = new ProgramExercise();
    const result = await programExercise.create({
      program_id: parseInt(program_id),
      egzersiz_id: parseInt(egzersiz_id),
      gun,
      set_sayisi: parseInt(set_sayisi),
      tekrar_sayisi,
      notlar: notlar || ''
    });
    programExercise.close();
    
    res.status(201).json({ 
      id: result.id, 
      message: 'Program egzersizi başarıyla eklendi' 
    });
  } catch (error) {
    console.error('Program egzersizi eklenirken hata:', error);
    res.status(500).json({ error: 'Program egzersizi eklenemedi' });
  }
});

// Toplu program egzersizi ekle
router.post('/batch', async (req, res) => {
  try {
    const { exercises } = req.body;
    
    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ 
        error: 'Egzersiz listesi gerekli ve boş olamaz' 
      });
    }

    const programExercise = new ProgramExercise();
    const result = await programExercise.createBatch(exercises);
    programExercise.close();
    
    res.status(201).json({ 
      successCount: result.successCount,
      errorCount: result.errorCount,
      message: `${result.successCount} egzersiz başarıyla eklendi, ${result.errorCount} hata oluştu` 
    });
  } catch (error) {
    console.error('Toplu program egzersizi eklenirken hata:', error);
    res.status(500).json({ error: 'Toplu program egzersizi eklenemedi' });
  }
});

// Program egzersizi güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      egzersiz_id, 
      gun, 
      set_sayisi, 
      tekrar_sayisi, 
      notlar 
    } = req.body;
    
    if (!egzersiz_id || !gun || !set_sayisi || !tekrar_sayisi) {
      return res.status(400).json({ 
        error: 'Egzersiz ID, gün, set sayısı ve tekrar sayısı zorunludur' 
      });
    }

    const programExercise = new ProgramExercise();
    const result = await programExercise.update(parseInt(id), {
      egzersiz_id: parseInt(egzersiz_id),
      gun,
      set_sayisi: parseInt(set_sayisi),
      tekrar_sayisi,
      notlar: notlar || ''
    });
    programExercise.close();
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Program egzersizi bulunamadı' });
    }
    
    res.json({ message: 'Program egzersizi başarıyla güncellendi' });
  } catch (error) {
    console.error('Program egzersizi güncellenirken hata:', error);
    res.status(500).json({ error: 'Program egzersizi güncellenemedi' });
  }
});

// Program egzersizi sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const programExercise = new ProgramExercise();
    const result = await programExercise.delete(parseInt(id));
    programExercise.close();
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Program egzersizi bulunamadı' });
    }
    
    res.json({ message: 'Program egzersizi başarıyla silindi' });
  } catch (error) {
    console.error('Program egzersizi silinirken hata:', error);
    res.status(500).json({ error: 'Program egzersizi silinemedi' });
  }
});

// Programdaki tüm egzersizleri sil
router.delete('/program/:programId', async (req, res) => {
  try {
    const { programId } = req.params;
    const programExercise = new ProgramExercise();
    const result = await programExercise.deleteByProgramId(parseInt(programId));
    programExercise.close();
    
    res.json({ 
      message: `Programdaki ${result.changes} egzersiz başarıyla silindi` 
    });
  } catch (error) {
    console.error('Program egzersizleri silinirken hata:', error);
    res.status(500).json({ error: 'Program egzersizleri silinemedi' });
  }
});

// Program egzersiz istatistikleri
router.get('/stats/:programId', async (req, res) => {
  try {
    const { programId } = req.params;
    const programExercise = new ProgramExercise();
    const stats = await programExercise.getProgramExerciseStats(parseInt(programId));
    programExercise.close();
    
    res.json(stats);
  } catch (error) {
    console.error('Program egzersiz istatistikleri getirilemedi:', error);
    res.status(500).json({ error: 'Program egzersiz istatistikleri getirilemedi' });
  }
});

module.exports = router; 