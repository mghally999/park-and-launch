// ============================================================
// PARK & LAUNCH — COMPLETE MOCK DATA
// Real UAE GPS coordinates, realistic pricing, full data
// ============================================================

export const MOCK_YARDS = [
  {
    _id: 'yard_001',
    name: 'Jebel Ali Marine Yard',
    slug: 'jebel-ali',
    description: 'The largest premium dry storage facility in the UAE with military-grade security, 24/7 CCTV surveillance, and direct slipway access to the Arabian Gulf.',
    emirate: 'Dubai', area: 'Jebel Ali',
    address: 'Jebel Ali Port Industrial Area, Zone A, Dubai, UAE',
    location: { type: 'Point', coordinates: [55.0272, 24.9985] },
    totalSpots: 45, availableSpots: 12, maxBoatLengthFt: 65,
    pricing: { ratePerFootPerMonth: 20, annualDiscountPercent: 15, minimumLengthFt: 15, launchFeePerTrip: 150 },
    services: { powerWash: { available: true, priceAED: 200 }, cctv24h: true, security24h: true, electricHookup: true, freshwater: true, wifi: true, fuelFill: true },
    rating: 4.7, reviewCount: 142,
    isFeatured: true,
    primaryPhoto: null,
    operatingHours: { open: '06:00', close: '22:00' },
    contact: { phone: '+971 4 881 1234', whatsapp: '+971 50 881 1234', email: 'jebelali@parkandlaunch.ae' },
    slipways: [{ name: 'Jebel Ali Marina Slipway', coordinates: [55.0201, 24.9973], feeAED: 80 }],
    cameraFeeds: [
      { cameraId: 'JAY_01', label: 'Main Entrance', isActive: true, streamUrl: 'https://www.youtube.com/embed/1EiC9bvVGnk' },
      { cameraId: 'JAY_02', label: 'Boat Storage Row A', isActive: true, streamUrl: 'https://www.youtube.com/embed/1EiC9bvVGnk' },
      { cameraId: 'JAY_03', label: 'Boat Storage Row B', isActive: true, streamUrl: 'https://www.youtube.com/embed/1EiC9bvVGnk' },
    ],
  },
  {
    _id: 'yard_002',
    name: 'Ras Al Khor Dry Yard',
    slug: 'ras-al-khor',
    description: 'Strategically located near the Ras Al Khor Wildlife Sanctuary. Easy access to Dubai Creek and offshore waters.',
    emirate: 'Dubai', area: 'Ras Al Khor',
    address: 'Ras Al Khor Industrial Area, Street 8, Dubai',
    location: { type: 'Point', coordinates: [55.3569, 25.1887] },
    totalSpots: 20, availableSpots: 20, maxBoatLengthFt: 45,
    pricing: { ratePerFootPerMonth: 22, annualDiscountPercent: 15, minimumLengthFt: 15, launchFeePerTrip: 120 },
    services: { powerWash: { available: true, priceAED: 180 }, cctv24h: true, security24h: true, electricHookup: false, freshwater: true },
    rating: 4.5, reviewCount: 89,
    isFeatured: false,
    contact: { phone: '+971 4 338 5678', email: 'raskhor@parkandlaunch.ae' },
    cameraFeeds: [
      { cameraId: 'RAK_01', label: 'Storage Compound', isActive: true, streamUrl: 'https://www.youtube.com/embed/1EiC9bvVGnk' },
    ],
  },
  {
    _id: 'yard_003',
    name: 'Dubai Marina Dry Dock',
    slug: 'dubai-marina',
    description: 'Premium location adjacent to Dubai Marina Mall. Concierge boat prep service and valet trailer assistance.',
    emirate: 'Dubai', area: 'Dubai Marina',
    address: 'Marina Walk Industrial Zone, Dubai Marina, Dubai',
    location: { type: 'Point', coordinates: [55.1404, 25.0774] },
    totalSpots: 18, availableSpots: 3, maxBoatLengthFt: 50,
    pricing: { ratePerFootPerMonth: 28, annualDiscountPercent: 10, minimumLengthFt: 20, launchFeePerTrip: 180 },
    services: { powerWash: { available: true, priceAED: 250 }, cctv24h: true, security24h: true, electricHookup: true, freshwater: true, wifi: true },
    rating: 4.8, reviewCount: 201,
    isFeatured: true,
    contact: { phone: '+971 4 445 9900', whatsapp: '+971 55 445 9900', email: 'marina@parkandlaunch.ae' },
    cameraFeeds: [
      { cameraId: 'DM_01', label: 'Premium Bay', isActive: true, streamUrl: 'https://www.youtube.com/embed/1EiC9bvVGnk' },
      { cameraId: 'DM_02', label: 'Entry Gate', isActive: true, streamUrl: 'https://www.youtube.com/embed/1EiC9bvVGnk' },
    ],
  },
  {
    _id: 'yard_004',
    name: 'Palm Jumeirah Elite Storage',
    slug: 'palm-jumeirah',
    description: 'Ultra-exclusive dry storage on the Palm. White-glove service, dedicated boat manager, and instant slipway access to the Gulf.',
    emirate: 'Dubai', area: 'Palm Jumeirah',
    address: 'Palm Jumeirah North Crescent, Gate 4, Dubai',
    location: { type: 'Point', coordinates: [55.1178, 25.1127] },
    totalSpots: 12, availableSpots: 2, maxBoatLengthFt: 80,
    pricing: { ratePerFootPerMonth: 30, annualDiscountPercent: 10, minimumLengthFt: 20, launchFeePerTrip: 250 },
    services: { powerWash: { available: true, priceAED: 350 }, cctv24h: true, security24h: true, electricHookup: true, freshwater: true, wifi: true, fuelFill: true },
    rating: 4.9, reviewCount: 312,
    isFeatured: true,
    contact: { phone: '+971 4 556 7788', whatsapp: '+971 56 556 7788', email: 'palm@parkandlaunch.ae' },
    cameraFeeds: [
      { cameraId: 'PJ_01', label: 'Elite Bay A', isActive: true, streamUrl: 'https://www.youtube.com/embed/1EiC9bvVGnk' },
      { cameraId: 'PJ_02', label: 'Elite Bay B', isActive: true, streamUrl: 'https://www.youtube.com/embed/1EiC9bvVGnk' },
    ],
  },
  {
    _id: 'yard_005',
    name: 'Sharjah Marine Hub',
    slug: 'sharjah-hub',
    description: 'Cost-effective dry storage in Sharjah with direct creek access. Perfect for smaller vessels and fishing boats.',
    emirate: 'Sharjah', area: 'Sharjah Port',
    address: 'Khalid Port Industrial Zone, Sharjah',
    location: { type: 'Point', coordinates: [55.4119, 25.3572] },
    totalSpots: 30, availableSpots: 18, maxBoatLengthFt: 40,
    pricing: { ratePerFootPerMonth: 15, annualDiscountPercent: 20, minimumLengthFt: 12, launchFeePerTrip: 80 },
    services: { powerWash: { available: true, priceAED: 120 }, cctv24h: true, security24h: false, electricHookup: false, freshwater: true },
    rating: 4.2, reviewCount: 67,
    contact: { phone: '+971 6 544 3322', email: 'sharjah@parkandlaunch.ae' },
    cameraFeeds: [],
  },
  {
    _id: 'yard_006',
    name: 'Abu Dhabi Yacht Club Yard',
    slug: 'abu-dhabi-yc',
    description: 'Prestigious dry storage adjacent to Abu Dhabi Yacht Club. Access to Corniche marina and offshore islands.',
    emirate: 'Abu Dhabi', area: 'Corniche',
    address: 'Abu Dhabi Corniche Road, Breakwater Area, Abu Dhabi',
    location: { type: 'Point', coordinates: [54.3435, 24.4672] },
    totalSpots: 25, availableSpots: 8, maxBoatLengthFt: 70,
    pricing: { ratePerFootPerMonth: 25, annualDiscountPercent: 12, minimumLengthFt: 18, launchFeePerTrip: 200 },
    services: { powerWash: { available: true, priceAED: 280 }, cctv24h: true, security24h: true, electricHookup: true, freshwater: true, wifi: true },
    rating: 4.6, reviewCount: 154,
    isFeatured: true,
    contact: { phone: '+971 2 666 1234', whatsapp: '+971 50 666 1234', email: 'abudhabi@parkandlaunch.ae' },
    cameraFeeds: [
      { cameraId: 'AD_01', label: 'Main Storage', isActive: true, streamUrl: 'https://www.youtube.com/embed/1EiC9bvVGnk' },
    ],
  },
];

