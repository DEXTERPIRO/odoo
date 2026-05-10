const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  await prisma.postLike.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.tripNote.deleteMany();
  await prisma.packingItem.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.stop.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.user.deleteMany();

  const adminPass = await bcrypt.hash('admin123', 12);
  const userPass = await bcrypt.hash('user123', 12);

  const admin = await prisma.user.create({
    data: { email: 'admin@traveloop.com', password: adminPass, firstName: 'Admin', lastName: 'Traveloop', city: 'Ahmedabad', country: 'India', isAdmin: true }
  });

  const user1 = await prisma.user.create({
    data: { email: 'priya@example.com', password: userPass, firstName: 'Priya', lastName: 'Sharma', city: 'Mumbai', country: 'India', phone: '+91 9876543210' }
  });

  const user2 = await prisma.user.create({
    data: { email: 'rahul@example.com', password: userPass, firstName: 'Rahul', lastName: 'Patel', city: 'Bangalore', country: 'India' }
  });

  const trip1 = await prisma.trip.create({
    data: {
      userId: user1.id, name: 'Europe Adventure 2025', description: 'A dream trip through Paris, Rome, and Barcelona',
      startDate: new Date('2025-06-10'), endDate: new Date('2025-06-25'), totalBudget: 3000, isPublic: true, status: 'UPCOMING',
      stops: {
        create: [
          {
            city: 'Paris', country: 'France', startDate: new Date('2025-06-10'), endDate: new Date('2025-06-14'), orderIndex: 0,
            activities: {
              create: [
                { name: 'Eiffel Tower Visit', type: 'SIGHTSEEING', cost: 26, duration: 180, notes: 'Book tickets online to skip queue' },
                { name: 'Louvre Museum', type: 'SIGHTSEEING', cost: 17, duration: 240 },
                { name: 'Seine River Cruise', type: 'SIGHTSEEING', cost: 15, duration: 90 },
                { name: 'French Dinner at Le Marais', type: 'FOOD', cost: 45, duration: 90 }
              ]
            }
          },
          {
            city: 'Rome', country: 'Italy', startDate: new Date('2025-06-15'), endDate: new Date('2025-06-19'), orderIndex: 1,
            activities: {
              create: [
                { name: 'Colosseum Tour', type: 'SIGHTSEEING', cost: 18, duration: 120 },
                { name: 'Vatican Museums', type: 'SIGHTSEEING', cost: 20, duration: 180 },
                { name: 'Pasta Making Class', type: 'FOOD', cost: 60, duration: 150 }
              ]
            }
          },
          {
            city: 'Barcelona', country: 'Spain', startDate: new Date('2025-06-20'), endDate: new Date('2025-06-25'), orderIndex: 2,
            activities: {
              create: [
                { name: 'Sagrada Familia', type: 'SIGHTSEEING', cost: 26, duration: 150 },
                { name: 'Park Guell', type: 'SIGHTSEEING', cost: 10, duration: 90 },
                { name: 'Tapas Tour', type: 'FOOD', cost: 35, duration: 120 }
              ]
            }
          }
        ]
      },
      expenses: {
        create: [
          { category: 'Flight', description: 'Mumbai to Paris return flight', amount: 800, date: new Date('2025-05-01') },
          { category: 'Hotel', description: 'Paris hotel 4 nights', amount: 400, date: new Date('2025-06-10') },
          { category: 'Hotel', description: 'Rome Airbnb 4 nights', amount: 280, date: new Date('2025-06-15') },
          { category: 'Hotel', description: 'Barcelona hostel 5 nights', amount: 200, date: new Date('2025-06-20') },
          { category: 'Transport', description: 'Eurail pass', amount: 180, date: new Date('2025-06-10') }
        ]
      },
      checklist: {
        create: [
          { label: 'Passport', category: 'Documents' },
          { label: 'Travel Insurance', category: 'Documents' },
          { label: 'Euro currency', category: 'Documents' },
          { label: 'T-shirts (7)', category: 'Clothing' },
          { label: 'Comfortable walking shoes', category: 'Clothing' },
          { label: 'Light jacket', category: 'Clothing' },
          { label: 'Phone charger', category: 'Electronics' },
          { label: 'Universal adapter', category: 'Electronics' },
          { label: 'Power bank', category: 'Electronics' },
          { label: 'Sunscreen', category: 'Toiletries' },
          { label: 'Hand sanitizer', category: 'Toiletries' }
        ]
      },
      notes: {
        create: [
          { userId: user1.id, title: 'Paris Hotel Check-in', content: 'Hotel Le Marais — Check in after 2pm. Breakfast included. WiFi password: paris2025' },
          { userId: user1.id, title: 'Rome tips', content: 'Metro line A goes to Vatican. Buy a 48hr pass for 12 euros. Avoid restaurants near tourist spots.' },
          { userId: user1.id, title: 'Barcelona emergency', content: 'Emergency: +34 112. Hotel: Hotel Gracia. Address: Carrer de Gracia 45' }
        ]
      }
    }
  });

  const trip2 = await prisma.trip.create({
    data: {
      userId: user2.id, name: 'Goa Beach Holiday', description: 'Relaxing beach vacation',
      startDate: new Date('2025-03-01'), endDate: new Date('2025-03-07'), totalBudget: 500, isPublic: true, status: 'COMPLETED',
      stops: {
        create: [
          {
            city: 'Goa', country: 'India', startDate: new Date('2025-03-01'), endDate: new Date('2025-03-07'), orderIndex: 0,
            activities: {
              create: [
                { name: 'Baga Beach', type: 'SIGHTSEEING', cost: 0, duration: 180 },
                { name: 'Dudhsagar Waterfall Trek', type: 'ADVENTURE', cost: 800, duration: 480, notes: 'Price in INR, ~9.60 USD' },
                { name: 'Old Goa Churches Tour', type: 'SIGHTSEEING', cost: 0, duration: 120 },
                { name: 'Seafood dinner at shack', type: 'FOOD', cost: 20, duration: 90 }
              ]
            }
          }
        ]
      },
      expenses: {
        create: [
          { category: 'Flight', description: 'Bangalore to Goa flight', amount: 80, date: new Date('2025-03-01') },
          { category: 'Hotel', description: 'Beach resort 6 nights', amount: 180, date: new Date('2025-03-01') },
          { category: 'Food', description: 'Daily meals estimate', amount: 120, date: new Date('2025-03-01') }
        ]
      }
    }
  });

  await prisma.communityPost.create({
    data: { userId: user1.id, tripId: trip1.id, caption: 'My dream Europe trip! Paris was magical, Rome was historic, Barcelona was vibrant! Anyone planning a similar trip? Happy to share my itinerary!', likesCount: 12 }
  });

  await prisma.communityPost.create({
    data: { userId: user2.id, tripId: trip2.id, caption: 'Perfect 7-day Goa escape! Beach, waterfalls, churches and amazing seafood. Best budget trip ever!', likesCount: 8 }
  });

  console.log('Database seeded successfully!');
  console.log('Admin login: admin@traveloop.com / admin123');
  console.log('User login: priya@example.com / user123');
  console.log('User login: rahul@example.com / user123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
