const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const { recalculateBudget } = require('../utils/budgetCalculator');
const { checkAndGenerateAlert } = require('../utils/budgetAlert');
const prisma = new PrismaClient();

router.post('/', auth, async (req, res) => {
  try {
    const { stopId, name, type, cost, duration, notes, date } = req.body;
    const activity = await prisma.activity.create({
      data: { stopId, name, type: type || 'OTHER', cost: parseFloat(cost) || 0, duration: parseInt(duration) || 60, notes, date: date ? new Date(date) : null }
    });
    const stop = await prisma.stop.findUnique({ where: { id: stopId } });
    const budget = await recalculateBudget(stop.tripId, prisma);
    const io = req.app.get('io');
    io.to(`trip-${stop.tripId}`).emit('budget-updated', budget);
    // Fire AI budget alert asynchronously
    checkAndGenerateAlert(stop.tripId, prisma, io).catch(() => {});
    res.status(201).json({ activity, budget });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, type, cost, duration, notes } = req.body;
    const activity = await prisma.activity.update({
      where: { id: req.params.id },
      data: { name, type, cost: cost ? parseFloat(cost) : undefined, duration: duration ? parseInt(duration) : undefined, notes }
    });
    res.json(activity);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const activity = await prisma.activity.findUnique({ where: { id: req.params.id }, include: { stop: true } });
    await prisma.activity.delete({ where: { id: req.params.id } });
    const budget = await recalculateBudget(activity.stop.tripId, prisma);
    const io = req.app.get('io');
    io.to(`trip-${activity.stop.tripId}`).emit('budget-updated', budget);
    res.json({ message: 'Activity deleted', budget });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