export const MOCK_MARINAS = [
  { _id: 'm001', name: 'Dubai Marina Mall Marina', coordinates: [55.1404, 25.0774], pier: 'A', area: 'Dubai Marina', feeAED: 0 },
  { _id: 'm002', name: 'Palm Jumeirah Marina', coordinates: [55.1178, 25.1127], pier: 'B3', area: 'Palm Jumeirah', feeAED: 0 },
  { _id: 'm003', name: 'Deira Creek Slipway', coordinates: [55.3241, 25.2685], pier: 'Public', area: 'Deira', feeAED: 0 },
  { _id: 'm004', name: 'Jumeirah Beach Marina', coordinates: [55.2006, 25.2048], pier: 'C1', area: 'JBR', feeAED: 0 },
  { _id: 'm005', name: 'Festival City Marina', coordinates: [55.3534, 25.2238], pier: 'D', area: 'Festival City', feeAED: 0 },
  { _id: 'm006', name: 'Port Rashid Marina', coordinates: [55.2812, 25.2494], pier: 'Pier 1', area: 'Port Rashid', feeAED: 0 },
  { _id: 'm007', name: 'Ras Al Khor Public Slipway', coordinates: [55.3569, 25.1887], pier: 'Public', area: 'Ras Al Khor', feeAED: 0 },
  { _id: 'm008', name: 'Jebel Ali Marina', coordinates: [55.0201, 24.9973], pier: 'Marina', area: 'Jebel Ali', feeAED: 80 },
  { _id: 'm009', name: 'World Islands Jetty', coordinates: [55.1870, 25.2100], pier: 'Island B', area: 'The World', feeAED: 0 },
  { _id: 'm010', name: 'Jumeirah 1 Beach Launch', coordinates: [55.2200, 25.2300], pier: 'Public', area: 'Jumeirah', feeAED: 0 },
];

