const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const prisma = new PrismaClient();

router.get('/:tripId', auth, async (req, res) => {
  try {
    const items = await prisma.packingItem.findMany({
      where: { tripId: req.params.tripId },
      orderBy: [{ category: 'asc' }, { createdAt: 'asc' }]
    });
    res.json(items);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { tripId, label, category } = req.body;
    const item = await prisma.packingItem.create({ data: { tripId, label, category: category || 'General' } });
    res.status(201).json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/bulk', auth, async (req, res) => {
  try {
    const { tripId, items } = req.body;
    const created = await prisma.packingItem.createMany({
      data: items.map(i => ({ tripId, label: i.label, category: i.category || 'General' }))
    });
    const all = await prisma.packingItem.findMany({ where: { tripId }, orderBy: [{ category: 'asc' }] });
    res.status(201).json(all);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { label, category, isPacked } = req.body;
    const item = await prisma.packingItem.update({ where: { id: req.params.id }, data: { label, category, isPacked } });
    res.json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.packingItem.delete({ where: { id: req.params.id } });
    res.json({ message: 'Item deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/:tripId/reset', auth, async (req, res) => {
  try {
    await prisma.packingItem.updateMany({ where: { tripId: req.params.tripId }, data: { isPacked: false } });
    const items = await prisma.packingItem.findMany({ where: { tripId: req.params.tripId } });
    res.json(items);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
