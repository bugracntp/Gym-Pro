const express = require('express');
const router = express.Router();
const MemberProgram = require('../models/MemberProgram');

// Tüm üye programlarını getir
router.get('/', async (req, res) => {
  try {
    const program = new MemberProgram();
    const programs = await program.getAll();
    program.close();
    
    res.json(programs);
  } catch (error) {
    console.error('Programlar getirilemedi:', error);
    res.status(500).json({ error: 'Programlar getirilemedi' });
  }
});

// ID'ye göre program getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const program = new MemberProgram();
    const programData = await program.getById(parseInt(id));
    program.close();
    
    if (!programData) {
      return res.status(404).json({ error: 'Program bulunamadı' });
    }
    
    res.json(programData);
  } catch (error) {
    console.error('Program getirilemedi:', error);
    res.status(500).json({ error: 'Program getirilemedi' });
  }
});

// Müşteriye göre programları getir
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const program = new MemberProgram();
    const programs = await program.getByCustomerId(parseInt(customerId));
    program.close();
    
    res.json(programs);
  } catch (error) {
    console.error('Müşteri programları getirilemedi:', error);
    res.status(500).json({ error: 'Müşteri programları getirilemedi' });
  }
});

// Aktif programları getir
router.get('/active', async (req, res) => {
  try {
    const program = new MemberProgram();
    const programs = await program.getActive();
    program.close();
    
    res.json(programs);
  } catch (error) {
    console.error('Aktif programlar getirilemedi:', error);
    res.status(500).json({ error: 'Aktif programlar getirilemedi' });
  }
});

// Pasif programları getir
router.get('/inactive', async (req, res) => {
  try {
    const program = new MemberProgram();
    const programs = await program.getInactive();
    program.close();
    
    res.json(programs);
  } catch (error) {
    console.error('Pasif programlar getirilemedi:', error);
    res.status(500).json({ error: 'Pasif programlar getirilemedi' });
  }
});

// Yeni program ekle
router.post('/', async (req, res) => {
  try {
    const { musteri_id, program_adi, baslangic_tarihi, bitis_tarihi, hedef, aktif } = req.body;
    
    if (!musteri_id || !program_adi || !baslangic_tarihi || !bitis_tarihi || !hedef) {
      return res.status(400).json({ 
        error: 'Müşteri ID, program adı, başlangıç tarihi, bitiş tarihi ve hedef zorunludur' 
      });
    }

    const program = new MemberProgram();
    const result = await program.create({
      musteri_id: parseInt(musteri_id),
      program_adi,
      baslangic_tarihi,
      bitis_tarihi,
      hedef,
      aktif: aktif !== undefined ? aktif : true
    });
    program.close();
    
    res.status(201).json({ 
      id: result.id, 
      message: 'Program başarıyla eklendi' 
    });
  } catch (error) {
    console.error('Program eklenirken hata:', error);
    res.status(500).json({ error: 'Program eklenemedi' });
  }
});

// Program güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { musteri_id, program_adi, baslangic_tarihi, bitis_tarihi, hedef, aktif } = req.body;
    
    if (!musteri_id || !program_adi || !baslangic_tarihi || !bitis_tarihi || !hedef) {
      return res.status(400).json({ 
        error: 'Müşteri ID, program adı, başlangıç tarihi, bitiş tarihi ve hedef zorunludur' 
      });
    }

    const program = new MemberProgram();
    const result = await program.update(parseInt(id), {
      musteri_id: parseInt(musteri_id),
      program_adi,
      baslangic_tarihi,
      bitis_tarihi,
      hedef,
      aktif: aktif !== undefined ? aktif : true
    });
    program.close();
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Program bulunamadı' });
    }
    
    res.json({ message: 'Program başarıyla güncellendi' });
  } catch (error) {
    console.error('Program güncellenirken hata:', error);
    res.status(500).json({ error: 'Program güncellenemedi' });
  }
});

// Program sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const program = new MemberProgram();
    const result = await program.delete(parseInt(id));
    program.close();
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Program bulunamadı' });
    }
    
    res.json({ message: 'Program başarıyla silindi' });
  } catch (error) {
    console.error('Program silinirken hata:', error);
    res.status(500).json({ error: 'Program silinemedi' });
  }
});

// Program durumunu güncelle
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { aktif } = req.body;
    
    if (aktif === undefined) {
      return res.status(400).json({ error: 'Aktif durumu gerekli' });
    }

    const program = new MemberProgram();
    const result = await program.updateStatus(parseInt(id), aktif);
    program.close();
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Program bulunamadı' });
    }
    
    res.json({ message: 'Program durumu başarıyla güncellendi' });
  } catch (error) {
    console.error('Program durumu güncellenirken hata:', error);
    res.status(500).json({ error: 'Program durumu güncellenemedi' });
  }
});

module.exports = router; 