export const MOCK_CAPTAINS = [
  {
    _id: 'cap_001',
    name: 'Captain Ahmed Al Mazrouei',
    avatar: null,
    captainProfile: {
      rating: 4.9, totalTrips: 847,
      licenseNumber: 'UAE-CAPT-2018-00234',
      isAvailable: true,
      bio: '20+ years on Arabian Gulf waters. Specialist in deep sea fishing for tuna, kingfish & barracuda. Former Dubai Creek Yacht Club instructor. Speaks Arabic, English & Hindi.',
      vessel: { name: 'Arabian Pearl', vesselType: 'Luxury Speedboat', capacity: 12, length: 38 },
    },
    availableBoats: [
      { _id: 'b_cap001', name: 'Arabian Pearl', type: 'speedboat', dimensions: { lengthFt: 38 }, capacity: { passengers: 12 }, charter: { pricePerHour: 450, pricePerDay: 3200, features: ['GPS Fishfinder', 'Live Bait Tank', 'Fighting Chair', 'Rod Holders x8', 'Cooler Box', 'Life Jackets', 'First Aid'] } }
    ]
  },
  {
    _id: 'cap_002',
    name: 'Captain Khalid Al Suwaidi',
    avatar: null,
    captainProfile: {
      rating: 4.8, totalTrips: 512,
      licenseNumber: 'UAE-CAPT-2019-01876',
      isAvailable: true,
      bio: 'Luxury yacht captain with expertise in sunset cruises and island hopping. Certified by UAE Maritime Authority. Perfect for corporate events and celebrations.',
      vessel: { name: 'Desert Star', vesselType: 'Luxury Yacht', capacity: 20, length: 52 },
    },
    availableBoats: [
      { _id: 'b_cap002', name: 'Desert Star', type: 'yacht', dimensions: { lengthFt: 52 }, capacity: { passengers: 20 }, charter: { pricePerHour: 800, pricePerDay: 5500, features: ['Sun Deck', 'Cabin x2', 'Full Kitchen', 'Sound System', 'BBQ Grill', 'Snorkeling Gear', 'Paddleboards x2'] } }
    ]
  },
  {
    _id: 'cap_003',
    name: 'Captain Saeed Al Falasi',
    avatar: null,
    captainProfile: {
      rating: 4.7, totalTrips: 1203,
      licenseNumber: 'UAE-CAPT-2015-00089',
      isAvailable: true,
      bio: 'Master fisherman with 25 years experience. Knows every fishing spot in UAE waters. Record catches include 180kg yellowfin tuna. Your best bet for serious fishing.',
      vessel: { name: 'Sea Hunter', vesselType: 'Sport Fishing Boat', capacity: 8, length: 42 },
    },
    availableBoats: [
      { _id: 'b_cap003', name: 'Sea Hunter', type: 'fishing_boat', dimensions: { lengthFt: 42 }, capacity: { passengers: 8 }, charter: { pricePerHour: 600, pricePerDay: 4000, features: ['Tournament Rigs x6', 'Outriggers', 'Live Bait Well', 'Downriggers', 'Radar', 'VHF Radio', 'Fighting Chair x2'] } }
    ]
  },
  {
    _id: 'cap_004',
    name: 'Captain Marina Petrov',
    avatar: null,
    captainProfile: {
      rating: 4.9, totalTrips: 389,
      licenseNumber: 'UAE-CAPT-2020-03421',
      isAvailable: false,
      bio: 'First female licensed captain in Dubai. Specializes in romantic sunset cruises, bachelorette parties, and ladies-only experiences. Photographer onboard for memories.',
      vessel: { name: 'Golden Hour', vesselType: 'Catamaran', capacity: 15, length: 45 },
    },
    availableBoats: [
      { _id: 'b_cap004', name: 'Golden Hour', type: 'catamaran', dimensions: { lengthFt: 45 }, capacity: { passengers: 15 }, charter: { pricePerHour: 700, pricePerDay: 4800, features: ['Twin Hulls', 'Trampoline Net', 'Swim Platform', 'Hammocks x4', 'Kayaks x2', 'Snorkel Sets x15', 'Speaker System'] } }
    ]
  },
  {
    _id: 'cap_005',
    name: 'Captain Ravi Krishnamurthy',
    avatar: null,
    captainProfile: {
      rating: 4.6, totalTrips: 678,
      licenseNumber: 'UAE-CAPT-2017-02156',
      isAvailable: true,
      bio: 'Experienced offshore captain. Expert in World Islands exploration and overnight desert island camping trips. Safety first — fully STCW certified.',
      vessel: { name: 'Island Hopper', vesselType: 'Center Console', capacity: 10, length: 35 },
    },
    availableBoats: [
      { _id: 'b_cap005', name: 'Island Hopper', type: 'speedboat', dimensions: { lengthFt: 35 }, capacity: { passengers: 10 }, charter: { pricePerHour: 380, pricePerDay: 2600, features: ['Center Console', 'Shade Canopy', 'Swim Ladder', 'Anchor x2', 'Flares', 'Life Jackets x12', 'Cooler Boxes'] } }
    ]
  },
];

