const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const axios = require('axios');
const prisma = new PrismaClient();

// ─── City-Aware Mock Fallback Responses ──────────────────────────────────────
const CITY_STOPS = {
  surat: [
    { name: "Dumas Beach", nearestStop: "Surat", distance: "~21 km from Surat", description: "A popular black-sand beach known for its paranormal legends and bustling food stalls. The evening atmosphere is lively with local snacks and sea breezes.", bestTime: "Evening (5–8 PM) for sunset and street food", travelTip: "Take a shared auto or GSRTC bus from Surat city for ₹30–50.", activities: [{ name: "Beach Walk & Sunset View", type: "SIGHTSEEING", estimatedCost: 0, duration: 90 }, { name: "Bhajiya & Chaat at Stalls", type: "FOOD", estimatedCost: 150, duration: 45 }] },
    { name: "Hazira Beach", nearestStop: "Surat", distance: "~28 km from Surat", description: "A quieter beach away from the city crowds, ideal for a peaceful picnic and watching fishing boats. The Hazira port area adds an industrial charm.", bestTime: "Morning (7–10 AM) for calm sea and fresh air", travelTip: "Hire an auto-rickshaw for about ₹100–150 one way from Surat station.", activities: [{ name: "Morning Walk by the Sea", type: "ADVENTURE", estimatedCost: 0, duration: 60 }, { name: "Fresh Fish Breakfast at Local Stalls", type: "FOOD", estimatedCost: 200, duration: 45 }] },
    { name: "Suvali Beach", nearestStop: "Surat", distance: "~22 km from Surat", description: "An offbeat beach near Hazira known for its calm waters and coconut groves. Popular with locals for picnics and weekend getaways.", bestTime: "Weekday mornings to avoid crowds", travelTip: "Rent a bike from Surat (~₹200/day) or share a taxi for ₹80–120.", activities: [{ name: "Picnic on the Shore", type: "SIGHTSEEING", estimatedCost: 0, duration: 120 }, { name: "Coconut Water & Snacks", type: "FOOD", estimatedCost: 80, duration: 30 }] },
    { name: "Navsari", nearestStop: "Surat", distance: "~35 km from Surat", description: "A historic town famous for its Parsi heritage, the birthplace of Field Marshal Sam Manekshaw, and ancient Jain temples. A gem of Gujarat's cultural history.", bestTime: "Morning to afternoon (9 AM–3 PM)", travelTip: "Take a local train from Surat to Navsari for as low as ₹15–25.", activities: [{ name: "Visit Doongarwadi Parsi Tower", type: "SIGHTSEEING", estimatedCost: 0, duration: 60 }, { name: "Parsi Dhansak Meal at Local Eatery", type: "FOOD", estimatedCost: 250, duration: 60 }] }
  ],
  mumbai: [
    { name: "Elephanta Caves", nearestStop: "Mumbai", distance: "~11 km by ferry from Gateway of India", description: "UNESCO World Heritage Site with stunning rock-cut temples dedicated to Lord Shiva, dating back to the 5th–8th centuries.", bestTime: "Morning (9–11 AM) before tourist rush", travelTip: "Take a ferry from Gateway of India — ₹200 return ticket.", activities: [{ name: "Explore the Trimurti Cave", type: "SIGHTSEEING", estimatedCost: 40, duration: 120 }, { name: "Ferry Ride", type: "ADVENTURE", estimatedCost: 200, duration: 60 }] },
    { name: "Alibaug Beach", nearestStop: "Mumbai", distance: "~95 km or 1 hr by ferry", description: "A pristine beach town known for the Kolaba Fort and clean sandy beaches — perfect for a Mumbai day escape.", bestTime: "October to March for pleasant weather", travelTip: "Take RO-RO ferry from Mandwa Jetty (₹300) or bus from Mumbai Central (₹150).", activities: [{ name: "Kolaba Fort Walk at Low Tide", type: "SIGHTSEEING", estimatedCost: 0, duration: 90 }, { name: "Seafood Lunch", type: "FOOD", estimatedCost: 500, duration: 60 }] }
  ],
  delhi: [
    { name: "Agra (Taj Mahal)", nearestStop: "Delhi", distance: "~230 km from Delhi (Yamuna Expressway)", description: "One of the Seven Wonders of the World — the Taj Mahal is a must-visit, especially at sunrise when the marble glows golden.", bestTime: "Sunrise (6 AM) for magical light and fewer crowds", travelTip: "Take Gatimaan Express from Hazrat Nizamuddin (₹750) or Shatabdi from New Delhi station.", activities: [{ name: "Taj Mahal Sunrise Visit", type: "SIGHTSEEING", estimatedCost: 1100, duration: 120 }, { name: "Agra Fort Tour", type: "SIGHTSEEING", estimatedCost: 650, duration: 90 }] },
    { name: "Mathura & Vrindavan", nearestStop: "Delhi", distance: "~145 km from Delhi", description: "The sacred birthplace of Lord Krishna, filled with temples, ghats, and the spiritual energy of Vrindavan.", bestTime: "Early morning (5–9 AM) for aarti and peaceful atmosphere", travelTip: "Take a bus from ISBT Kashmere Gate (₹150) or train from New Delhi to Mathura Junction.", activities: [{ name: "Krishna Janmabhoomi Mandir Visit", type: "SIGHTSEEING", estimatedCost: 0, duration: 90 }, { name: "Yamuna Ghat Boat Ride", type: "ADVENTURE", estimatedCost: 100, duration: 30 }] }
  ],
  jaipur: [
    { name: "Amber Fort", nearestStop: "Jaipur", distance: "~11 km from Jaipur", description: "A majestic hilltop fort overlooking Maota Lake, featuring stunning Rajput and Mughal architecture with intricate mirror work.", bestTime: "Morning (8–11 AM) to avoid afternoon heat", travelTip: "Take city bus no. 5 (₹25) or auto for ₹150 from Jaipur city.", activities: [{ name: "Sheesh Mahal Mirror Palace Tour", type: "SIGHTSEEING", estimatedCost: 550, duration: 90 }, { name: "Elephant Ride to Fort Gate", type: "ADVENTURE", estimatedCost: 900, duration: 30 }] },
    { name: "Sanganer", nearestStop: "Jaipur", distance: "~16 km from Jaipur", description: "Famous for its hand block printing workshops and Sanganer paper-making tradition — a paradise for craft lovers.", bestTime: "Morning (9 AM–12 PM) when workshops are active", travelTip: "Auto from Jaipur for ₹100 or local bus for ₹15.", activities: [{ name: "Block Printing Workshop", type: "SIGHTSEEING", estimatedCost: 300, duration: 90 }, { name: "Buy Handmade Paper Products", type: "SHOPPING", estimatedCost: 500, duration: 60 }] }
  ],
  goa: [
    { name: "Dudhsagar Falls", nearestStop: "Goa", distance: "~60 km from Panaji", description: "One of India's tallest waterfalls at 310 metres, surrounded by lush jungle — spectacular during and just after monsoon.", bestTime: "October to February after monsoon fills the falls", travelTip: "Join a jeep safari from Mollem (₹500/person) — private vehicles not allowed to the falls.", activities: [{ name: "Waterfall Swimming & Photography", type: "ADVENTURE", estimatedCost: 0, duration: 120 }, { name: "Jeep Safari through Wildlife Sanctuary", type: "ADVENTURE", estimatedCost: 500, duration: 60 }] },
    { name: "Chapora Fort", nearestStop: "Goa", distance: "~22 km from Panaji", description: "A 17th-century Portuguese fort made famous by the film Dil Chahta Hai, offering stunning 360-degree views of the Chapora River and north Goa coastline.", bestTime: "Sunset (5:30–6:30 PM) for golden views", travelTip: "Rent a scooter (₹300/day) or hire a taxi from North Goa for ₹400.", activities: [{ name: "Fort Ruins Exploration", type: "SIGHTSEEING", estimatedCost: 0, duration: 60 }, { name: "Sunset Photography", type: "SIGHTSEEING", estimatedCost: 0, duration: 45 }] }
  ],
  ahmedabad: [
    { name: "Adalaj Stepwell", nearestStop: "Ahmedabad", distance: "~18 km from Ahmedabad", description: "A beautifully carved five-storey stepwell built in 1499, featuring intricate Indo-Islamic architecture that stays cool even in summer.", bestTime: "Morning (8–11 AM) for the best light through the lattice", travelTip: "Take a local bus from Ahmedabad (₹20) or auto for ₹150.", activities: [{ name: "Stepwell Architecture Photography", type: "SIGHTSEEING", estimatedCost: 0, duration: 60 }, { name: "Guided History Walk", type: "SIGHTSEEING", estimatedCost: 100, duration: 45 }] },
    { name: "Nal Sarovar Bird Sanctuary", nearestStop: "Ahmedabad", distance: "~64 km from Ahmedabad", description: "A vast lake sanctuary that hosts over 200 species of migratory birds from November to February, including flamingos.", bestTime: "November to February (migratory season)", travelTip: "Hire a car from Ahmedabad (₹1500 round trip) or GSRTC bus to Sanand then local transport.", activities: [{ name: "Bird Watching Boat Ride", type: "ADVENTURE", estimatedCost: 300, duration: 90 }, { name: "Flamingo Photography", type: "SIGHTSEEING", estimatedCost: 0, duration: 60 }] }
  ],
  pune: [
    { name: "Sinhagad Fort", nearestStop: "Pune", distance: "~35 km from Pune", description: "A historic hill fort associated with Maratha history, offering breathtaking views of the Sahyadri mountains. Famous for the battle of 1670.", bestTime: "Early morning (6–9 AM) for cool weather and clear views", travelTip: "Take PMPML bus to Sinhagad base, then 30-min trek or jeep (₹50 per person).", activities: [{ name: "Trek to the Fort", type: "ADVENTURE", estimatedCost: 0, duration: 90 }, { name: "Zunka Bhakar & Pitla at Fort Stalls", type: "FOOD", estimatedCost: 150, duration: 30 }] },
    { name: "Lavasa", nearestStop: "Pune", distance: "~60 km from Pune", description: "India's first planned hill city modelled on the Italian town of Portofino, set amidst the Sahyadri hills with colourful promenades.", bestTime: "Monsoon (July–September) when the hills are lush green", travelTip: "Private car or cab (₹800–1200 round trip) — no reliable public transport.", activities: [{ name: "Lakeside Promenade Walk", type: "SIGHTSEEING", estimatedCost: 0, duration: 60 }, { name: "Water Sports on the Lake", type: "ADVENTURE", estimatedCost: 400, duration: 60 }] }
  ],
  bangalore: [
    { name: "Nandi Hills", nearestStop: "Bangalore", distance: "~60 km from Bangalore", description: "A stunning hilltop at 1478 metres known for its spectacular sunrise views above the clouds and the ancient Bhoga Nandeeshwara temple.", bestTime: "Sunrise (5:30–7 AM) — arrive before 6 AM for clouds below you", travelTip: "Rent a bike (₹400/day) or hire a cab (₹1200 return) — no reliable public transport early morning.", activities: [{ name: "Sunrise Point Photography", type: "SIGHTSEEING", estimatedCost: 0, duration: 60 }, { name: "Cycling on Hill Roads", type: "ADVENTURE", estimatedCost: 200, duration: 90 }] },
    { name: "Mysore", nearestStop: "Bangalore", distance: "~150 km from Bangalore", description: "The City of Palaces — home to the magnificent Mysore Palace, Chamundeshwari temple, and the famous Mysore silk and sandalwood.", bestTime: "Dasara festival (Oct) for lit-up palace, or any weekday", travelTip: "KSRTC Volvo bus from Kempegowda Bus Stand (₹200 one way, 3 hrs).", activities: [{ name: "Mysore Palace Tour", type: "SIGHTSEEING", estimatedCost: 200, duration: 90 }, { name: "Devaraja Market for Silk & Spices", type: "SHOPPING", estimatedCost: 1000, duration: 60 }] }
  ],
  hyderabad: [
    { name: "Golconda Fort", nearestStop: "Hyderabad", distance: "~11 km from Hyderabad", description: "A magnificent 16th-century fortress built by the Qutb Shahi dynasty, famous for its acoustic engineering and panoramic city views.", bestTime: "Early morning (8–10 AM) before the heat", travelTip: "TSRTC bus no. 119 from Mehdipatnam (₹20) or auto for ₹150.", activities: [{ name: "Clapping Sound Acoustic Test at Gate", type: "SIGHTSEEING", estimatedCost: 0, duration: 30 }, { name: "Fort Summit Trek & City View", type: "ADVENTURE", estimatedCost: 25, duration: 90 }] },
    { name: "Ramoji Film City", nearestStop: "Hyderabad", distance: "~30 km from Hyderabad", description: "The world's largest film studio complex (Guinness Record), offering guided tours through movie sets, thematic gardens, and live shows.", bestTime: "Weekdays for smaller crowds", travelTip: "Shuttle buses from MGBS Hyderabad (₹100) or cab for ₹500 return.", activities: [{ name: "Studio Backlot Tour", type: "SIGHTSEEING", estimatedCost: 1150, duration: 180 }, { name: "Kids Zone & Live Shows", type: "ADVENTURE", estimatedCost: 0, duration: 90 }] }
  ],
  kolkata: [
    { name: "Sundarbans", nearestStop: "Kolkata", distance: "~100 km from Kolkata", description: "The world's largest mangrove delta — a UNESCO site and home to the Royal Bengal Tiger. Boat safaris through the labyrinthine waterways.", bestTime: "November to February for best wildlife sightings", travelTip: "Book a tour from Kolkata (₹1500–2500/person including boat) via Godkhali Jetty.", activities: [{ name: "Tiger Reserve Boat Safari", type: "ADVENTURE", estimatedCost: 600, duration: 180 }, { name: "Mangrove Forest Walk", type: "SIGHTSEEING", estimatedCost: 0, duration: 60 }] },
    { name: "Bishnupur", nearestStop: "Kolkata", distance: "~150 km from Kolkata", description: "Famous for its 17th-century terracotta temples built by the Malla kings, unique Baluchari silk sarees, and Bishnupur gharana music.", bestTime: "October to March", travelTip: "Train from Howrah to Bishnupur (₹50–100, 3.5 hrs) or bus from Esplanade.", activities: [{ name: "Terracotta Temple Tour", type: "SIGHTSEEING", estimatedCost: 50, duration: 120 }, { name: "Buy Baluchari Silk Sarees", type: "SHOPPING", estimatedCost: 2000, duration: 60 }] }
  ],
  chennai: [
    { name: "Mahabalipuram", nearestStop: "Chennai", distance: "~55 km from Chennai", description: "A UNESCO World Heritage Site with 7th-century shore temples, rock-cut rathas, and bas-reliefs carved from giant granite boulders.", bestTime: "Morning (7–11 AM) before it gets hot", travelTip: "TNSTC bus from Chennai Koyambedu (₹55) or ECR taxi for ₹1200 return.", activities: [{ name: "Shore Temple & Five Rathas Tour", type: "SIGHTSEEING", estimatedCost: 500, duration: 120 }, { name: "Fresh Seafood Lunch", type: "FOOD", estimatedCost: 400, duration: 60 }] },
    { name: "Kanchipuram", nearestStop: "Chennai", distance: "~72 km from Chennai", description: "The City of Thousand Temples — one of India's seven sacred cities, famous for its Dravidian temples and pure silk saris woven since ancient times.", bestTime: "Early morning for temple visits before crowds", travelTip: "TNSTC bus from Chennai Koyambedu (₹65, 2 hrs) or train from Chennai Central.", activities: [{ name: "Kailasanathar Temple Visit", type: "SIGHTSEEING", estimatedCost: 0, duration: 60 }, { name: "Kanchipuram Silk Saree Shopping", type: "SHOPPING", estimatedCost: 3000, duration: 90 }] }
  ]
};

