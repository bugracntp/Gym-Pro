const express = require('express');
const router = express.Router();
const MembershipType = require('../models/MembershipType');

// Tüm üyelik tiplerini getir (sadece aktif olanlar)
router.get('/', async (req, res) => {
  try {
    const membershipType = new MembershipType();
    const data = await membershipType.getAll();
    membershipType.close();
    res.json(data);
  } catch (error) {
    console.error('Üyelik tipleri getirilirken hata:', error);
    res.status(500).json({ error: 'Üyelik tipleri getirilemedi' });
  }
});

// Tüm üyelik tiplerini getir (aktif ve pasif dahil)
router.get('/all', async (req, res) => {
  try {
    const membershipType = new MembershipType();
    const data = await membershipType.getAllWithInactive();
    membershipType.close();
    res.json(data);
  } catch (error) {
    console.error('Üyelik tipleri getirilirken hata:', error);
    res.status(500).json({ error: 'Üyelik tipleri getirilemedi' });
  }
});

// Aktif üyelik tiplerini getir
router.get('/active', async (req, res) => {
  try {
    const membershipType = new MembershipType();
    const types = await membershipType.getActive();
    membershipType.close();
    
    res.json(types);
  } catch (error) {
    console.error('Aktif üyelik tipleri getirilemedi:', error);
    res.status(500).json({ error: 'Aktif üyelik tipleri getirilemedi' });
  }
});

// Pasif üyelik tiplerini getir
router.get('/inactive', async (req, res) => {
  try {
    const membershipType = new MembershipType();
    const types = await membershipType.getInactive();
    membershipType.close();
    
    res.json(types);
  } catch (error) {
    console.error('Pasif üyelik tipleri getirilemedi:', error);
    res.status(500).json({ error: 'Pasif üyelik tipleri getirilemedi' });
  }
});

// ID'ye göre üyelik tipi getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const membershipType = new MembershipType();
    const type = await membershipType.getById(parseInt(id));
    membershipType.close();
    
    if (!type) {
      return res.status(404).json({ error: 'Üyelik tipi bulunamadı' });
    }
    
    res.json(type);
  } catch (error) {
    console.error('Üyelik tipi getirilemedi:', error);
    res.status(500).json({ error: 'Üyelik tipi getirilemedi' });
  }
});

// Yeni üyelik tipi ekle
router.post('/', async (req, res) => {
  try {
    const { tip_adi, sure_ay, fiyat, aciklama, aktif } = req.body;
    
    if (!tip_adi || !sure_ay || !fiyat) {
      return res.status(400).json({ 
        error: 'Üyelik tipi adı, süre ve fiyat zorunludur' 
      });
    }

    const membershipType = new MembershipType();
    const result = await membershipType.create({
      tip_adi,
      sure_ay: parseInt(sure_ay),
      fiyat: parseFloat(fiyat),
      aciklama: aciklama || '',
      aktif: aktif !== undefined ? aktif : true
    });
    membershipType.close();
    
    res.status(201).json({ 
      id: result.id, 
      message: 'Üyelik tipi başarıyla eklendi' 
    });
  } catch (error) {
    console.error('Üyelik tipi eklenirken hata:', error);
    res.status(500).json({ error: 'Üyelik tipi eklenemedi' });
  }
});

// Üyelik tipi güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tip_adi, sure_ay, fiyat, aciklama, aktif } = req.body;
    
    if (!tip_adi || !sure_ay || !fiyat) {
      return res.status(400).json({ 
        error: 'Üyelik tipi adı, süre ve fiyat zorunludur' 
      });
    }

    const membershipType = new MembershipType();
    const result = await membershipType.update(parseInt(id), {
      tip_adi,
      sure_ay: parseInt(sure_ay),
      fiyat: parseFloat(fiyat),
      aciklama: aciklama || '',
      aktif: aktif !== undefined ? aktif : true
    });
    membershipType.close();
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Üyelik tipi bulunamadı' });
    }
    
    res.json({ message: 'Üyelik tipi başarıyla güncellendi' });
  } catch (error) {
    console.error('Üyelik tipi güncellenirken hata:', error);
    res.status(500).json({ error: 'Üyelik tipi güncellenemedi' });
  }
});

// Üyelik tipi durumunu güncelle
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { aktif } = req.body;
    
    if (aktif === undefined) {
      return res.status(400).json({ error: 'Aktif durumu belirtilmelidir' });
    }

    const membershipType = new MembershipType();
    const result = await membershipType.updateStatus(parseInt(id), aktif);
    membershipType.close();
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Üyelik tipi bulunamadı' });
    }
    
    res.json({ message: 'Üyelik tipi durumu başarıyla güncellendi' });
  } catch (error) {
    console.error('Üyelik tipi durumu güncellenirken hata:', error);
    res.status(500).json({ error: 'Üyelik tipi durumu güncellenemedi' });
  }
});

// Üyelik tipi sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const membershipType = new MembershipType();
    const result = await membershipType.delete(parseInt(id));
    membershipType.close();
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Üyelik tipi bulunamadı' });
    }
    
    res.json({ message: 'Üyelik tipi başarıyla silindi' });
  } catch (error) {
    console.error('Üyelik tipi silinirken hata:', error);
    res.status(500).json({ error: 'Üyelik tipi silinemedi' });
  }
});

module.exports = router; 