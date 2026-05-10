const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { adminAuth } = require('../middleware/auth');
const prisma = new PrismaClient();

router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalTrips = await prisma.trip.count();
    const totalPosts = await prisma.communityPost.count();
    const totalActivities = await prisma.activity.count();

    const topCities = await prisma.stop.groupBy({
      by: ['city', 'country'],
      _count: { city: true },
      orderBy: { _count: { city: 'desc' } },
      take: 10
    });

    const recentTrips = await prisma.trip.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true, email: true } } }
    });

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, firstName: true, lastName: true, email: true, createdAt: true, _count: { select: { trips: true } } }
    });

    const budgetStats = await prisma.trip.aggregate({
      _avg: { totalBudget: true },
      _max: { totalBudget: true },
      _min: { totalBudget: true },
      _sum: { totalBudget: true }
    });

    const tripsByStatus = await prisma.trip.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    res.json({
      totals: { users: totalUsers, trips: totalTrips, posts: totalPosts, activities: totalActivities },
      topCities: topCities.map(c => ({ city: c.city, country: c.country, count: c._count.city })),
      recentTrips,
      recentUsers,
      budgetStats: {
        average: Math.round(budgetStats._avg.totalBudget || 0),
        max: budgetStats._max.totalBudget || 0,
        min: budgetStats._min.totalBudget || 0,
        total: budgetStats._sum.totalBudget || 0
      },
      tripsByStatus: tripsByStatus.map(t => ({ status: t.status, count: t._count.status }))
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true, email: true, city: true, country: true, isAdmin: true, createdAt: true, _count: { select: { trips: true, posts: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
