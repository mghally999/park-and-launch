# 🚢 Park & Launch — Marine Super App
### Production-Grade React Native + Node.js Marine Services Platform

---

## 🏗 Architecture Overview

```
park-and-launch/
├── backend/                    # Node.js + Express + MongoDB
│   └── src/
│       ├── config/             # DB connection, env
│       ├── middleware/         # Auth (JWT+LRU), rate limiting, error handling
│       ├── models/             # Mongoose models with geospatial indexes
│       ├── controllers/        # Business logic (parking, delivery, charter, marketplace)
│       ├── routes/             # RESTful API routes
│       ├── services/           # Socket.io, scheduler, notifications
│       └── utils/              # Data structures, JWT, logger, seeder
└── mobile/                     # React Native + Expo
    └── src/
        ├── api/                # Axios client with auto-refresh
        ├── components/         # Reusable UI components
        ├── hooks/              # useSocket (real-time GPS)
        ├── navigation/         # Stack + Tab navigators
        ├── screens/            # All 30+ screens
        ├── store/              # Redux Toolkit + persist
        └── theme/              # 3 luxury themes
```

---

## ⚡ Data Structures & Algorithms

| Structure | Use Case | Time Complexity |
|-----------|----------|-----------------|
| **LRU Cache** (HashMap + DLL) | Parking spot caching | O(1) get/put |
| **Min-Heap** (Binary Heap) | Delivery scheduling queue | O(log n) insert/extract |
| **Trie** (Prefix Tree) | Product search autocomplete | O(m) search |
| **GeoHash Index** (HashMap) | Nearest yard/driver lookup | O(1) avg |
| **Circular Buffer** | GPS trail (max 200 points) | O(1) push/read |
| **Segment Tree** | Availability calendar queries | O(log n) range |
| **2dsphere Index** (MongoDB) | Geospatial yard queries | O(log n) |
| **B-Tree** (MongoDB indexes) | All DB queries | O(log n) |

---

## 🌐 API Endpoints (Complete Reference)

### Authentication — `/api/v1/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create account |
| POST | `/login` | Login → returns JWT |
| POST | `/logout` | Revoke session |
| POST | `/refresh-token` | Refresh access token |
| POST | `/verify-otp` | Verify phone OTP |
| POST | `/resend-otp` | Resend OTP (60s cooldown) |
| POST | `/forgot-password` | Send reset code |
| POST | `/reset-password` | Reset with code |
| PUT | `/change-password` | Change password (auth) |
| GET | `/me` | Get current user |

### Parking — `/api/v1/parking`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/yards` | List yards (filters: emirate, price, location radius) |
| GET | `/yards/:id` | Yard detail with camera feeds |
| GET | `/yards/:id/availability` | Real-time spot count |
| POST | `/calculate-price` | Pricing + competitor comparison |
| POST | `/book` | Create booking (monthly/quarterly/annual) |
| GET | `/bookings` | My bookings (filter by status) |
| PUT | `/bookings/:id/cancel` | Cancel + release spot |
| GET | `/camera/:bookingId` | CCTV feed URLs |

### Boats — `/api/v1/boats`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | My vessels |
| POST | `/` | Add vessel |
| PUT | `/:id` | Update vessel |
| DELETE | `/:id` | Remove vessel |
| POST | `/:id/condition` | Log condition report |

### Delivery — `/api/v1/delivery`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/marinas` | Popular Dubai marinas list |
| POST | `/schedule` | Schedule delivery (2hr min advance) |
| GET | `/history` | Delivery history |
| GET | `/:id/track` | Real-time delivery tracking |
| POST | `/:id/location` | Driver GPS update (Socket.io) |
| PUT | `/:id/status` | Update delivery status |
| GET | `/queue` | Admin: delivery priority queue |

### Charter — `/api/v1/charter`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/captains` | Available licensed captains |
| GET | `/packages` | Trip types & pricing |
| POST | `/book` | Book charter (Uber-style) |
| GET | `/bookings` | My charter history |
| GET | `/bookings/:id/track` | Live charter GPS |
| PUT | `/bookings/:id/respond` | Captain accept/reject |
| POST | `/bookings/:id/rate` | Rate completed charter |

### Marketplace — `/api/v1/marketplace`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Products (Trie search, filters) |
| GET | `/categories` | Product categories |
| GET | `/products/:id` | Product detail |
| POST | `/products/:id/review` | Add review |
| POST | `/orders` | Create order |
| GET | `/orders` | My orders |

