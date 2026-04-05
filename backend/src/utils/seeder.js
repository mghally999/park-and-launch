require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Boat = require('../models/Boat');
const { ParkingYard } = require('../models/ParkingModels');
const { Product } = require('../models/OtherModels');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/park_and_launch');
  console.log('✅ MongoDB connected');
};

const yards = [
  {
    name: 'Jebel Ali Marine Yard',
    slug: 'jebel-ali-marine-yard',
    description: 'Largest dry storage facility in Dubai with 24/7 CCTV and armed patrol.',
    emirate: 'Dubai', area: 'Jebel Ali',
    address: 'Jebel Ali Port Industrial Area, Dubai, UAE',
    location: { type: 'Point', coordinates: [55.0272, 24.9985] },
    totalSpots: 45, availableSpots: 20, maxBoatLengthFt: 65, maxBoatBeamFt: 22,
    pricing: { ratePerFootPerMonth: 20, annualDiscountPercent: 15, minimumLengthFt: 15, launchFeePerTrip: 150 },
    services: { powerWash: { available: true, priceAED: 200 }, cctv24h: true, security24h: true, electricHookup: true, freshwater: true },
    slipways: [{ name: 'Jebel Ali Public Slipway', location: { type: 'Point', coordinates: [55.0201, 24.9973] }, maxLengthFt: 60, feeAED: 80, isOperational: true, marinaName: 'Jebel Ali Marina' }],
    rating: 4.7, reviewCount: 89,
    contact: { phone: '+971 4 000 0001', whatsapp: '+971 50 000 0001', email: 'jebelali@parkandlaunch.ae' },
    isFeatured: true,
    cameraFeeds: [
      { cameraId: 'JAY_CAM_01', label: 'Main Entrance', streamUrl: '', thumbnailUrl: '', isActive: true },
      { cameraId: 'JAY_CAM_02', label: 'Row A – Boats 1-15', streamUrl: '', thumbnailUrl: '', isActive: true },
      { cameraId: 'JAY_CAM_03', label: 'Row B – Boats 16-30', streamUrl: '', thumbnailUrl: '', isActive: true },
      { cameraId: 'JAY_CAM_04', label: 'Row C – Boats 31-45', streamUrl: '', thumbnailUrl: '', isActive: true },
    ],
  },
  {
    name: 'Ras Al Khor Dry Yard',
    slug: 'ras-al-khor-dry-yard',
    description: 'Near Ras Al Khor Wildlife Sanctuary with easy Creek access.',
    emirate: 'Dubai', area: 'Ras Al Khor',
    address: 'Ras Al Khor Industrial Area, Dubai, UAE',
    location: { type: 'Point', coordinates: [55.3569, 25.1887] },
    totalSpots: 20, availableSpots: 20, maxBoatLengthFt: 45,
    pricing: { ratePerFootPerMonth: 22, annualDiscountPercent: 15, minimumLengthFt: 15, launchFeePerTrip: 120 },
    services: { powerWash: { available: true, priceAED: 180 }, cctv24h: true, security24h: true },
    rating: 4.5, reviewCount: 52,
    contact: { phone: '+971 4 000 0002', email: 'raskhor@parkandlaunch.ae' },
    cameraFeeds: [
      { cameraId: 'RAK_CAM_01', label: 'Main Gate', streamUrl: '', thumbnailUrl: '', isActive: true },
      { cameraId: 'RAK_CAM_02', label: 'Storage Area', streamUrl: '', thumbnailUrl: '', isActive: true },
    ],
  },
  {
    name: 'Deira Marine Storage',
    slug: 'deira-marine-storage',
    description: 'Prime location near Dubai Creek with quick Gulf access.',
    emirate: 'Dubai', area: 'Deira',
    address: 'Port Saeed, Deira, Dubai, UAE',
    location: { type: 'Point', coordinates: [55.3241, 25.2685] },
    totalSpots: 15, availableSpots: 2, maxBoatLengthFt: 40,
    pricing: { ratePerFootPerMonth: 23, annualDiscountPercent: 12, minimumLengthFt: 15, launchFeePerTrip: 100 },
    services: { powerWash: { available: true, priceAED: 180 }, cctv24h: true, security24h: false },
    rating: 4.3, reviewCount: 31,
    contact: { phone: '+971 4 000 0003', email: 'deira@parkandlaunch.ae' },
    cameraFeeds: [{ cameraId: 'DEI_CAM_01', label: 'Main Area', streamUrl: '', thumbnailUrl: '', isActive: true }],
  },
  {
    name: 'Palm Jumeirah Premium Yard',
    slug: 'palm-jumeirah-premium-yard',
    description: 'Exclusive dry storage adjacent to the Palm with concierge service.',
    emirate: 'Dubai', area: 'Palm Jumeirah',
    address: 'Palm Jumeirah Frond Area, Dubai, UAE',
    location: { type: 'Point', coordinates: [55.1178, 25.1127] },
    totalSpots: 12, availableSpots: 3, maxBoatLengthFt: 80,
    pricing: { ratePerFootPerMonth: 25, annualDiscountPercent: 10, minimumLengthFt: 20, launchFeePerTrip: 200 },
    services: { powerWash: { available: true, priceAED: 300 }, cctv24h: true, security24h: true, wifi: true, electricHookup: true, freshwater: true },
    rating: 4.9, reviewCount: 67,
    contact: { phone: '+971 4 000 0004', whatsapp: '+971 50 000 0004', email: 'palm@parkandlaunch.ae' },
    isFeatured: true,
    cameraFeeds: [
      { cameraId: 'PLM_CAM_01', label: 'Premium Bay A', streamUrl: '', thumbnailUrl: '', isActive: true },
      { cameraId: 'PLM_CAM_02', label: 'Premium Bay B', streamUrl: '', thumbnailUrl: '', isActive: true },
    ],
  },
];

