const axios = require('axios');

const OR_URL   = 'https://openrouter.ai/api/v1/chat/completions';
const OR_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';

const checkAndGenerateAlert = async (tripId, prisma, io) => {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId },
    include: { stops: { include: { activities: true } }, expenses: true }
  });

  if (!trip || trip.totalBudget <= 0) return null;

  const totalSpent =
    trip.expenses.reduce((s, e) => s + e.amount, 0) +
    trip.stops.flatMap(s => s.activities).reduce((s, a) => s + a.cost, 0);

  const percentUsed = (totalSpent / trip.totalBudget) * 100;

  // Only fire alert at 80% or over-budget thresholds
  if (percentUsed < 80) return null;

  const expensiveActivities = trip.stops
    .flatMap(s => s.activities)
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 3)
    .map(a => `${a.name} ($${a.cost})`);

  const cities = trip.stops.map(s => s.city).join(', ') || 'their destination';

  const prompt = `A traveler has used ${Math.round(percentUsed)}% of their $${trip.totalBudget} budget for a trip to ${cities}.

Their most expensive activities are: ${expensiveActivities.join(', ') || 'none yet'}.

Give exactly 3 specific money-saving tips for this destination. Be concrete and helpful.
Return ONLY valid JSON, no markdown: { "tips": ["tip1", "tip2", "tip3"], "estimatedSaving": 50 }`;

  try {
    const response = await axios.post(
      OR_URL,
      { model: OR_MODEL, max_tokens: 400, messages: [{ role: 'user', content: prompt }] },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'Traveloop',
        }
      }
    );

    const text = response.data.choices[0].message.content;
    const start = text.indexOf('{');
    const end   = text.lastIndexOf('}') + 1;
    const json  = JSON.parse(text.substring(start, end));

    const alert = {
      type: percentUsed >= 100 ? 'OVER_BUDGET' : 'NEAR_BUDGET',
      percentUsed: Math.round(percentUsed),
      totalBudget: trip.totalBudget,
      totalSpent,
      remaining: trip.totalBudget - totalSpent,
      aiTips: json.tips || [],
      estimatedSaving: json.estimatedSaving || 0,
      tripId,
    };

    io.to(`trip-${tripId}`).emit('budget-alert', alert);
    console.log(`Budget alert fired for trip ${tripId}: ${Math.round(percentUsed)}% used`);
    return alert;
  } catch (err) {
    console.error('Budget alert AI error:', err.response?.data || err.message);
    // Still emit a non-AI alert so the frontend gets notified
    const fallbackAlert = {
      type: percentUsed >= 100 ? 'OVER_BUDGET' : 'NEAR_BUDGET',
      percentUsed: Math.round(percentUsed),
      totalBudget: trip.totalBudget,
      totalSpent,
      remaining: trip.totalBudget - totalSpent,
      aiTips: [
        'Consider booking accommodations in advance for better rates.',
        'Use public transport instead of taxis to save significantly.',
        'Eat at local restaurants rather than tourist-oriented ones.',
      ],
      estimatedSaving: 0,
      tripId,
    };
    io.to(`trip-${tripId}`).emit('budget-alert', fallbackAlert);
    return fallbackAlert;
  }
};

module.exports = { checkAndGenerateAlert };
