const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const prisma = new PrismaClient();

router.get('/:tripId', auth, async (req, res) => {
  try {
    const { stopId } = req.query;
    const where = { tripId: req.params.tripId, userId: req.userId };
    if (stopId) where.stopId = stopId;
    const notes = await prisma.tripNote.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(notes);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { tripId, stopId, title, content } = req.body;
    const note = await prisma.tripNote.create({ data: { tripId, stopId, title, content, userId: req.userId } });
    res.status(201).json(note);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await prisma.tripNote.update({ where: { id: req.params.id, userId: req.userId }, data: { title, content } });
    res.json(note);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.tripNote.delete({ where: { id: req.params.id, userId: req.userId } });
    res.json({ message: 'Note deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
