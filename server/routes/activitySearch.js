const router = require('express').Router();
const { auth } = require('../middleware/auth');

const ACTIVITIES = [
  { id: 1, city: 'Agra', name: 'Taj Mahal Sunrise Tour', type: 'SIGHTSEEING', cost: 1500, duration: 180, difficulty: 'Easy', description: 'Watch the Taj Mahal glow golden at sunrise — the most magical experience in India', rating: 5.0 },
  { id: 2, city: 'Varanasi', name: 'Ganga Aarti Ceremony', type: 'SIGHTSEEING', cost: 0, duration: 90, difficulty: 'Easy', description: 'Witness the spectacular evening fire ritual on the sacred ghats of the Ganges', rating: 4.9 },
  { id: 3, city: 'Rishikesh', name: 'White Water River Rafting', type: 'ADVENTURE', cost: 800, duration: 180, difficulty: 'Moderate', description: 'Thrilling Grade III-IV rapids on the Ganga through Rishikesh gorges', rating: 4.8 },
  { id: 4, city: 'Jaipur', name: 'Camel Safari at Thar Desert', type: 'ADVENTURE', cost: 1200, duration: 240, difficulty: 'Easy', description: 'Ride camels through golden sand dunes near Jaisalmer at sunset', rating: 4.7 },
  { id: 5, city: 'Manali', name: 'Rohtang Pass Snow Trek', type: 'ADVENTURE', cost: 600, duration: 360, difficulty: 'Hard', description: 'Trek to 13,050 ft Rohtang Pass with snow fields and panoramic Himalayan views', rating: 4.8 },
  { id: 6, city: 'Goa', name: 'Beach Shack Seafood & Feni Tour', type: 'FOOD', cost: 500, duration: 120, difficulty: 'Easy', description: 'Hop between Goa\'s iconic beach shacks trying fresh catch and local Feni liquor', rating: 4.6 },
  { id: 7, city: 'Delhi', name: 'Old Delhi Street Food Walk', type: 'FOOD', cost: 700, duration: 180, difficulty: 'Easy', description: 'Chandni Chowk food tour — chaat, jalebi, paranthe and kebabs with a local guide', rating: 4.9 },
  { id: 8, city: 'Mumbai', name: 'Dharavi & Street Art Walk', type: 'SIGHTSEEING', cost: 900, duration: 180, difficulty: 'Easy', description: 'Explore Asia\'s largest informal settlement and the vibrant street art of Bandra', rating: 4.5 },
  { id: 9, city: 'Ladakh', name: 'Pangong Lake Camping', type: 'ADVENTURE', cost: 2500, duration: 480, difficulty: 'Moderate', description: 'Camp overnight beside the stunning blue Pangong Tso lake at 14,000 ft altitude', rating: 4.9 },
  { id: 10, city: 'Munnar', name: 'Tea Estate Walk & Tasting', type: 'SIGHTSEEING', cost: 400, duration: 150, difficulty: 'Easy', description: 'Walk through endless green tea gardens and taste freshly brewed Munnar tea', rating: 4.7 },
  { id: 11, city: 'Andaman', name: 'Scuba Diving at Havelock Island', type: 'ADVENTURE', cost: 3500, duration: 240, difficulty: 'Moderate', description: 'Dive into crystal-clear Andaman waters with vibrant corals and tropical fish', rating: 4.9 },
  { id: 12, city: 'Varanasi', name: 'Dawn Boat Ride on the Ganga', type: 'SIGHTSEEING', cost: 300, duration: 90, difficulty: 'Easy', description: 'Row through the sacred ghats at dawn — the most spiritual moment in Varanasi', rating: 4.8 },
  { id: 13, city: 'Jaipur', name: 'Elephant Ride at Amber Fort', type: 'SIGHTSEEING', cost: 1000, duration: 120, difficulty: 'Easy', description: 'Ascend the majestic Amber Fort on elephant back through its stunning gatewayrs', rating: 4.6 },
  { id: 14, city: 'Kerala', name: 'Alleppey Houseboat Stay', type: 'SIGHTSEEING', cost: 5000, duration: 480, difficulty: 'Easy', description: 'Overnight stay on a traditional Kerala kettuvallam through tranquil backwaters', rating: 4.9 },
  { id: 15, city: 'Rishikesh', name: 'Bungee Jumping (83m)', type: 'ADVENTURE', cost: 3500, duration: 60, difficulty: 'Hard', description: 'India\'s highest bungee jump over the Ganga river gorge — pure adrenaline', rating: 4.7 },
  { id: 16, city: 'Mysore', name: 'Mysore Palace Light Show', type: 'SIGHTSEEING', cost: 200, duration: 90, difficulty: 'Easy', description: 'Sunday evening illumination of Mysore Palace with 97,000 light bulbs — breathtaking', rating: 4.8 },
  { id: 17, city: 'Delhi', name: 'Red Fort Sound & Light Show', type: 'SIGHTSEEING', cost: 150, duration: 60, difficulty: 'Easy', description: 'Narrated history of the Mughal Empire projected on the walls of Red Fort at night', rating: 4.5 },
  { id: 18, city: 'Goa', name: 'Portuguese Heritage Walk', type: 'SIGHTSEEING', cost: 500, duration: 120, difficulty: 'Easy', description: 'Walk through Old Goa\'s colonial churches, convents and UNESCO World Heritage sites', rating: 4.6 },
  { id: 19, city: 'Darjeeling', name: 'Himalayan Toy Train Ride', type: 'SIGHTSEEING', cost: 800, duration: 240, difficulty: 'Easy', description: 'UNESCO World Heritage steam toy train through tea gardens and mountain scenery', rating: 4.7 },
  { id: 20, city: 'Ranthambore', name: 'Tiger Safari Jeep Ride', type: 'ADVENTURE', cost: 1800, duration: 180, difficulty: 'Easy', description: 'Guided jeep safari through Ranthambore for the best chance of a Royal Bengal Tiger sighting', rating: 4.8 },
  { id: 21, city: 'Mumbai', name: 'Dabbawalas Experience Tour', type: 'FOOD', cost: 600, duration: 120, difficulty: 'Easy', description: 'Join Mumbai\'s legendary lunch box delivery network and understand their zero-error system', rating: 4.6 },
  { id: 22, city: 'Hampi', name: 'Sunrise Ruins Cycle Tour', type: 'ADVENTURE', cost: 300, duration: 300, difficulty: 'Moderate', description: 'Cycle through the surreal Vijayanagara ruins and massive boulder landscapes at golden hour', rating: 4.8 },
  { id: 23, city: 'Agra', name: 'Mughal Cuisine Cooking Class', type: 'FOOD', cost: 1200, duration: 180, difficulty: 'Easy', description: 'Learn to cook authentic Mughlai biryani, korma and shahi tukda with a local chef', rating: 4.7 },
  { id: 24, city: 'Shimla', name: 'Jakhu Temple Trek', type: 'ADVENTURE', cost: 0, duration: 150, difficulty: 'Moderate', description: 'Trek through Shimla forests to the ancient Hanuman temple at 8,048 ft with panoramic views', rating: 4.5 },
  { id: 25, city: 'Kolkata', name: 'Durga Puja Pandal Hopping', type: 'SIGHTSEEING', cost: 0, duration: 300, difficulty: 'Easy', description: 'Explore elaborately decorated Puja pandals during the world\'s largest street festival', rating: 4.9 }
];

router.get('/', auth, async (req, res) => {
  try {
    const { search, city, type, maxCost, maxDuration, sortBy } = req.query;
    let activities = [...ACTIVITIES];

    if (search) {
      activities = activities.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase()) ||
        a.city.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (city && city !== 'All') {
      activities = activities.filter(a => a.city === city);
    }
    if (type && type !== 'All') {
      activities = activities.filter(a => a.type === type);
    }
    if (maxCost) {
      activities = activities.filter(a => a.cost <= parseInt(maxCost));
    }
    if (maxDuration) {
      activities = activities.filter(a => a.duration <= parseInt(maxDuration));
    }
    if (sortBy === 'cost-low') activities.sort((a, b) => a.cost - b.cost);
    else if (sortBy === 'cost-high') activities.sort((a, b) => b.cost - a.cost);
    else if (sortBy === 'rating') activities.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'duration') activities.sort((a, b) => a.duration - b.duration);

    res.json(activities);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