export const MOCK_PRODUCTS = [
  // Electronics
  { _id: 'p001', name: 'Garmin STRIKER Plus 5cv Fish Finder', category: 'electronics', brand: 'Garmin', description: 'Built-in GPS with ClearVü scanning sonar. CHIRP traditional sonar, GPS with a built-in worldwide basemap. Perfect for UAE Gulf waters. Includes dual-beam transducer.', price: 1299, compareAtPrice: 1599, stock: 15, rating: 4.8, reviewCount: 234, isFeatured: true, isActive: true, primaryImage: 'https://via.placeholder.com/300x200/1a3a5c/C9A84C?text=Fish+Finder' },
  { _id: 'p002', name: 'Garmin ECHOMAP UHD2 9-inch Chartplotter', category: 'electronics', brand: 'Garmin', description: 'Preloaded BlueChart g3 coastal charts for UAE waters. Ultra HD Clear Vu and SideVu scanning sonar. 9-inch display with touchscreen and keypad.', price: 4200, compareAtPrice: 5000, stock: 8, rating: 4.9, reviewCount: 87, isFeatured: true, isActive: true, primaryImage: 'https://via.placeholder.com/300x200/1a3a5c/C9A84C?text=Chartplotter' },
  { _id: 'p003', name: 'Standard Horizon Matrix GX1400G VHF Radio', category: 'electronics', brand: 'Standard Horizon', description: 'Built-in GPS with NMEA 2000 connectivity. Floating design, IPX8 waterproof. 25W output with Class D DSC. Essential safety equipment for all UAE vessels.', price: 890, stock: 22, rating: 4.7, reviewCount: 156, isActive: true },
  { _id: 'p004', name: 'Simrad NSS9 evo3S Multifunction Display', category: 'electronics', brand: 'Simrad', description: 'SolarMAX HD display with TotalScan transducer. Built-in 4G radar support. C-MAP charts for Arabian Gulf. Professional grade.',price: 6800, stock: 5, rating: 4.8, reviewCount: 43, isActive: true },

  // Fishing Equipment
  { _id: 'p005', name: 'Shimano Stella SWC 20000 HG Reel', category: 'fishing_equipment', brand: 'Shimano', description: 'The pinnacle of Shimano engineering. HAGANE gear, X-Ship, X-Rigid body. Perfect for UAE big game fishing — tuna, billfish, GT. Built for the demanding conditions of the Arabian Gulf.', price: 3200, compareAtPrice: 3800, stock: 12, rating: 4.9, reviewCount: 198, isFeatured: true, isActive: true },
  { _id: 'p006', name: 'Penn International 50VSW Two-Speed Reel', category: 'fishing_equipment', brand: 'Penn', description: 'Legendary offshore reel for the biggest game fish. Full metal body, Versa-drag system. Used by top UAE tournament anglers. 50lb drag capacity.', price: 2100, stock: 8, rating: 4.8, reviewCount: 134, isActive: true },
  { _id: 'p007', name: 'Daiwa Saltiga 10000H Spinning Reel', category: 'fishing_equipment', brand: 'Daiwa', description: 'Supreme long-cast spinning reel for GT and offshore species. Magsealed bearings prevent saltwater intrusion. 25lb drag, 10000 size.', price: 2850, stock: 10, rating: 4.7, reviewCount: 89, isActive: true },
  { _id: 'p008', name: 'Mustad Ultrapoint KVD Elite Triple Grip Hooks (25pk)', category: 'fishing_equipment', brand: 'Mustad', description: 'KVD signature series treble hooks. Ultra sharp Ultrapoint technology. Sizes 1-6, perfect for UAE lure fishing for kingfish and trevally.', price: 125, stock: 200, rating: 4.6, reviewCount: 445, isActive: true },
  { _id: 'p009', name: 'Abu Garcia Veritas 3.0 Spinning Rod 7ft', category: 'fishing_equipment', brand: 'Abu Garcia', description: 'High-modulus graphite blank with titanium guides. Lightweight yet powerful. Ideal for UAE inshore fishing for barracuda, snapper and trevally.', price: 680, stock: 18, rating: 4.5, reviewCount: 167, isActive: true },

  // Safety
  { _id: 'p010', name: 'Plastimo Offshore 275 Automatic Life Jacket', category: 'life_jackets', brand: 'Plastimo', description: 'UAE ADNOC approved 275N automatic inflatable life jacket. Harness attachment, crotch strap, spray hood. Mandatory for all UAE offshore passages.', price: 420, stock: 35, rating: 4.9, reviewCount: 312, isFeatured: true, isActive: true },
  { _id: 'p011', name: 'Ocean Signal RescueME EPIRB2 with GPS', category: 'safety', brand: 'Ocean Signal', description: 'Category 1 automatic EPIRB with built-in GPS. 406MHz signal detectable by COSPAS-SARSAT satellite. UAE Maritime Authority approved. 5-year battery.', price: 1850, stock: 14, rating: 4.9, reviewCount: 78, isActive: true },
  { _id: 'p012', name: 'Icom IC-M510 Fixed Mount VHF with AIS', category: 'safety', brand: 'Icom', description: 'Class D DSC controller with built-in AIS receiver. NMEA 2000 connectivity, 25W output. Waterproof IPX7. Essential safety equipment for UAE waters.', price: 1450, stock: 20, rating: 4.8, reviewCount: 92, isActive: true },

  // Anchoring
  { _id: 'p013', name: 'Rocna Original 20kg Anchor', category: 'anchoring', brand: 'Rocna', description: 'Rolls Royce of anchors. Auto-launch design, high-strength steel. Sets instantly in UAE sandy seabed. Trusted by UAE marina professionals.', price: 890, stock: 25, rating: 4.9, reviewCount: 201, isActive: true },
  { _id: 'p014', name: 'Mantus Marine M1 Anchor 25kg Galvanized', category: 'anchoring', brand: 'Mantus', description: 'Ultra-high holding power for UAE conditions. Perfect for sandy and rocky bottom mix. Rolls for easy storage. Includes shackle.', price: 1100, stock: 15, rating: 4.8, reviewCount: 134, isActive: true },

  // Cleaning
  { _id: 'p015', name: 'Star Brite Premium Marine Polish with PTEF 16oz', category: 'cleaning_supplies', brand: 'Star Brite', description: 'Removes oxidation and restores gel coat shine. UV protectant with PTEF polymer. Essential for UAE boats exposed to intense sun and salt.', price: 145, stock: 80, rating: 4.7, reviewCount: 389, isActive: true },
  { _id: 'p016', name: 'Meguiars M6332 Marine All Season Vinyl & Rubber Cleaner (32oz)', category: 'cleaning_supplies', brand: "Meguiar's", description: 'Professional grade cleaner for all vinyl surfaces. UV protection prevents cracking in UAE heat. Safe on all boat surfaces.', price: 85, stock: 120, rating: 4.6, reviewCount: 267, isActive: true },

  // Bait
  { _id: 'p017', name: 'Fresh Live Sardines — 1kg Pack', category: 'bait', description: 'Freshest live sardines caught daily from UAE Gulf waters. Best bait for kingfish, tuna, and barracuda. Kept in oxygenated seawater.', price: 45, stock: 999, rating: 4.9, reviewCount: 567, isActive: true },
  { _id: 'p018', name: 'Fresh Tiger Prawns — 500g', category: 'bait', description: 'Premium tiger prawns for bottom fishing. Excellent for snapper, grouper, and emperor fish in UAE reef areas.', price: 65, stock: 500, rating: 4.8, reviewCount: 423, isActive: true },
  { _id: 'p019', name: 'Nomad Design DTX Minnow 220 Hardbody Lure', category: 'bait', brand: 'Nomad Design', description: 'World-renowned lure for GT, tuna and mahi-mahi. Internal rattle chamber. Holographic finish. UAE tournament proven. 220mm 155g.', price: 280, stock: 45, rating: 4.9, reviewCount: 312, isActive: true },
  { _id: 'p020', name: 'Shimano Butterfly Flat Fall Jig 150g Gold', category: 'bait', brand: 'Shimano', description: 'Deadly flutter jig for UAE deep water fishing. Gold finish for maximum flash in deeper waters. Perfect for amberjack and yellowfin.', price: 95, stock: 80, rating: 4.8, reviewCount: 234, isActive: true },

  // Navigation
  { _id: 'p021', name: 'Suunto D5 Dive Computer with USB', category: 'navigation', brand: 'Suunto', description: 'Full-color display dive computer with air integration. Freediving mode, built-in compass. Water resistant to 100m. Perfect for UAE snorkeling and diving.', price: 2200, compareAtPrice: 2600, stock: 12, rating: 4.8, reviewCount: 156, isFeatured: true, isActive: true },
  { _id: 'p022', name: 'Navionics+ UAE Waters Chart Card', category: 'navigation', brand: 'Navionics', description: 'Detailed charts for all UAE coastal waters, ports, and marinas. SonarChart Live update capability. Compatible with Garmin, Lowrance, Simrad, Humminbird.', price: 450, stock: 30, rating: 4.7, reviewCount: 198, isActive: true },

  // Deck Hardware
  { _id: 'p023', name: 'Lewmar Ocean 40 Self-Tailing Winch', category: 'deck_hardware', brand: 'Lewmar', description: '2-speed self-tailing winch. Chrome bronze finish. Suitable for UAE sailing yachts and large motor vessels. 500kg one-speed load.', price: 3200, stock: 8, rating: 4.8, reviewCount: 67, isActive: true },
  { _id: 'p024', name: 'Fender Buoy 6-inch White (Set of 4)', category: 'deck_hardware', brand: 'Taylor Made', description: 'Heavy-duty marine fenders for dock protection. UV-resistant PVC. Pre-rigged with heavy-duty rope. Essential for all UAE marina berths.', price: 180, stock: 60, rating: 4.6, reviewCount: 234, isActive: true },

  // Electrical
  { _id: 'p025', name: 'Victron Energy SmartSolar MPPT 100/30 Solar Controller', category: 'electrical', brand: 'Victron Energy', description: 'Bluetooth programmable solar charge controller. Perfect for UAE liveaboards and long-range cruisers. Max 30A charge current, 12/24V auto-select.', price: 680, stock: 20, rating: 4.9, reviewCount: 145, isActive: true },
];

