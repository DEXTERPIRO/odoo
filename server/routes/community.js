const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  try {
    const { search, sortBy } = req.query;
    const orderBy = sortBy === 'likes' ? { likesCount: 'desc' } : { createdAt: 'desc' };
    const posts = await prisma.communityPost.findMany({
      where: search ? { trip: { name: { contains: search, mode: 'insensitive' } } } : {},
      include: {
        user: { select: { firstName: true, lastName: true, photo: true } },
        trip: { include: { stops: true } }
      },
      orderBy
    });
    res.json(posts);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/share/:tripId', auth, async (req, res) => {
  try {
    const { caption } = req.body;
    await prisma.trip.update({ where: { id: req.params.tripId, userId: req.userId }, data: { isPublic: true } });
    const post = await prisma.communityPost.create({
      data: { tripId: req.params.tripId, userId: req.userId, caption },
      include: { user: { select: { firstName: true, lastName: true } }, trip: true }
    });
    res.status(201).json(post);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/like/:postId', auth, async (req, res) => {
  try {
    const existing = await prisma.postLike.findUnique({ where: { userId_postId: { userId: req.userId, postId: req.params.postId } } });
    if (existing) {
      await prisma.postLike.delete({ where: { userId_postId: { userId: req.userId, postId: req.params.postId } } });
      const post = await prisma.communityPost.update({ where: { id: req.params.postId }, data: { likesCount: { decrement: 1 } } });
      return res.json({ liked: false, likesCount: post.likesCount });
    }
    await prisma.postLike.create({ data: { userId: req.userId, postId: req.params.postId } });
    const post = await prisma.communityPost.update({ where: { id: req.params.postId }, data: { likesCount: { increment: 1 } } });
    res.json({ liked: true, likesCount: post.likesCount });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/clone/:tripId', auth, async (req, res) => {
  try {
    const original = await prisma.trip.findFirst({
      where: { id: req.params.tripId, isPublic: true },
      include: { stops: { include: { activities: true } }, checklist: true }
    });
    if (!original) return res.status(404).json({ error: 'Trip not found or not public' });
    const cloned = await prisma.trip.create({
      data: {
        userId: req.userId, name: `${original.name} (copy)`, description: original.description,
        startDate: original.startDate, endDate: original.endDate, totalBudget: original.totalBudget,
        clonedFromId: original.id, isPublic: false,
        stops: {
          create: original.stops.map(s => ({
            city: s.city, country: s.country, startDate: s.startDate, endDate: s.endDate, orderIndex: s.orderIndex,
            activities: { create: s.activities.map(a => ({ name: a.name, type: a.type, cost: a.cost, duration: a.duration, notes: a.notes })) }
          }))
        },
        checklist: { create: original.checklist.map(c => ({ label: c.label, category: c.category })) }
      },
      include: { stops: true }
    });
    res.status(201).json(cloned);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
