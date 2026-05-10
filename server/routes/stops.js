const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const prisma = new PrismaClient();

router.post('/', auth, async (req, res) => {
  try {
    const { tripId, city, country, startDate, endDate, orderIndex } = req.body;
    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: req.userId } });
    if (!trip) return res.status(403).json({ error: 'Not authorized' });
    const stop = await prisma.stop.create({
      data: { tripId, city, country, startDate: new Date(startDate), endDate: new Date(endDate), orderIndex: orderIndex || 0 }
    });
    res.status(201).json(stop);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { city, country, startDate, endDate, orderIndex } = req.body;
    const stop = await prisma.stop.update({
      where: { id: req.params.id },
      data: { city, country, startDate: startDate ? new Date(startDate) : undefined, endDate: endDate ? new Date(endDate) : undefined, orderIndex }
    });
    res.json(stop);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.stop.delete({ where: { id: req.params.id } });
    res.json({ message: 'Stop deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