export const MOCK_BOOKINGS = [
  {
    _id: 'bk_001',
    bookingRef: 'PL1A2B3C4D',
    yard: { _id: 'yard_001', name: 'Jebel Ali Marine Yard', area: 'Jebel Ali', emirate: 'Dubai' },
    boat: { name: 'Blue Falcon', type: 'speedboat', dimensions: { lengthFt: 33 }, primaryPhoto: null },
    planType: 'monthly',
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    spotNumber: 'A-07',
    pricing: { boatLengthFt: 33, ratePerFootPerMonth: 20, grandTotal: 726, currency: 'AED' },
    autoRenew: true,
    daysRemaining: 15,
  },
  {
    _id: 'bk_002',
    bookingRef: 'PL9X8Y7Z6W',
    yard: { _id: 'yard_004', name: 'Palm Jumeirah Elite Storage', area: 'Palm Jumeirah', emirate: 'Dubai' },
    boat: { name: 'Desert Wind', type: 'yacht', dimensions: { lengthFt: 45 }, primaryPhoto: null },
    planType: 'annual',
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    spotNumber: 'VIP-02',
    pricing: { boatLengthFt: 45, ratePerFootPerMonth: 30, grandTotal: 17010, currency: 'AED' },
    autoRenew: true,
    daysRemaining: 275,
  },
];

