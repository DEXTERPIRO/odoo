const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const { calculateHealthScore } = require('../utils/tripHealthScore');
const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const where = { userId: req.userId };
    if (status) where.status = status;
    const trips = await prisma.trip.findMany({
      where,
      include: {
        stops: { include: { activities: true } },
        expenses: true,
        _count: { select: { stops: true, expenses: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(trips);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, description, startDate, endDate, totalBudget, coverPhoto } = req.body;
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    let status = 'UPCOMING';
    if (now >= start && now <= end) status = 'ONGOING';
    if (now > end) status = 'COMPLETED';
    const trip = await prisma.trip.create({
      data: { name, description, startDate: start, endDate: end, totalBudget: parseFloat(totalBudget) || 0, coverPhoto, userId: req.userId, status }
    });
    res.status(201).json(trip);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/public/:id', async (req, res) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.id, isPublic: true },
      include: {
        user: { select: { firstName: true, lastName: true } },
        stops: { 
          include: { activities: true },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });
    if (!trip) return res.status(404).json({ error: 'Trip not found or not public' });
    res.json(trip);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: {
        stops: { include: { activities: true, notes: true }, orderBy: { orderIndex: 'asc' } },
        expenses: { orderBy: { date: 'desc' } },
        checklist: { orderBy: { category: 'asc' } },
        notes: { orderBy: { createdAt: 'desc' } },
        user: { select: { firstName: true, lastName: true, photo: true } }
      }
    });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.json(trip);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, startDate, endDate, totalBudget, coverPhoto, isPublic, status } = req.body;
    // Verify ownership first, then update by unique id only
    const existing = await prisma.trip.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) return res.status(404).json({ error: 'Trip not found' });
    const trip = await prisma.trip.update({
      where: { id: req.params.id },
      data: { name, description, startDate: startDate ? new Date(startDate) : undefined, endDate: endDate ? new Date(endDate) : undefined, totalBudget: totalBudget ? parseFloat(totalBudget) : undefined, coverPhoto, isPublic, status }
    });
    res.json(trip);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    // deleteMany supports compound where (non-unique fields) unlike delete
    const result = await prisma.trip.deleteMany({ where: { id: req.params.id, userId: req.userId } });
    if (result.count === 0) return res.status(404).json({ error: 'Trip not found or not authorized' });
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/:id/invite', auth, async (req, res) => {
  try {
    const { email } = req.body;
    const invitedUser = await prisma.user.findUnique({ where: { email } });
    if (!invitedUser) return res.status(404).json({ error: 'User with this email not found' });
    const collab = await prisma.tripCollaborator.upsert({
      where: { tripId_userId: { tripId: req.params.id, userId: invitedUser.id } },
      update: {},
      create: { tripId: req.params.id, userId: invitedUser.id, role: 'editor' }
    });
    res.json({ message: `${invitedUser.firstName} added as collaborator`, collab });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id/collaborators', auth, async (req, res) => {
  try {
    const collabs = await prisma.tripCollaborator.findMany({
      where: { tripId: req.params.id },
      include: { user: { select: { firstName: true, lastName: true, email: true, photo: true } } }
    });
    res.json(collabs);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id/health', auth, async (req, res) => {
  try {
    const health = await calculateHealthScore(req.params.id, prisma);
    res.json(health);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    // Verify ownership
    const trip = await prisma.trip.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!trip) return res.status(404).json({ error: 'Trip not found or not authorized' });

    const tripId = req.params.id;

    // Cascade delete in dependency order
    // 1. Delete all activities (children of stops)
    const stops = await prisma.stop.findMany({ where: { tripId }, select: { id: true } });
    const stopIds = stops.map(s => s.id);
    if (stopIds.length) await prisma.activity.deleteMany({ where: { stopId: { in: stopIds } } });

    // 2. Delete all stops
    await prisma.stop.deleteMany({ where: { tripId } });

    // 3. Delete expenses, checklist, notes
    await prisma.expense.deleteMany({ where: { tripId } });
    await prisma.checklistItem.deleteMany({ where: { tripId } });
    await prisma.note.deleteMany({ where: { tripId } });

    // 4. Delete community posts and their likes
    const posts = await prisma.communityPost.findMany({ where: { tripId }, select: { id: true } });
    const postIds = posts.map(p => p.id);
    if (postIds.length) await prisma.postLike.deleteMany({ where: { postId: { in: postIds } } });
    await prisma.communityPost.deleteMany({ where: { tripId } });

    // 5. Delete collaborators
    await prisma.tripCollaborator.deleteMany({ where: { tripId } });

    // 6. Finally delete the trip
    await prisma.trip.delete({ where: { id: tripId } });

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