const products = [
  { name: 'Garmin STRIKER Plus 5cv Fish Finder', category: 'electronics', brand: 'Garmin', description: 'Built-in GPS with ClearVü scanning sonar.', price: 1299, stock: 15, rating: 4.8, reviewCount: 34, tags: ['fish finder', 'gps', 'sonar'], isFeatured: true, isActive: true },
  { name: 'Shimano Baitrunner DL 4000 Reel', category: 'fishing_equipment', brand: 'Shimano', description: 'Premium spinning reel for UAE coastal fishing.', price: 425, stock: 28, rating: 4.7, reviewCount: 56, tags: ['reel', 'spinning', 'fishing'], isActive: true },
  { name: 'Penn Squall 2-Speed Lever Drag Reel', category: 'fishing_equipment', brand: 'Penn', description: 'Heavy-duty offshore reel for deep sea fishing.', price: 850, stock: 12, rating: 4.6, reviewCount: 23, tags: ['reel', 'offshore', 'deep sea'], isActive: true },
  { name: 'Mustad Ultra Point Hooks 100pcs', category: 'fishing_equipment', brand: 'Mustad', description: 'High-carbon steel hooks assorted sizes 1/0-5/0.', price: 85, stock: 100, rating: 4.5, reviewCount: 88, tags: ['hooks', 'tackle', 'fishing'], isActive: true },
  { name: 'Marine Bilge Pump 1100 GPH', category: 'deck_hardware', brand: 'Rule', description: 'Automatic bilge pump with float switch. 12V.', price: 245, stock: 20, rating: 4.7, reviewCount: 41, tags: ['bilge pump', 'safety'], isActive: true },
  { name: 'Plastimo Offshore 95 Life Jacket', category: 'life_jackets', brand: 'Plastimo', description: 'CE approved 95N life jacket for offshore use.', price: 185, stock: 45, rating: 4.9, reviewCount: 72, tags: ['life jacket', 'safety'], isFeatured: true, isActive: true },
  { name: 'Marine VHF Radio Handheld', category: 'electronics', brand: 'Standard Horizon', description: 'Floating handheld VHF radio waterproof to IPX8.', price: 520, stock: 18, rating: 4.8, reviewCount: 29, tags: ['vhf', 'radio', 'communication'], isActive: true },
  { name: 'Stainless Steel Anchor 6kg Danforth', category: 'anchoring', brand: 'Lewmar', description: 'Heavy duty stainless danforth anchor for UAE seabed.', price: 380, stock: 25, rating: 4.6, reviewCount: 35, tags: ['anchor', 'stainless'], isActive: true },
  { name: 'Star Brite Marine Wash and Wax 3.8L', category: 'cleaning_supplies', brand: 'Star Brite', description: 'Non-streaking boat wash with carnauba wax.', price: 95, stock: 60, rating: 4.7, reviewCount: 94, tags: ['cleaning', 'wax', 'maintenance'], isActive: true },
  { name: 'Live Bait Fresh Sardines 50pcs', category: 'bait', description: 'Fresh live sardines sourced daily from UAE waters.', price: 60, stock: 999, rating: 4.8, reviewCount: 120, tags: ['bait', 'sardines', 'fishing'], isActive: true },
  { name: 'Marine LED Navigation Lights Set', category: 'electrical', brand: 'Attwood', description: 'Port, starboard, stern, masthead lights. Waterproof LED 12V.', price: 320, stock: 22, rating: 4.6, reviewCount: 38, tags: ['navigation lights', 'led', 'electrical'], isActive: true },
  { name: 'Suunto D4i Novo Dive Watch', category: 'navigation', brand: 'Suunto', description: 'Dive computer with digital compass, 100m water resistant.', price: 1850, stock: 8, rating: 4.9, reviewCount: 17, tags: ['dive watch', 'navigation', 'diving'], isFeatured: true, isActive: true },
];