### Services — `/api/v1/services`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cleaning` | Cleaning packages |
| POST | `/cleaning/book` | Book cleaning |
| GET | `/equipment` | Fishing equipment & bait |

### Weather — `/api/v1/weather`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/marine` | Weather, tides, marine conditions |

### Users — `/api/v1/users`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Full profile |
| PUT | `/profile` | Update profile |
| PUT | `/theme` | Switch theme |
| GET | `/notifications` | Get notifications |
| PUT | `/notifications/:id/read` | Mark read |

### Admin — `/api/v1/admin` (auth required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | All users |
| POST | `/yards` | Create parking yard |
| PUT | `/yards/:id` | Update yard |
| GET | `/bookings` | All bookings |
| GET | `/analytics/dashboard` | Revenue & stats |

---

## 🔌 Real-Time WebSocket Events (Socket.io)

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join_delivery` | `deliveryId` | Subscribe to delivery tracking |
| `leave_delivery` | `deliveryId` | Unsubscribe |
| `join_charter` | `charterId` | Subscribe to charter tracking |
| `charter_location` | `{charterId, lat, lng}` | Captain broadcasts location |
| `driver_location` | `{deliveryId, lat, lng}` | Driver updates position |
| `join_camera_feed` | `{bookingId, cameraId}` | Subscribe to CCTV feed |

### Server → Client
| Event | Description |
|-------|-------------|
| `notification` | Push notification payload |
| `delivery_status` | Delivery status update |
| `location_update` | Driver/boat GPS coordinate |
| `charter_location_update` | Charter vessel position |
| `new_booking_request` | Captain: new charter request |
| `booking_response` | User: captain accepted/declined |
| `camera_frame` | Periodic CCTV snapshot |

---

## 🎨 3 Luxury Themes

| Theme | Style | Background | Accent | Dark |
|-------|-------|-----------|--------|------|
| **Deep Ocean** | Classic nautical luxury | `#020B18` Navy | `#C9A84C` Gold | ✓ |
| **Pearl Harbor** | Champagne light elegance | `#F5F2EC` Ivory | `#8B6914` Deep Gold | ✗ |
| **Midnight Marina** | Ultra-modern noir | `#000000` Black | `#00D4FF` Electric Cyan | ✓ |

---

## 🚀 Quick Start

### Backend
```bash
cd backend
cp .env.example .env       # Configure all env variables
npm install
node src/utils/seeder.js   # Seed UAE parking yards + test data
npm run dev                # Start on :5000

# Test credentials after seeding:
# Admin:   admin@parkandlaunch.ae / Admin@PL2025!
# User:    ahmed@example.ae / Test@1234!
# Captain: captain.khalid@example.ae / Captain@1234!
```

### Mobile
```bash
cd mobile
npm install
npx expo start             # Scan QR with Expo Go
npx expo run:ios           # iOS Simulator
npx expo run:android       # Android Emulator
```

### Production Build
```bash
npm install -g eas-cli
eas login
eas build --platform ios       # App Store build
eas build --platform android   # Play Store build
eas submit --platform ios      # Submit to App Store
eas submit --platform android  # Submit to Play Store
```

---

## 🔒 Security Measures

- **JWT** access tokens (7d) + refresh tokens (30d) with rotation
- **LRU Cache** for session validation — O(1) auth checks
- **bcrypt** (12 rounds) password hashing
- **Rate limiting** — 100 req/15min general, 10 req/15min auth
- **Helmet.js** — 15 security HTTP headers
- **CORS** — Origin whitelisting
- **MongoSanitize** — NoSQL injection prevention
- **XSS Clean** — Cross-site scripting sanitization
- **HPP** — HTTP Parameter Pollution prevention
- **Account lockout** — 5 failed attempts → 2hr lockout
- **HttpOnly cookies** for refresh tokens (XSS proof)
- **Signed camera URLs** — Time-limited CCTV access tokens
- **Input validation** — express-validator on all routes
- **HTTPS-only** in production

---

## 📦 External API Integrations

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **Google Maps** | GPS, maps, routing | $200/month credit |
| **OpenWeather** | Marine weather | 60 calls/min |
| **WorldTides** | Tide data | Limited free |
| **Stripe** | Payments | 2.9% + 30¢ per txn |
| **Twilio** | SMS OTP | $15 free credit |
| **Firebase** | Push notifications | Generous free tier |
| **AWS S3** | Media storage | 5GB free |
| **Socket.io** | Real-time GPS | Self-hosted |

