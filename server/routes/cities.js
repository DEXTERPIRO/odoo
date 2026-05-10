const router = require('express').Router();
const { auth } = require('../middleware/auth');

const CITIES = [
  { id: 1, name: 'Goa', country: 'India', state: 'Goa', region: 'West India', costIndex: 2, popularity: 98, currency: 'INR', language: 'Konkani / English', description: 'Sun-kissed beaches, Portuguese heritage, vibrant nightlife and delicious seafood', climate: 'Tropical', bestTime: 'Nov-Feb', emoji: '🏖️' },
  { id: 2, name: 'Jaipur', country: 'India', state: 'Rajasthan', region: 'North India', costIndex: 2, popularity: 96, currency: 'INR', language: 'Hindi / Rajasthani', description: 'The Pink City — royal palaces, forts, bazaars and camel rides in the desert', climate: 'Semi-arid', bestTime: 'Oct-Mar', emoji: '🏰' },
  { id: 3, name: 'Munnar', country: 'India', state: 'Kerala', region: 'South India', costIndex: 2, popularity: 91, currency: 'INR', language: 'Malayalam', description: 'Lush green tea plantations, misty hills and tranquil backwater canals', climate: 'Tropical Highland', bestTime: 'Sep-May', emoji: '🌿' },
  { id: 4, name: 'Manali', country: 'India', state: 'Himachal Pradesh', region: 'North India', costIndex: 2, popularity: 95, currency: 'INR', language: 'Hindi / Manali', description: 'Snow-capped peaks, adventure sports, Buddhist monasteries and Rohtang Pass', climate: 'Alpine', bestTime: 'Oct-Jun', emoji: '🏔️' },
  { id: 5, name: 'Varanasi', country: 'India', state: 'Uttar Pradesh', region: 'North India', costIndex: 1, popularity: 93, currency: 'INR', language: 'Hindi', description: 'One of the world oldest cities — sacred ghats, Ganga Aarti and spiritual energy', climate: 'Humid subtropical', bestTime: 'Oct-Mar', emoji: '🛕' },
  { id: 6, name: 'Agra', country: 'India', state: 'Uttar Pradesh', region: 'North India', costIndex: 1, popularity: 97, currency: 'INR', language: 'Hindi', description: 'Home of the iconic Taj Mahal, Agra Fort and the grand Mughal heritage', climate: 'Semi-arid', bestTime: 'Oct-Mar', emoji: '🕌' },
  { id: 7, name: 'Mumbai', country: 'India', state: 'Maharashtra', region: 'West India', costIndex: 3, popularity: 94, currency: 'INR', language: 'Hindi / Marathi', description: 'City of dreams — Bollywood, colonial architecture, street food and Marine Drive', climate: 'Tropical', bestTime: 'Nov-Feb', emoji: '🎬' },
  { id: 8, name: 'Delhi', country: 'India', state: 'Delhi', region: 'North India', costIndex: 2, popularity: 92, currency: 'INR', language: 'Hindi', description: 'India\'s capital — Mughal history, street food, monuments and vibrant markets', climate: 'Humid subtropical', bestTime: 'Oct-Mar', emoji: '🏛️' },
  { id: 9, name: 'Darjeeling', country: 'India', state: 'West Bengal', region: 'East India', costIndex: 2, popularity: 88, currency: 'INR', language: 'Nepali / Bengali', description: 'Himalayan toy train, stunning Kanchenjunga views and world-famous tea gardens', climate: 'Highland', bestTime: 'Mar-May, Sep-Nov', emoji: '🍵' },
  { id: 10, name: 'Rishikesh', country: 'India', state: 'Uttarakhand', region: 'North India', costIndex: 1, popularity: 90, currency: 'INR', language: 'Hindi', description: 'Yoga capital of the world — Ganga rafting, bungee jumping and ashrams', climate: 'Subtropical', bestTime: 'Sep-Jun', emoji: '🧘' },
  { id: 11, name: 'Mysore', country: 'India', state: 'Karnataka', region: 'South India', costIndex: 1, popularity: 87, currency: 'INR', language: 'Kannada', description: 'Royal city with grand Mysore Palace, sandalwood markets and Chamundi Hills', climate: 'Semi-arid', bestTime: 'Oct-Feb', emoji: '👑' },
  { id: 12, name: 'Udaipur', country: 'India', state: 'Rajasthan', region: 'North India', costIndex: 2, popularity: 93, currency: 'INR', language: 'Hindi / Rajasthani', description: 'City of Lakes — Pichola Lake, white palaces and romantic Rajput architecture', climate: 'Semi-arid', bestTime: 'Oct-Mar', emoji: '🏯' },
  { id: 13, name: 'Ladakh', country: 'India', state: 'J&K / Ladakh UT', region: 'North India', costIndex: 3, popularity: 92, currency: 'INR', language: 'Ladakhi / Hindi', description: 'Roof of the world — high-altitude deserts, monasteries, Pangong Lake and Leh', climate: 'Cold Desert', bestTime: 'Jun-Sep', emoji: '🏕️' },
  { id: 14, name: 'Coorg', country: 'India', state: 'Karnataka', region: 'South India', costIndex: 2, popularity: 85, currency: 'INR', language: 'Kodava / Kannada', description: 'Scotland of India — coffee estates, waterfalls, lush forests and misty mornings', climate: 'Tropical Highland', bestTime: 'Oct-Mar', emoji: '☕' },
  { id: 15, name: 'Andaman', country: 'India', state: 'Andaman & Nicobar', region: 'Island', costIndex: 3, popularity: 89, currency: 'INR', language: 'Hindi / Tamil', description: 'Crystal-clear waters, pristine beaches, scuba diving and historic Cellular Jail', climate: 'Tropical', bestTime: 'Nov-Apr', emoji: '🏝️' },
  { id: 16, name: 'Shimla', country: 'India', state: 'Himachal Pradesh', region: 'North India', costIndex: 2, popularity: 91, currency: 'INR', language: 'Hindi', description: 'Former British summer capital — colonial architecture, Ridge Mall and mountain views', climate: 'Alpine', bestTime: 'Mar-Jun, Dec-Jan', emoji: '❄️' },
  { id: 17, name: 'Ranthambore', country: 'India', state: 'Rajasthan', region: 'North India', costIndex: 3, popularity: 83, currency: 'INR', language: 'Hindi', description: 'India\'s most famous tiger reserve — jeep safaris through ancient fort ruins', climate: 'Semi-arid', bestTime: 'Oct-Jun', emoji: '🐅' },
  { id: 18, name: 'Kolkata', country: 'India', state: 'West Bengal', region: 'East India', costIndex: 1, popularity: 84, currency: 'INR', language: 'Bengali', description: 'City of Joy — Durga Puja, trams, Howrah Bridge, Mishti Doi and colonial heritage', climate: 'Tropical Wet', bestTime: 'Oct-Mar', emoji: '🎨' },
  { id: 19, name: 'Hampi', country: 'India', state: 'Karnataka', region: 'South India', costIndex: 1, popularity: 82, currency: 'INR', language: 'Kannada', description: 'UNESCO World Heritage ruins of the Vijayanagara Empire amid surreal boulder landscapes', climate: 'Semi-arid', bestTime: 'Oct-Feb', emoji: '🏺' },
  { id: 20, name: 'Ooty', country: 'India', state: 'Tamil Nadu', region: 'South India', costIndex: 1, popularity: 86, currency: 'INR', language: 'Tamil', description: 'Queen of Hill Stations — Nilgiri toy train, botanical gardens and misty lake', climate: 'Highland', bestTime: 'Apr-Jun, Sep-Nov', emoji: '🌸' }
];

router.get('/', auth, async (req, res) => {
  try {
    const { search, region, maxCost, sortBy } = req.query;
    let cities = [...CITIES];

    if (search) {
      cities = cities.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.state.toLowerCase().includes(search.toLowerCase()) ||
        c.country.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (region && region !== 'All') {
      cities = cities.filter(c => c.region === region);
    }
    if (maxCost) {
      cities = cities.filter(c => c.costIndex <= parseInt(maxCost));
    }
    if (sortBy === 'popularity') cities.sort((a, b) => b.popularity - a.popularity);
    else if (sortBy === 'cost-low') cities.sort((a, b) => a.costIndex - b.costIndex);
    else if (sortBy === 'cost-high') cities.sort((a, b) => b.costIndex - a.costIndex);
    else if (sortBy === 'name') cities.sort((a, b) => a.name.localeCompare(b.name));

    res.json(cities);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