const seed = async () => {
  try {
    await connectDB();
    await Promise.all([
      User.deleteMany({}),
      Boat.deleteMany({}),
      ParkingYard.deleteMany({}),
      Product.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ALL lowercase passwords as requested
    await User.create({
      name: 'Admin User',
      email: 'admin@parkandlaunch.ae',
      phone: '+97150000001',
      password: 'admin123',
      role: 'admin',
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
    });

    const testUser = await User.create({
      name: 'Ahmed Al Rashidi',
      email: 'ahmed@parkandlaunch.ae',
      phone: '+97150111222',
      password: 'user123',
      role: 'user',
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
    });

    await User.create({
      name: 'Captain Khalid',
      email: 'captain@parkandlaunch.ae',
      phone: '+97150333444',
      password: 'captain123',
      role: 'captain',
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
      captainProfile: {
        licenseNumber: 'UAE-CAPT-2021-04891',
        licenseExpiry: new Date('2026-12-31'),
        rating: 4.8,
        totalTrips: 247,
        bio: 'Licensed UAE captain with 15 years experience in Arabian Gulf.',
        isAvailable: true,
        vessel: { name: 'Desert Star', vesselType: 'speedboat', capacity: 10, length: 32 },
      },
    });

    await Boat.create({
      owner: testUser._id,
      name: 'Blue Falcon',
      registrationNumber: 'DXB-2019-00847',
      type: 'speedboat',
      make: 'Sealine', model: 'S330', year: 2019, color: 'White/Blue',
      dimensions: { lengthFt: 33, beamFt: 10.5, draftFt: 2.8, weightKg: 3200 },
      engine: { make: 'Volvo Penta', horsepower: 300, fuelType: 'gasoline', numberOfEngines: 2 },
      capacity: { passengers: 8, fuelLiters: 400 },
      status: 'in_water',
    });

    const createdYards = await ParkingYard.insertMany(yards);
    const createdProducts = await Product.insertMany(products);

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('  LOGIN CREDENTIALS (all lowercase):');
    console.log('═══════════════════════════════════════');
    console.log('  Admin:   admin@parkandlaunch.ae');
    console.log('  Pass:    admin123');
    console.log('───────────────────────────────────────');
    console.log('  User:    ahmed@parkandlaunch.ae');
    console.log('  Pass:    user123');
    console.log('───────────────────────────────────────');
    console.log('  Captain: captain@parkandlaunch.ae');
    console.log('  Pass:    captain123');
    console.log('═══════════════════════════════════════');
    console.log(`\n  ${createdYards.length} parking yards seeded`);
    console.log(`  ${createdProducts.length} products seeded`);
    createdYards.forEach(y => console.log(`  - ${y.name}: ${y.availableSpots}/${y.totalSpots} spots @ ${y.pricing.ratePerFootPerMonth} AED/ft/month`));

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();