// Extract city name from prompt text
const extractCityFromPrompt = (prompt) => {
  const lower = prompt.toLowerCase();
  return Object.keys(CITY_STOPS).find(city => lower.includes(city)) || null;
};

const getMockResponse = (prompt) => {
  if (prompt.includes("nearby famous places")) {
    const city = extractCityFromPrompt(prompt);
    const places = city ? CITY_STOPS[city] : null;
    if (places && places.length) {
      return JSON.stringify({ suggestions: places.slice(0, 4) });
    }
    // Generic fallback for unrecognised cities
    return JSON.stringify({
      suggestions: [
        { name: "Nearest Heritage Site", nearestStop: "Your stop", distance: "~20 km", description: "A significant local heritage site worth exploring for its history and architecture.", bestTime: "Morning (8–11 AM)", travelTip: "Ask locals for the best auto or bus route — usually ₹50–100.", activities: [{ name: "Heritage Site Tour", type: "SIGHTSEEING", estimatedCost: 50, duration: 90 }, { name: "Local Street Food", type: "FOOD", estimatedCost: 150, duration: 45 }] },
        { name: "Local Market Area", nearestStop: "Your stop", distance: "~15 km", description: "A vibrant bazaar selling local handicrafts, spices, and fresh produce — a true taste of local culture.", bestTime: "Morning (9 AM–12 PM) when traders are active", travelTip: "Share an auto or take a local bus for ₹20–40.", activities: [{ name: "Market Exploration", type: "SHOPPING", estimatedCost: 500, duration: 90 }, { name: "Chai & Snacks", type: "FOOD", estimatedCost: 50, duration: 20 }] }
      ]
    });
  } else if (prompt.includes("day-by-day itinerary")) {
    const city = extractCityFromPrompt(prompt);
    const cityName = city ? city.charAt(0).toUpperCase() + city.slice(1) : "Your Destination";
    const cityActivities = {
      surat: [
        { time: "08:00", name: "Breakfast at Surat's famous Locho stalls", type: "FOOD", estimatedCost: 80, duration: 30, tip: "Try Surti Locho with sev and chutneys — a Surat speciality!" },
        { time: "10:00", name: "Surat Castle (Old Dutch Fort)", type: "SIGHTSEEING", estimatedCost: 0, duration: 60, tip: "Free entry, great photo spot by the Tapti river." },
        { time: "12:00", name: "Gopi Dining Hall Thali Lunch", type: "FOOD", estimatedCost: 200, duration: 60, tip: "One of Surat's most legendary unlimited Gujarati thali restaurants." },
        { time: "15:00", name: "Dumas Beach Evening Visit", type: "SIGHTSEEING", estimatedCost: 0, duration: 120, tip: "Take a shared auto (₹30) — visit at sunset for the best experience." },
        { time: "19:00", name: "Chowk Bazaar Night Shopping", type: "SHOPPING", estimatedCost: 1000, duration: 90, tip: "Surat is the textile capital — buy fabrics directly from wholesale markets." }
      ],
      default: [
        { time: "09:00", name: "Local Museum or Heritage Site Visit", type: "SIGHTSEEING", estimatedCost: 100, duration: 90, tip: "Arrive early to beat the crowds." },
        { time: "12:00", name: "Lunch at Local Dhaba", type: "FOOD", estimatedCost: 250, duration: 60, tip: "Order the local thali for an authentic experience." },
        { time: "14:30", name: "Main Bazaar Shopping", type: "SHOPPING", estimatedCost: 800, duration: 90, tip: "Bargain well — first price is usually 2x the fair price!" },
        { time: "17:00", name: "Sunset at Nearest Viewpoint or River Ghat", type: "SIGHTSEEING", estimatedCost: 0, duration: 60, tip: "The best sunsets are usually at water bodies." }
      ]
    };
    const acts = city && cityActivities[city] ? cityActivities[city] : cityActivities.default;
    return JSON.stringify({
      days: [{
        dayNumber: 1,
        date: new Date().toISOString().split('T')[0],
        city: cityName,
        theme: `Explore the best of ${cityName}`,
        activities: acts,
        estimatedDayCost: acts.reduce((s, a) => s + a.estimatedCost, 0),
        budgetTip: `Use local autos and city buses in ${cityName} to save on travel costs.`
      }],
      totalEstimatedCost: acts.reduce((s, a) => s + a.estimatedCost, 0),
      budgetStatus: "within",
      generalTips: [`Book IRCTC trains early for travel to/from ${cityName}`, "Carry cash — many local shops don't accept cards", "Hydrate well, especially in Gujarat's summer heat"]
    });
  } else if (prompt.includes("3-sentence travel summary")) {

    return JSON.stringify({
      summary: "An exciting journey through the heart of India, exploring vibrant markets and historic sites. Enjoy authentic local cuisine while interacting with welcoming locals. A perfect blend of heritage, adventure, and unforgettable memories.",
      highlights: ["Vibrant Markets", "Historic Sites", "Authentic Local Cuisine"],
      hashtags: ["#IncredibleIndia", "#TravelGoals"]
    });
  } else if (prompt.includes("smart packing list")) {
    return JSON.stringify({
      categories: [
        { name: "Documents", items: ["Aadhaar Card / ID", "Travel tickets"] },
        { name: "Clothing", items: ["Comfortable cottons", "Walking shoes", "Modest clothing for temples"] },
        { name: "Electronics", items: ["Phone charger", "Power bank", "Universal adapter"] },
        { name: "Toiletries", items: ["Sunscreen", "Mosquito repellent", "Hand sanitizer"] },
        { name: "Essentials", items: ["Cash in INR", "Water bottle", "First-aid kit"] }
      ]
    });
  } else if (prompt.toLowerCase().includes("best time")) {
    return "The best time to visit most parts of India is during the winter months, from October to March, when the weather is cool and pleasant. However, if you're planning a trip to the Himalayas (like Ladakh or Spiti), summer (May to July) is the ideal season.";
  } else if (prompt.toLowerCase().includes("food") || prompt.toLowerCase().includes("eat")) {
    return "You're in for a treat! Don't miss out on local street food, but make sure to eat at busy places where food is cooked fresh in front of you. Always drink bottled or filtered water (₹20 per bottle), and definitely try a hot cup of local chai!";
  } else if (prompt.toLowerCase().includes("budget") || prompt.toLowerCase().includes("cheap")) {
    return "India is incredibly budget-friendly. You can travel comfortably on ₹1,500–₹3,000 per day. Use local trains (IRCTC) or buses for intercity travel, eat at local dhabas, and use auto-rickshaws (always insist on the meter or agree on a fare beforehand).";
  } else {
    return "That's a great question about your trip! While I'm currently operating in offline mode to save resources, I highly recommend checking local travel blogs for specific details. Always keep your documents handy, carry a mix of cash and UPI apps, and enjoy the beautiful chaos of India!";
  }
};

