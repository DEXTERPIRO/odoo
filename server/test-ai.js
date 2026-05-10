const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const getMockResponse = (prompt) => {
  if (prompt.includes("day-by-day itinerary")) {
    return JSON.stringify({
      days: [
        {
          dayNumber: 1,
          date: new Date().toISOString().split('T')[0],
          city: "Destinations",
          theme: "Arrival & Local Exploration",
          activities: [
            { time: "10:00", name: "Visit Local Markets", type: "SHOPPING", estimatedCost: 500, duration: 120, tip: "Bargain well!" }
          ],
          estimatedDayCost: 500,
          budgetTip: "Use auto-rickshaws"
        }
      ],
      totalEstimatedCost: 500,
      budgetStatus: "within",
      generalTips: ["Carry cash"]
    });
  } else {
    return "Fallback";
  }
};

const callAI = async (prompt, maxTokens = 1000) => {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_')) {
    console.log("No valid AI API key found. Returning mock fallback data.");
    return getMockResponse(prompt);
  }
  return getMockResponse(prompt); // just test mock
};

function extractJSON(text) {
  try {
    const start = text.indexOf('{');
    const end   = text.lastIndexOf('}') + 1;
    if (start === -1 || end === 0) throw new Error('No JSON structure found');
    return JSON.parse(text.substring(start, end));
  } catch (e) {
    console.error("Failed to parse JSON", e);
    return {};
  }
}

async function test() {
  const prompt = "day-by-day itinerary";
  const text = await callAI(prompt);
  console.log("Text:", text);
  const json = extractJSON(text);
  console.log("JSON:", json);
}
test();
