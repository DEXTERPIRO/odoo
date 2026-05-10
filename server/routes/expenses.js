const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const { recalculateBudget } = require('../utils/budgetCalculator');
const { checkAndGenerateAlert } = require('../utils/budgetAlert');
const prisma = new PrismaClient();

router.get('/:tripId', auth, async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { tripId: req.params.tripId },
      orderBy: { date: 'desc' }
    });
    res.json(expenses);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { tripId, category, description, amount, date } = req.body;
    const expense = await prisma.expense.create({
      data: { tripId, category, description, amount: parseFloat(amount), date: date ? new Date(date) : new Date() }
    });
    const budget = await recalculateBudget(tripId, prisma);
    const io = req.app.get('io');
    io.to(`trip-${tripId}`).emit('budget-updated', budget);
    // Fire AI budget alert asynchronously (don't await — don't block response)
    checkAndGenerateAlert(tripId, prisma, io).catch(() => {});
    res.status(201).json({ expense, budget });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { category, description, amount, date } = req.body;
    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: { category, description, amount: amount ? parseFloat(amount) : undefined, date: date ? new Date(date) : undefined }
    });
    res.json(expense);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await prisma.expense.findUnique({ where: { id: req.params.id } });
    await prisma.expense.delete({ where: { id: req.params.id } });
    const budget = await recalculateBudget(expense.tripId, prisma);
    const io = req.app.get('io');
    io.to(`trip-${expense.tripId}`).emit('budget-updated', budget);
    res.json({ message: 'Expense deleted', budget });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