// ─── OpenRouter AI Call ───────────────────────────────────────────────────────
const callAI = async (prompt, maxTokens = 1000) => {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_')) {
    console.log("No valid AI API key found. Returning mock fallback data.");
    return getMockResponse(prompt);
  }
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'Traveloop'
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("AI API failed (Network/Auth Error). Returning mock fallback data.");
    return getMockResponse(prompt);
  }
};

function extractJSON(text) {
  try {
    const start = text.indexOf('{');
    const end   = text.lastIndexOf('}') + 1;
    if (start === -1 || end === 0) throw new Error('No JSON structure found');
    return JSON.parse(text.substring(start, end));
  } catch (e) {
    console.error("Failed to parse JSON from AI, returning raw or empty object.", e);
    return {};
  }
}

// ─── Suggest Nearby Stops (Famous Places within 20-30km) ─────────────────────
router.post('/suggest-stops', auth, async (req, res) => {
  try {
    const { tripId } = req.body;
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: req.userId },
      include: { stops: { include: { activities: true } } }
    });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (!trip.stops.length) return res.status(400).json({ error: 'Add at least one stop first' });

    // List of ALL current stop city names — AI must NOT re-suggest these
    const existingStopNames = trip.stops.map(s => s.city).join(', ');

    const stopList = trip.stops.map(s => {
      const actTypes = [...new Set(s.activities.map(a => a.type))].join(', ') || 'sightseeing';
      return `${s.city}, ${s.country} (activities: ${actTypes})`;
    }).join(' | ');
    const days = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24));

    const prompt = `You are an expert Indian travel guide for Traveloop India.
The traveller is visiting: ${stopList}.
Trip: "${trip.name}", Duration: ${days} days, Budget: ₹${trip.totalBudget}.

IMPORTANT: The traveller has ALREADY added these places to their trip: ${existingStopNames}.
DO NOT suggest any of these places or anything with a similar name.
Only suggest COMPLETELY DIFFERENT, NEW nearby places they have NOT yet added.

Suggest 3–4 nearby famous Indian places within 20–30 km of their current stops, ideal as day trips.
Choose genuine, well-known attractions: temples, forts, waterfalls, beaches, hill stations, scenic viewpoints, wildlife spots, markets etc.
For each place suggest 2–3 specific activities visitors should do there.

Return ONLY valid JSON, no markdown, no explanation:
{
  "suggestions": [
    {
      "name": "Exact place name",
      "nearestStop": "Which of the traveller's stops it's closest to",
      "distance": "~22 km from Jaipur",
      "description": "2 sentence description of what makes this place special and why to visit",
      "bestTime": "Best time of day or season (be specific)",
      "travelTip": "How to get there cheaply — mention auto/bus/taxi and approximate ₹ cost",
      "activities": [
        { "name": "Specific activity name", "type": "SIGHTSEEING", "estimatedCost": 200, "duration": 90 }
      ]
    }
  ]
}`;

    const text = await callAI(prompt, 2000);
    let result = extractJSON(text);

    // Server-side safety filter: remove any suggestions matching existing stops
    if (result.suggestions) {
      const existingLower = trip.stops.map(s => s.city.toLowerCase());
      result.suggestions = result.suggestions.filter(s => {
        const nameLower = s.name?.toLowerCase() || '';
        return !existingLower.some(e => e.includes(nameLower) || nameLower.includes(e));
      });
    }

    if (!result.suggestions || !result.suggestions.length) {
      result = JSON.parse(getMockResponse('nearby famous places'));
    }
    res.json(result);
  } catch (error) {
    console.error('AI suggest-stops error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── Suggest Day-by-Day Itinerary ─────────────────────────────────────────────
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
    if (!result.days) {
      return res.json(JSON.parse(getMockResponse("day-by-day itinerary")));
    }
    res.json(result);
  } catch (error) {
    console.error('AI suggest error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── Generate Trip Summary ─────────────────────────────────────────────────────
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
    if (!result.summary) {
      return res.json(JSON.parse(getMockResponse("3-sentence travel summary")));
    }
    res.json(result);
  } catch (error) {
    console.error('AI summary error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── Generate Packing List ─────────────────────────────────────────────────────
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
    if (!result.categories) {
      Object.assign(result, JSON.parse(getMockResponse("smart packing list")));
    }

    const allItems = result.categories.flatMap(cat =>
      cat.items.map(item => ({ tripId, label: item, category: cat.name }))
    );
    await prisma.packingItem.deleteMany({ where: { tripId } });
    await prisma.packingItem.createMany({ data: allItems });
    const saved = await prisma.packingItem.findMany({ where: { tripId }, orderBy: [{ category: 'asc' }] });
    res.json({ categories: result.categories, items: saved });
  } catch (error) {
    console.error('AI packing error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── Travel Chat ───────────────────────────────────────────────────────────────
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
    console.error('AI chat error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
