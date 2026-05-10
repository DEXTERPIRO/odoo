const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const prisma = new PrismaClient();

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        trips: { orderBy: { createdAt: 'desc' }, take: 10 },
        _count: { select: { trips: true, posts: true } }
      }
    });
    const { password, ...safe } = user;
    res.json(safe);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, city, country, additionalInfo, photo } = req.body;
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { firstName, lastName, phone, city, country, additionalInfo, photo },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, city: true, country: true, photo: true }
    });
    res.json(user);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