export const MOCK_DELIVERIES = [
  {
    _id: 'dlv_001',
    deliveryRef: 'DLV1A2B3C4',
    status: 'in_transit',
    boat: { name: 'Blue Falcon', type: 'speedboat', primaryPhoto: null },
    origin: { name: 'Jebel Ali Marine Yard', address: 'Jebel Ali Port, Dubai', location: { coordinates: [55.0272, 24.9985] } },
    destination: { name: 'Dubai Marina Mall Marina', address: 'Marina Walk, Dubai Marina', location: { coordinates: [55.1404, 25.0774] } },
    scheduledDate: new Date().toISOString(),
    scheduledTime: '14:30',
    driver: { name: 'Mohammed Al Rashid', phone: '+971 50 999 1234', rating: 4.8 },
    currentLocation: { lat: 25.0450, lng: 55.0800, updatedAt: new Date().toISOString(), speed: 45 },
    pricing: { totalAmount: 150, currency: 'AED' },
    estimatedRoute: { distanceKm: 28.5, durationMins: 45 },
  }
];

export const MOCK_CHARTER_PACKAGES = [
  { id: 'fishing', type: 'fishing', title: 'Deep Sea Fishing', description: 'Full-day fishing experience in the Arabian Gulf. Target species: Yellowfin Tuna, Kingfish, Barracuda, GT, Mahi-Mahi.', durationOptions: [4, 6, 8, 12], pricePerHour: { min: 450, max: 800 }, includes: ['Licensed Captain & Crew', 'All Fishing Equipment', 'Live Bait & Lures', 'Ice Box & Fish Cleaning', 'Life Jackets', 'UAE Maritime Approved Vessel', 'Soft Drinks'], maxPassengers: 8, popular: true },
  { id: 'sunset_cruise', type: 'sunset_cruise', title: 'Sunset Luxury Cruise', description: 'Spectacular sunset cruise along Dubai Marina skyline and Palm Jumeirah. Champagne and canapés included.', durationOptions: [2, 3], pricePerHour: { min: 600, max: 1200 }, includes: ['Licensed Captain', 'Champagne & Canapés', 'Professional Photographer', 'Bluetooth Sound System', 'Branded Towels', 'Life Jackets'], maxPassengers: 15, popular: true },
  { id: 'island_hopping', type: 'island_hopping', title: 'World Islands Explorer', description: 'Exclusive tour of Dubai\'s World Islands. Snorkeling, sandbar picnic, and island exploration.', durationOptions: [4, 6, 8], pricePerHour: { min: 500, max: 900 }, includes: ['Licensed Captain & Crew', 'Full Snorkel Gear Set', 'BBQ Setup & Picnic', 'Kayaks & Paddleboards', 'Underwater GoPro', 'Refreshments'], maxPassengers: 12, popular: false },
  { id: 'corporate', type: 'corporate', title: 'Corporate Charter', description: 'Impress clients with a luxury corporate event on the Arabian Gulf. Fully branded experience available.', durationOptions: [4, 6, 8], pricePerHour: { min: 1200, max: 3000 }, includes: ['Captain & Full Crew', 'Gourmet Catering', 'AV & PA System', 'Custom Branding', 'Professional Photographer', 'Premium Bar Service', 'Dedicated Event Host'], maxPassengers: 40, popular: false },
  { id: 'fishing_tournament', type: 'fishing', title: 'Tournament Fishing', description: 'Full tournament setup with competition-grade equipment. GPS tracking, weigh-in station, trophy ceremony.', durationOptions: [8, 12], pricePerHour: { min: 700, max: 1000 }, includes: ['Tournament Captain', 'Competition Rigs x6', 'Live Bait Tank', 'Fighting Chairs x2', 'Satellite Tracking', 'Weigh Station', 'Tournament Certificate'], maxPassengers: 6, popular: false },
];

