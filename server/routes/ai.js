const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const axios = require('axios');
const prisma = new PrismaClient();

const callAI = async (prompt, maxTokens = 1000) => {
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Traveloop'
      }
    }
  );
  return response.data.choices[0].message.content;
};

function extractJSON(text) {
  const start = text.indexOf('{');
  const end   = text.lastIndexOf('}') + 1;
  if (start === -1 || end === 0) throw new Error('No JSON in model response');
  return JSON.parse(text.substring(start, end));
}

// ─── Suggest Day-by-Day Itinerary ────────────────────────────────────────────
router.post('/suggest-itinerary', auth, async (req, res) => {
  try {
    const { tripId } = req.body;
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: req.userId },
      include: { stops: { include: { activities: true } } }
    });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const startDate = trip.startDate.toISOString().split('T')[0];
    const endDate   = trip.endDate.toISOString().split('T')[0];
    const stops = trip.stops.map(s =>
      `${s.city}, ${s.country} (${s.startDate.toISOString().split('T')[0]} to ${s.endDate.toISOString().split('T')[0]})`
    ).join(' | ');

    const prompt = `You are an expert Indian travel planning AI for Traveloop India. Generate a detailed day-by-day itinerary for an Indian domestic trip.

Trip: ${trip.name}
Dates: ${startDate} to ${endDate}
Total Budget: ₹${trip.totalBudget}
Destinations: ${stops || 'Not specified yet'}

Include India-specific tips: trains (IRCTC), local autos/rickshaws, dhabas for food, chai stops, temple visit timings, and seasonal considerations.
Return ONLY valid JSON, no markdown, no explanation:
{
  "days": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "city": "City Name",
      "theme": "One line theme for the day",
      "activities": [
        {
          "time": "09:00",
          "name": "Activity name",
          "type": "SIGHTSEEING",
          "estimatedCost": 500,
          "duration": 120,
          "tip": "India-specific insider tip"
        }
      ],
      "estimatedDayCost": 1500,
      "budgetTip": "Budget tip for India travel"
    }
  ],
  "totalEstimatedCost": 8000,
  "budgetStatus": "within",
  "generalTips": ["Carry cash for rural areas", "Book trains on IRCTC early", "Tip 3"]
}`;

    const text   = await callAI(prompt, 2000);
    const result = extractJSON(text);
    res.json(result);
  } catch (error) {
    console.error('AI suggest error:', error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── Generate Trip Summary ───────────────────────────────────────────────────
router.post('/trip-summary', auth, async (req, res) => {
  try {
    const { tripId } = req.body;
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: req.userId },
      include: { stops: { include: { activities: true } } }
    });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const stops = trip.stops.map(s => 
      `${s.city} (${s.activities.map(a => a.name).join(', ')})`
    ).join(' → ');

    const prompt = `Write an exciting 3-sentence travel summary for an Indian trip called "${trip.name}".
Destinations: ${stops || 'Various locations in India'}
Budget: ₹${trip.totalBudget}
Duration: ${Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24))} days

Make it sound exciting and inspiring, like an Indian travel blog. Mention Incredible India, local culture, chai, and the magic of Indian travel.
Return ONLY valid JSON: { "summary": "...", "highlights": ["highlight1", "highlight2", "highlight3"], "hashtags": ["#IncredibleIndia", "#IndiaTravel"] }`;

    const text = await callAI(prompt, 2000);
    const result = extractJSON(text);
    res.json(result);
  } catch (error) {
    console.error('AI summary error:', error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── Generate Packing List ────────────────────────────────────────────────────
router.post('/generate-packing', auth, async (req, res) => {
  try {
    const { tripId } = req.body;
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: req.userId },
      include: { stops: { include: { activities: true } } }
    });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const cities = trip.stops.map(s => s.city).join(', ') || 'Unknown destination';
    const types  = [...new Set(trip.stops.flatMap(s => s.activities.map(a => a.type)))].join(', ') || 'general tourism';
    const days   = Math.ceil((trip.endDate - trip.startDate) / (1000 * 60 * 60 * 24));

    const prompt = `Generate a smart packing list for a ${days}-day trip to ${cities} in India. Activities: ${types}.

Include India-specific essentials: Aadhaar card, train tickets, mosquito repellent, dupatta/modesty clothing for temples, etc.
Return ONLY valid JSON, no markdown:
{
  "categories": [
    { "name": "Documents",   "items": ["Aadhaar Card", "Travel tickets (IRCTC)", "Hotel confirmations"] },
    { "name": "Clothing",    "items": ["Comfortable cotton clothes", "Walking shoes", "Dupatta/shawl for temples"] },
    { "name": "Electronics", "items": ["Phone charger", "Power bank", "Indian adapter (Type D)"] },
    { "name": "Toiletries",  "items": ["Sunscreen SPF 50", "Mosquito repellent", "Hand sanitizer"] },
    { "name": "Essentials",  "items": ["Cash in INR", "UPI-enabled phone", "Water bottle"] }
  ]
}`;

    const text   = await callAI(prompt, 2000);
    const result = extractJSON(text);

    const allItems = result.categories.flatMap(cat =>
      cat.items.map(item => ({ tripId, label: item, category: cat.name }))
    );
    await prisma.packingItem.deleteMany({ where: { tripId } });
    await prisma.packingItem.createMany({ data: allItems });
    const saved = await prisma.packingItem.findMany({ where: { tripId }, orderBy: [{ category: 'asc' }] });
    res.json({ categories: result.categories, items: saved });
  } catch (error) {
    console.error('AI packing error:', error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── Travel Chat ──────────────────────────────────────────────────────────────
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, tripContext } = req.body;
    const system = tripContext
      ? `You are a helpful Indian travel assistant for Traveloop India. You specialize in domestic India travel — trains, buses, autos, dhabas, temples, hill stations, beaches and heritage sites. Trip context: ${JSON.stringify(tripContext)}. Be concise (max 120 words). Use ₹ for prices.`
      : 'You are a helpful Indian travel assistant for Traveloop India. You specialize in domestic India travel — IRCTC trains, local food, hill stations, temples, backwaters and budget travel tips. Answer questions concisely (max 120 words). Always use ₹ for prices.';

    const combinedPrompt = `${system}\n\nUser Question: ${message}`;
    const reply = await callAI(combinedPrompt, 2000);

    res.json({ reply });
  } catch (error) {
    console.error('AI chat error:', error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
