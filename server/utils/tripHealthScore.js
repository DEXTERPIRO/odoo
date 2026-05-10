const calculateHealthScore = async (tripId, prisma) => {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId },
    include: {
      stops: { include: { activities: true } },
      expenses: true,
      checklist: true,
      notes: true
    }
  });

  let score = 0;
  const breakdown = {};
  const suggestions = [];

  // 1. Budget planning (25 points)
  if (trip.totalBudget > 0) {
    const expenses = trip.expenses.reduce((s, e) => s + e.amount, 0);
    const actCost = trip.stops.flatMap(s => s.activities).reduce((s, a) => s + a.cost, 0);
    const totalSpent = expenses + actCost;
    const percent = (totalSpent / trip.totalBudget) * 100;
    if (percent <= 80) { score += 25; breakdown.budget = 25; }
    else if (percent <= 100) { score += 15; breakdown.budget = 15; suggestions.push('You are close to your budget limit. Consider reducing some activities.'); }
    else { score += 0; breakdown.budget = 0; suggestions.push('You have exceeded your budget. Remove some expenses or increase your budget.'); }
  } else {
    score += 5; breakdown.budget = 5;
    suggestions.push('Set a total budget for your trip to better track expenses.');
  }

  // 2. Itinerary completeness (25 points)
  const totalDays = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24));
  const totalActivities = trip.stops.flatMap(s => s.activities).length;
  const activitiesPerDay = totalDays > 0 ? totalActivities / totalDays : 0;
  if (activitiesPerDay >= 3) { score += 25; breakdown.itinerary = 25; }
  else if (activitiesPerDay >= 1) { score += 15; breakdown.itinerary = 15; suggestions.push('Add more activities to your days for a fuller experience.'); }
  else { score += 0; breakdown.itinerary = 0; suggestions.push('Your itinerary is empty. Add activities to each stop.'); }

  // 3. Packing readiness (20 points)
  const totalItems = trip.checklist.length;
  const packedItems = trip.checklist.filter(i => i.isPacked).length;
  if (totalItems === 0) { score += 5; breakdown.packing = 5; suggestions.push('Generate a packing list using AI to prepare for your trip.'); }
  else {
    const packPercent = (packedItems / totalItems) * 100;
    if (packPercent >= 80) { score += 20; breakdown.packing = 20; }
    else if (packPercent >= 50) { score += 12; breakdown.packing = 12; suggestions.push(`You have packed ${Math.round(packPercent)}% of items. Keep going!`); }
    else { score += 5; breakdown.packing = 5; suggestions.push('Start packing! You have many items left to pack.'); }
  }

  // 4. Notes and documentation (15 points)
  if (trip.notes.length >= 3) { score += 15; breakdown.notes = 15; }
  else if (trip.notes.length >= 1) { score += 8; breakdown.notes = 8; suggestions.push('Add more trip notes like hotel check-in info, emergency contacts, and local tips.'); }
  else { score += 0; breakdown.notes = 0; suggestions.push('Add important notes like hotel addresses, emergency contacts, and check-in times.'); }

  // 5. Trip diversity (15 points)
  const activityTypes = [...new Set(trip.stops.flatMap(s => s.activities.map(a => a.type)))];
  if (activityTypes.length >= 4) { score += 15; breakdown.diversity = 15; }
  else if (activityTypes.length >= 2) { score += 10; breakdown.diversity = 10; suggestions.push('Add different types of activities like food, adventure, and shopping for a diverse trip.'); }
  else { score += 3; breakdown.diversity = 3; suggestions.push('Mix different activity types - sightseeing, food, adventure, shopping for a richer experience.'); }

  let grade = 'F';
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 60) grade = 'C';
  else if (score >= 50) grade = 'D';

  return { score, grade, breakdown, suggestions, totalDays, totalActivities };
};

module.exports = { calculateHealthScore };
