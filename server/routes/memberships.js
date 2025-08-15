const express = require('express');
const Membership = require('../models/Membership');

const router = express.Router();

// Tüm üyelikleri getir
router.get('/', async (req, res) => {
  try {
    const membership = new Membership();
    const memberships = await membership.getAll();
    membership.close();
    
    res.json(memberships);
  } catch (error) {
    console.error('Üyelikler getirilirken hata:', error);
    res.status(500).json({ error: 'Üyelikler getirilemedi' });
  }
});

// ID'ye göre üyelik getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const membership = new Membership();
    const membershipData = await membership.getById(id);
    membership.close();
    
    if (!membershipData) {
      return res.status(404).json({ error: 'Üyelik bulunamadı' });
    }
    
    res.json(membershipData);
  } catch (error) {
    console.error('Üyelik getirilirken hata:', error);
    res.status(500).json({ error: 'Üyelik getirilemedi' });
  }
});

// Müşteriye göre üyelikleri getir
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const membership = new Membership();
    const memberships = await membership.getByCustomerId(customerId);
    membership.close();
    
    res.json(memberships);
  } catch (error) {
    console.error('Müşteri üyelikleri getirilirken hata:', error);
    res.status(500).json({ error: 'Müşteri üyelikleri getirilemedi' });
  }
});

// Yeni üyelik ekle
router.post('/', async (req, res) => {
  try {
    const { 
      musteri_id, uyelik_tipi_id, baslangic_tarihi, 
      bitis_tarihi, ucret, odeme_durumu 
    } = req.body;
    
    if (!musteri_id || !uyelik_tipi_id || !baslangic_tarihi || !bitis_tarihi || !ucret) {
      return res.status(400).json({ 
        error: 'Müşteri ID, üyelik tipi, başlangıç tarihi, bitiş tarihi ve ücret zorunludur' 
      });
    }

    const membership = new Membership();
    const result = await membership.create({
      musteri_id, uyelik_tipi_id, baslangic_tarihi, 
      bitis_tarihi, ucret, odeme_durumu: odeme_durumu || 'Bekliyor'
    });
    membership.close();
    
    res.status(201).json({ 
      id: result.id, 
      message: 'Üyelik başarıyla oluşturuldu' 
    });
  } catch (error) {
    console.error('Üyelik eklenirken hata:', error);
    res.status(500).json({ error: 'Üyelik eklenemedi' });
  }
});

// Üyelik güncelle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      musteri_id, uyelik_tipi_id, baslangic_tarihi, 
      bitis_tarihi, ucret, odeme_durumu 
    } = req.body;
    
    if (!musteri_id || !uyelik_tipi_id || !baslangic_tarihi || !bitis_tarihi || !ucret) {
      return res.status(400).json({ 
        error: 'Müşteri ID, üyelik tipi, başlangıç tarihi, bitiş tarihi ve ücret zorunludur' 
      });
    }

    const membership = new Membership();
    const result = await membership.update(id, {
      musteri_id, uyelik_tipi_id, baslangic_tarihi, 
      bitis_tarihi, ucret, odeme_durumu
    });
    membership.close();
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Üyelik bulunamadı' });
    }
    
    res.json({ message: 'Üyelik başarıyla güncellendi' });
  } catch (error) {
    console.error('Üyelik güncellenirken hata:', error);
    res.status(500).json({ error: 'Üyelik güncellenemedi' });
  }
});

// Üyelik sil (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const membership = new Membership();
    const result = await membership.delete(id);
    membership.close();
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Üyelik bulunamadı' });
    }
    
    res.json({ message: 'Üyelik başarıyla silindi' });
  } catch (error) {
    console.error('Üyelik silinirken hata:', error);
    res.status(500).json({ error: 'Üyelik silinemedi' });
  }
});

// Aktif üyelikleri getir
router.get('/status/active', async (req, res) => {
  try {
    const membership = new Membership();
    const activeMemberships = await membership.getActiveMemberships();
    membership.close();
    
    res.json(activeMemberships);
  } catch (error) {
    console.error('Aktif üyelikler getirilirken hata:', error);
    res.status(500).json({ error: 'Aktif üyelikler getirilemedi' });
  }
});

// Süresi dolmak üzere olan üyelikleri getir
router.get('/status/expiring/:days', async (req, res) => {
  try {
    const { days } = req.params;
    const membership = new Membership();
    const expiringMemberships = await membership.getExpiringMemberships(parseInt(days));
    membership.close();
    
    res.json(expiringMemberships);
  } catch (error) {
    console.error('Süresi dolmak üzere olan üyelikler getirilirken hata:', error);
    res.status(500).json({ error: 'Süresi dolmak üzere olan üyelikler getirilemedi' });
  }
});

// Süresi dolmuş üyelikleri getir
router.get('/status/expired', async (req, res) => {
  try {
    const membership = new Membership();
    const expiredMemberships = await membership.getExpiredMemberships();
    membership.close();
    
    res.json(expiredMemberships);
  } catch (error) {
    console.error('Süresi dolmuş üyelikler getirilirken hata:', error);
    res.status(500).json({ error: 'Süresi dolmuş üyelikler getirilemedi' });
  }
});

// Ödeme durumuna göre üyelikleri getir
router.get('/payment/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const membership = new Membership();
    const memberships = await membership.getByPaymentStatus(status);
    membership.close();
    
    res.json(memberships);
  } catch (error) {
    console.error('Ödeme durumuna göre üyelikler getirilirken hata:', error);
    res.status(500).json({ error: 'Üyelikler getirilemedi' });
  }
});

// Üyelik istatistikleri
router.get('/stats/overview', async (req, res) => {
  try {
    const membership = new Membership();
    const stats = await membership.getMembershipStats();
    membership.close();
    
    res.json(stats);
  } catch (error) {
    console.error('Üyelik istatistikleri getirilirken hata:', error);
    res.status(500).json({ error: 'Üyelik istatistikleri getirilemedi' });
  }
});

module.exports = router; 