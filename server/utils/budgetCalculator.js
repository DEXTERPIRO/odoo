const recalculateBudget = async (tripId, prisma) => {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  const expenses = await prisma.expense.findMany({ where: { tripId } });
  const activities = await prisma.activity.findMany({ where: { stop: { tripId } } });
  
  const breakdown = {
    transport: 0, hotel: 0, food: 0, activities: 0, other: 0
  };
  
  expenses.forEach(e => {
    const cat = e.category.toLowerCase();
    if (cat === 'transport' || cat === 'flight' || cat === 'taxi') breakdown.transport += e.amount;
    else if (cat === 'hotel' || cat === 'accommodation') breakdown.hotel += e.amount;
    else if (cat === 'food' || cat === 'restaurant') breakdown.food += e.amount;
    else breakdown.other += e.amount;
  });
  
  activities.forEach(a => { breakdown.activities += a.cost; });
  
  const totalSpent = Object.values(breakdown).reduce((s, v) => s + v, 0);
  const remaining = trip.totalBudget - totalSpent;
  const percentUsed = trip.totalBudget > 0 ? (totalSpent / trip.totalBudget) * 100 : 0;
  
  let status = 'ok';
  if (percentUsed >= 100) status = 'over';
  else if (percentUsed >= 80) status = 'warning';
  
  return {
    tripId,
    totalBudget: trip.totalBudget,
    totalSpent,
    remaining,
    percentUsed: Math.round(percentUsed),
    breakdown,
    status
  };
};

module.exports = { recalculateBudget };