export const MOCK_NOTIFICATIONS = [
  { _id: 'n001', type: 'booking_expiring', title: 'Parking Expires in 15 Days', message: 'Your parking at Jebel Ali Marine Yard expires on Apr 20. Renew now to keep your spot.', isRead: false, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), priority: 'high', actionUrl: '/parking/bookings/bk_001' },
  { _id: 'n002', type: 'delivery_started', title: 'Boat Delivery En Route', message: 'Your boat "Blue Falcon" has been loaded and is on the way to Dubai Marina. ETA: 45 minutes.', isRead: false, createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), priority: 'high' },
  { _id: 'n003', type: 'boat_parked_1month', title: 'Blue Falcon — 1 Month Milestone', message: 'Your vessel has been safely stored at Jebel Ali Marine Yard for 1 month. View live camera feed.', isRead: true, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), priority: 'normal' },
  { _id: 'n004', type: 'weather_alert', title: '⚠️ Marine Weather Advisory', message: 'Winds expected 25-30 knots tomorrow in Dubai waters. Exercise caution for vessels under 30ft.', isRead: true, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), priority: 'high' },
  { _id: 'n005', type: 'charter_confirmed', title: 'Charter Confirmed — June 15', message: 'Your fishing charter with Captain Ahmed Al Mazrouei has been confirmed for June 15 at 05:30.', isRead: true, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), priority: 'normal' },
  { _id: 'n006', type: 'order_delivered', title: 'Order #ORD1A2B Delivered', message: 'Your Garmin STRIKER Plus Fish Finder has been delivered to Dubai Marina Mall Marina.', isRead: true, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), priority: 'normal' },
  { _id: 'n007', type: 'promotion', title: '🎉 Eid Special — 20% Off Annual Parking', message: 'Book an annual parking plan before April 30 and save 20%. Limited spots at Palm Jumeirah.', isRead: true, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), priority: 'low' },
];

