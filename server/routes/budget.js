const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const { recalculateBudget } = require('../utils/budgetCalculator');
const prisma = new PrismaClient();

router.get('/:tripId', auth, async (req, res) => {
  try {
    const budget = await recalculateBudget(req.params.tripId, prisma);
    res.json(budget);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