### Real CCTV Integration (Placeholder)
```
BASE_URL: https://cameras.parkandlaunch.ae/api
GET  /stream/{cameraId}?token={signedToken}   → HLS video stream
GET  /snapshot/{cameraId}                      → JPEG thumbnail
POST /subscribe/{cameraId}                     → Webhook registration
```

---

## 💡 Feature List (60+ features)

### 🅿️ Marine Dry Parking
- Find yards by emirate, price, distance, availability
- Per-foot-per-month pricing (20–25 AED vs 67 AED competitor)
- Monthly, quarterly, annual plans with discounts
- Real-time spot availability (Segment Tree + GeoHash)
- Pricing calculator with competitor savings comparison
- Auto-renewal with 7/3 day reminders
- Spot assignment and row mapping
- Booking cancellation with refund policy

### 🚛 Park & Launch Delivery
- Schedule yard→slipway/marina delivery (2hr advance)
- MinHeap priority scheduling queue
- Real-time GPS tracking via Socket.io
- Driver location broadcasting (GeoHash index)
- Pre/post delivery condition photo logs
- Status timeline (9 stages)
- Insurance photo documentation
- Multiple marina destinations
- ETA calculation

### 🎣 Charter (Uber for Fishing)
- Captain discovery with ratings, trip count, vessel info
- 5 charter types: fishing, sunset cruise, island hopping, leisure, corporate
- Real-time booking with captain accept/decline
- Live charter GPS tracking
- Fishing catch logging with photos
- Add-ons: equipment, bait, ice boxes, tackle
- Post-trip rating system
- Captain earnings tracking

### 🛒 Marine Marketplace
- 12+ product categories
- Trie-powered search autocomplete O(m)
- Product reviews with verified purchase badge
- Stock management (atomic decrements)
- Promo codes
- Order tracking (7 status stages)
- Delivery to marina or address

### 📷 Camera & Security
- 24/7 CCTV feed access from app
- Signed, time-limited stream URLs
- Per-spot camera mapping
- Multiple camera angles per yard
- Real-time alerts

### 🌊 Marine Intelligence
- Live marine weather (OpenWeather)
- Wave height, wind speed, visibility
- Safety level indicator (green/yellow/red)
- 5-day marine forecast
- Tide schedule (4 tides/day)
- Best fishing time recommendations
- Sunrise/sunset times
- Sea temperature

### 🛥️ Vessel Management
- Multi-boat profile management
- Full spec sheets (dimensions, engine, fuel)
- Document storage (registration, insurance)
- Maintenance log
- Condition reports (pre/post tow photos)
- Charter marketplace toggle
- Fuel level tracking (yard staff)
- Charter earnings tracking

### 🔔 Smart Notifications
- Booking expiry alerts (7 & 3 days)
- Monthly parking milestone ("parked 3 months")
- Delivery status pushes
- Charter confirmation/reminders
- Weather alerts
- Payment receipts
- Camera security alerts
- Auto-renewal confirmations

### 👤 User & Account
- Multi-device JWT sessions
- Phone OTP verification (Twilio)
- Account lockout protection
- Loyalty points system
- Wallet balance
- Referral codes
- 3 theme preferences (synced to backend)
- Subscription plans (Free/Basic/Premium/Elite)

### 🛁 Boat Services
- 4 cleaning packages (Basic → Premium Spa)
- Anti-fouling bottom paint
- Fishing equipment rental
- Fresh bait delivery to yard
- Safety equipment rental

---

## 🏛 Seeded UAE Locations

| Yard | Area | Spots | Rate (AED/ft/mo) | Rating |
|------|------|-------|------------------|--------|
| Jebel Ali Marine Yard | Jebel Ali | 45 | 20 | 4.7 ★ |
| Ras Al Khor Dry Yard | Ras Al Khor | 20 | 22 | 4.5 ★ |
| Deira Marine Storage | Deira | 15 | 23 | 4.3 ★ |
| Palm Jumeirah Premium | Palm Jumeirah | 12 | 25 | 4.9 ★ |

**Savings Example — 30ft Boat:**
- Dubai Creek Golf & Yacht Club: 67 × 30 = **2,010 AED/month**
- Park & Launch (Jebel Ali): 20 × 30 = **600 AED/month**
- **Savings: 1,410 AED/month (70% less)**

---

*Built for the Park & Launch marine super app — UAE 2025*