export const MOCK_ORDERS = [
  {
    _id: 'ord_001',
    orderRef: 'ORD1A2B3C4',
    status: 'delivered',
    items: [
      { name: 'Garmin STRIKER Plus 5cv Fish Finder', quantity: 1, unitPrice: 1299, image: null },
      { name: 'Fresh Live Sardines 1kg Pack', quantity: 3, unitPrice: 45, image: null },
    ],
    pricing: { subtotal: 1434, shippingFee: 0, taxAmount: 71.7, totalAmount: 1505.7, currency: 'AED' },
    deliveredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'ord_002',
    orderRef: 'ORD5E6F7G8',
    status: 'shipped',
    items: [
      { name: 'Plastimo Offshore 275 Auto Life Jacket', quantity: 2, unitPrice: 420, image: null },
      { name: 'Rocna Original 20kg Anchor', quantity: 1, unitPrice: 890, image: null },
    ],
    pricing: { subtotal: 1730, shippingFee: 0, taxAmount: 86.5, totalAmount: 1816.5, currency: 'AED' },
    trackingNumber: 'DHL-AE-9876543210',
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_BOATS = [
  {
    _id: 'boat_001',
    name: 'Blue Falcon',
    registrationNumber: 'DXB-2019-00847',
    type: 'speedboat',
    make: 'Sealine', model: 'S330', year: 2019, color: 'White/Blue',
    dimensions: { lengthFt: 33, beamFt: 10.5, draftFt: 2.8 },
    engine: { make: 'Volvo Penta', horsepower: 300, fuelType: 'gasoline', numberOfEngines: 2 },
    capacity: { passengers: 8, fuelLiters: 400 },
    status: 'in_yard',
    currentParking: { yardName: 'Jebel Ali Marine Yard', spotNumber: 'A-07', cameraId: 'JAY_02', parkedSince: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
    fuelLevel: 75,
    estimatedMonthlyParking: 660,
    charter: { isAvailable: false },
  },
  {
    _id: 'boat_002',
    name: 'Desert Wind',
    registrationNumber: 'DXB-2021-01234',
    type: 'yacht',
    make: 'Princess', model: 'V45', year: 2021, color: 'White',
    dimensions: { lengthFt: 45, beamFt: 14, draftFt: 3.5 },
    engine: { make: 'MAN', horsepower: 480, fuelType: 'diesel', numberOfEngines: 2 },
    capacity: { passengers: 12, fuelLiters: 800 },
    status: 'in_water',
    fuelLevel: 45,
    estimatedMonthlyParking: 1350,
    charter: { isAvailable: true, pricePerHour: 800 },
  },
];

export const MOCK_WEATHER = {
  location: 'Dubai, UAE',
  current: {
    temp: 34, feelsLike: 39, humidity: 62,
    windSpeed: 18, windDirection: 'NNW',
    waveHeight: 0.9, visibility: 12,
    condition: 'Sunny', conditionCode: 'clear-day',
    uvIndex: 9, pressure: 1008,
    seaTemp: 30,
    marineConditions: 'Good — Suitable for most vessels',
    safetyLevel: 'green',
    sunrise: '05:47', sunset: '19:08',
  },
  forecast: [
    { day: 'Today', tempHigh: 37, tempLow: 27, waveHeight: 0.9, windSpeed: 18, condition: 'Sunny', safetyLevel: 'green' },
    { day: 'Tomorrow', tempHigh: 36, tempLow: 26, waveHeight: 1.3, windSpeed: 22, condition: 'Partly Cloudy', safetyLevel: 'green' },
    { day: 'Wednesday', tempHigh: 35, tempLow: 25, waveHeight: 1.8, windSpeed: 28, condition: 'Breezy', safetyLevel: 'yellow' },
    { day: 'Thursday', tempHigh: 38, tempLow: 28, waveHeight: 0.7, windSpeed: 14, condition: 'Sunny', safetyLevel: 'green' },
    { day: 'Friday', tempHigh: 39, tempLow: 29, waveHeight: 1.0, windSpeed: 16, condition: 'Sunny', safetyLevel: 'green' },
  ],
  tides: [
    { time: '04:15', type: 'Low', heightM: 0.3 },
    { time: '10:30', type: 'High', heightM: 2.2 },
    { time: '16:45', type: 'Low', heightM: 0.4 },
    { time: '23:00', type: 'High', heightM: 1.8 },
  ],
  bestFishingTimes: ['05:00 – 07:30', '17:30 – 20:00'],
  marineAlerts: [],
};
