<p align="center">
  <img src="./client/src/assets/hero.png" alt="Traveloop Logo" width="100" />
</p>

<h1 align="center">Traveloop</h1>

<p align="center">
  <b>AI-Powered Travel Planning & Collaborative Itinerary Builder for Incredible India</b>
</p>

<p align="center">
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react" alt="React"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-Backend-339933?style=flat&logo=nodedotjs" alt="Node.js"></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat&logo=postgresql" alt="PostgreSQL"></a>
  <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat&logo=prisma" alt="Prisma"></a>
  <a href="https://openrouter.ai/"><img src="https://img.shields.io/badge/AI-OpenRouter_API-6C63FF?style=flat&logo=openai" alt="OpenRouter AI"></a>
  <a href="https://socket.io/"><img src="https://img.shields.io/badge/Realtime-Socket.io-010101?style=flat&logo=socketdotio" alt="Socket.io"></a>
  <img src="https://img.shields.io/badge/Design-Neumorphic-E0E5EC?style=flat&color=6C63FF" alt="Neumorphic">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat" alt="MIT License">
</p>

<p align="center">
  A comprehensive, visually stunning platform designed to simplify the complexity of planning multi-city Indian travel. Experience tactile Neumorphic design, intelligent AI assistance, and real-time multiplayer collaboration — all in one place.
</p>

---

## 📸 Screenshots

<table>
  <tr>
    <td align="center"><b>🔐 Login</b></td>
    <td align="center"><b>🏠 Dashboard</b></td>
    <td align="center"><b>✈️ My Trips</b></td>
  </tr>
  <tr>
    <td><img src="./screenshots/login.png" alt="Login Page" width="100%"/></td>
    <td><img src="./screenshots/dashboard.png" alt="Dashboard" width="100%"/></td>
    <td><img src="./screenshots/trips.png" alt="My Trips" width="100%"/></td>
  </tr>
  <tr>
    <td align="center"><b>🗺️ Create Trip</b></td>
    <td align="center"><b>👥 Community</b></td>
    <td align="center"><b>👤 Profile</b></td>
  </tr>
  <tr>
    <td><img src="./screenshots/create_trip.png" alt="Create Trip" width="100%"/></td>
    <td><img src="./screenshots/community.png" alt="Community" width="100%"/></td>
    <td><img src="./screenshots/profile.png" alt="Profile" width="100%"/></td>
  </tr>
</table>

---

## ✨ Core Features

### 🤖 Intelligent AI Assistance (Powered by OpenRouter API)
- **AI Itinerary Generation** — Generate complete day-by-day travel plans tailored to your trip's budget, duration, and destinations instantly
- **Smart Packing Lists** — AI analyzes your destination's climate, activities, and trip type to suggest the perfect packing checklist
- **AI Trip Summary** — Get a beautifully formatted narrative summary of your entire itinerary
- **Context-Aware Travel Chatbot** — A floating AI assistant that answers questions based on your specific trip context (destination, dates, budget)
- **Offline Fallback** — App remains fully demo-able without an API key using intelligent mock responses

### 👥 Real-Time Collaboration
- **Multiplayer Planning** — Invite friends via email to co-plan trips simultaneously
- **Live Presence Indicators** — See who is currently viewing the trip with live avatar indicators
- **Instant Sync** — Activities, stops, and budget changes sync across all connected users via WebSockets (Socket.io)
- **Stop & Activity Broadcasts** — When someone adds a stop or activity, all collaborators see it appear live with a notification

### 🗺️ Comprehensive Trip Management
- **Interactive Itinerary Builder** — Add stops (cities) with a Leaflet.js map interface, organize activities by type (Sightseeing, Food, Adventure, Transport, etc.)
- **Route Planner** — Visual A→B route planning with OSRM routing engine, showing distance and estimated travel time
- **City Map Picker** — Click anywhere on the map or search to set your destination
- **Trip Health Score** — Algorithmic score (0–100) evaluating completeness, budget alignment, and activity diversity
- **Trip Status Tracking** — Automatic status (UPCOMING / ONGOING / COMPLETED) based on travel dates

### 💰 Budget & Expense Tracker
- **Budget Setup** — Set a total budget when creating a trip
- **Real-Time Expense Logging** — Add expenses by category (Flight, Hotel, Food, Transport, Shopping, etc.)
- **Live Budget Bar** — Visual progress bar showing spending vs. budget with color alerts (green → yellow → red)
- **Spending Breakdown** — Interactive Pie Chart (Recharts) breaking down spending by category
- **PDF Invoice Export** — Download a professional A4 PDF invoice of all expenses with ₹ amounts

### 📦 Packing List Manager
- **AI-Generated Lists** — One-click AI packing list generation based on your destination and trip type
- **Manual Add/Remove** — Fully editable checklist with category grouping
- **Check-off Items** — Mark items as packed with real-time state persistence
- **Reset & Regenerate** — Clear and regenerate the packing list at any time

### 📝 Trip Notes
- **Rich Note-Taking** — Create, edit, and delete notes for each trip with tagging support
- **Search & Filter** — Full-text search across all your notes
- **Pin Important Notes** — Pin critical notes to the top of your list

### 🌍 Community & Social
- **Share Trips** — Make any trip public and share it to the community feed
- **Discover Trips** — Browse trips shared by other travellers, filter by destination or sort by likes
- **Copy Trips** — Clone any community trip directly into your account as a new trip
- **Like System** — Like trips with a toggle like/unlike system

### 🎨 Premium Neumorphic Design System
- **Tactile UI** — Complete custom design system (`neu.js`) using dual-shadow depth physics for realistic extruded cards and deep inset wells
- **Monochromatic Cool-Grey** — Sophisticated `#E0E5EC` base palette with purple (`#6C63FF`) and teal (`#4ECDC4`) accents
- **Smooth Micro-Animations** — Hover lifts, inset presses, transition states on every interactive element
- **Modern Typography** — *Plus Jakarta Sans* (display) + *DM Sans* (body) from Google Fonts
- **Responsive Navbar** — Sticky header with active route indicators and mobile hamburger menu

### 🔐 Authentication & Security
- **JWT Authentication** — Secure stateless auth with 7-day token expiry
- **Password Hashing** — bcrypt with 12 salt rounds
- **Admin Panel** — Admin-only dashboard with user stats, trip trends, and platform metrics
- **Route Guards** — Protected routes redirect unauthenticated users to login

---

## 🏗️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Client)                    │
│         React 18 + Vite  |  Port: 5173                  │
│  ┌──────────┐ ┌────────┐ ┌──────────┐ ┌─────────────┐  │
│  │ React    │ │Zustand │ │ React    │ │  Recharts   │  │
│  │ Router   │ │ Auth   │ │ Hot Toast│ │  Leaflet.js │  │
│  └──────────┘ └────────┘ └──────────┘ └─────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │ HTTP / WebSocket
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (Server)                     │
│         Node.js + Express  |  Port: 5000                │
│  ┌──────────┐ ┌────────┐ ┌──────────┐ ┌─────────────┐  │
│  │  Prisma  │ │  JWT   │ │Socket.io │ │ OpenRouter  │  │
│  │   ORM    │ │ bcrypt │ │ Realtime │ │     AI      │  │
│  └──────────┘ └────────┘ └──────────┘ └─────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────┐
│                     DATABASE                            │
│                   PostgreSQL                            │
│   Users │ Trips │ Stops │ Activities │ Expenses │ Notes │
└─────────────────────────────────────────────────────────┘
```

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + Vite | UI framework & build tool |
| React Router DOM | Client-side routing |
| Zustand | Global auth state management |
| Axios | HTTP client with JWT interceptors |
| Socket.io-client | Real-time WebSocket connection |
| Leaflet.js | Interactive maps (city picker, route planner) |
| Recharts | Budget pie charts |
| React Hot Toast | Notification toasts |
| `neu.js` | Custom Neumorphic design token system |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| Prisma ORM | Type-safe database queries |
| PostgreSQL | Primary relational database |
| JWT + bcrypt | Auth & password security |
| Socket.io | Real-time bidirectional events |
| PDFKit | Server-side PDF invoice generation |
| OpenRouter API | AI itinerary & packing suggestions |
| OSRM API | Route distance/duration calculation |
| Nominatim | Reverse geocoding (map → city name) |

---

## 📂 Project Structure

```
traveloop/
├── 📁 client/                        # React Frontend (Vite)
│   ├── 📁 src/
│   │   ├── 📁 api/
│   │   │   ├── client.js             # Axios instance + JWT interceptor
│   │   │   └── trips.js              # All API endpoint definitions
│   │   ├── 📁 components/
│   │   │   ├── 📁 layout/
│   │   │   │   ├── Navbar.jsx        # Sticky top navigation bar
│   │   │   │   └── Layout.jsx        # App shell wrapper
│   │   │   └── 📁 ui/
│   │   │       ├── AIChatbot.jsx     # Floating AI chat widget
│   │   │       ├── TripHealthScore.jsx # Trip score sidebar card
│   │   │       ├── LiveCollaborators.jsx # Real-time viewer avatars
│   │   │       ├── CityMapPicker.jsx # Leaflet city search modal
│   │   │       ├── RouteMapPicker.jsx # A→B route planner modal
│   │   │       └── BudgetAlertModal.jsx # Over-budget warning
│   │   ├── 📁 pages/
│   │   │   ├── Login.jsx             # Sign in page
│   │   │   ├── Register.jsx          # Multi-step sign up (3 steps)
│   │   │   ├── Dashboard.jsx         # Home with recent trips & quick access
│   │   │   ├── TripList.jsx          # All trips grid view
│   │   │   ├── CreateTrip.jsx        # New trip form with map pickers
│   │   │   ├── ItineraryBuilder.jsx  # Stop & activity builder
│   │   │   ├── Budget.jsx            # Expense tracker + pie chart
│   │   │   ├── Packing.jsx           # AI packing checklist
│   │   │   ├── Notes.jsx             # Trip notes manager
│   │   │   ├── Community.jsx         # Public trip feed
│   │   │   ├── Profile.jsx           # User profile & stats
│   │   │   ├── Admin.jsx             # Admin analytics dashboard
│   │   │   └── Invoice.jsx           # PDF invoice viewer
│   │   ├── 📁 store/
│   │   │   └── authStore.js          # Zustand auth store (persisted)
│   │   └── neu.js                    # Neumorphic design tokens & helpers
│   └── index.html
│
├── 📁 server/                        # Node.js + Express Backend
│   ├── 📁 prisma/
│   │   └── schema.prisma             # Full database schema
│   ├── 📁 routes/
│   │   ├── auth.js                   # /register, /login, /me
│   │   ├── trips.js                  # CRUD + collaborators + health
│   │   ├── stops.js                  # Trip stop management
│   │   ├── activities.js             # Activity CRUD
│   │   ├── expenses.js               # Expense tracking
│   │   ├── packing.js                # Packing list CRUD + reset
│   │   ├── notes.js                  # Trip notes CRUD
│   │   ├── community.js              # Share, like, clone trips
│   │   ├── invoice.js                # Invoice data + PDF generation
│   │   ├── ai.js                     # OpenRouter AI endpoints
│   │   └── admin.js                  # Admin stats & user management
│   ├── 📁 middleware/
│   │   └── auth.js                   # JWT verification middleware
│   ├── 📁 utils/
│   │   ├── tripHealthScore.js        # Trip score algorithm (0-100)
│   │   └── budgetCalculator.js       # Budget aggregation & breakdown
│   ├── index.js                      # Express app + Socket.io server
│   └── seed.js                       # Database seeder (sample data)
│
├── 📁 screenshots/                   # README page screenshots
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **PostgreSQL** (local or cloud — [Supabase](https://supabase.com) / [Neon](https://neon.tech) recommended)
- **OpenRouter API Key** — Free at [openrouter.ai](https://openrouter.ai)

---

### 1. Clone the Repository

```bash
git clone https://github.com/DEXTERPIRO/odoo.git
cd odoo
```

---

### 2. Server Setup

```bash
cd server
npm install
```

Create your environment file:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
DATABASE_URL="postgresql://user:password@host:5432/traveloop"
JWT_SECRET="your_super_secret_jwt_key_here"
OPENROUTER_API_KEY="sk-or-xxxxxxxxxxxxxxxx"
PORT=5000
```

Push the database schema:
```bash
npx prisma db push
```

*(Optional) Seed sample community data:*
```bash
node seed.js
```

Start the backend server:
```bash
npm run dev
```
> Server runs at **http://localhost:5000**

---

### 3. Client Setup

Open a new terminal:
```bash
cd client
npm install
npm run dev
```
> App runs at **http://localhost:5173**

---

## 🗄️ Database Schema (Key Models)

```prisma
User          → id, email, password, firstName, lastName, phone, city, country, isAdmin
Trip          → id, name, description, startDate, endDate, totalBudget, status, isPublic
Stop          → id, city, country, startDate, endDate, orderIndex (belongs to Trip)
Activity      → id, name, type, cost, duration, notes (belongs to Stop)
Expense       → id, category, description, amount, date (belongs to Trip)
ChecklistItem → id, label, category, checked (belongs to Trip)
Note          → id, title, content, tag, pinned (belongs to Trip)
CommunityPost → id, caption, likesCount (links Trip + User)
PostLike      → userId + postId (unique toggle)
TripCollaborator → tripId + userId + role
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/me` | Get current user profile |

### Trips
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trips` | Get all user trips |
| POST | `/api/trips` | Create new trip |
| GET | `/api/trips/:id` | Get trip with stops & activities |
| PUT | `/api/trips/:id` | Update trip details |
| DELETE | `/api/trips/:id` | Delete trip |
| GET | `/api/trips/:id/health` | Get trip health score |
| POST | `/api/trips/:id/invite` | Invite collaborator by email |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/suggest-itinerary` | Generate AI day-by-day plan |
| POST | `/api/ai/generate-packing` | Generate AI packing list |
| POST | `/api/ai/chat` | AI travel assistant chat |
| POST | `/api/ai/trip-summary` | Generate trip narrative summary |

### Community
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/community` | Browse public trips |
| POST | `/api/community/share/:tripId` | Share trip publicly |
| POST | `/api/community/like/:postId` | Toggle like on post |
| POST | `/api/community/clone/:tripId` | Clone community trip |

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string |
| `JWT_SECRET` | ✅ Yes | Secret key for JWT signing |
| `OPENROUTER_API_KEY` | ⚡ Optional | AI features (works offline without it) |
| `PORT` | ❌ No | Server port (default: 5000) |

> **Note:** The app works fully in demo/offline mode without `OPENROUTER_API_KEY` — AI endpoints fall back to rich mock responses so you can demo all features without an API key.

---

## 🎯 Key Design Decisions

- **Neumorphic Design System** — All UI tokens (colors, shadows, radii, fonts) are centralized in `client/src/neu.js`. Every component imports from this single source of truth to prevent visual drift.
- **Top-Level Components** — All reusable form components (Field, ActInpField, etc.) are defined at module level — not inside render functions — to prevent React from unmounting/remounting on every keystroke.
- **Zustand for Auth** — Lightweight, persisted auth state with `localStorage` via `zustand/middleware/persist`. The token is read synchronously for API interceptors.
- **Socket.io Rooms** — Each trip has its own Socket.io room (`join-trip`). Budget updates, new stops, and activities are broadcast only to users in the same room.
- **PDF Auth via Query Param** — Since `window.open()` can't send Authorization headers, the PDF download endpoint accepts `?token=` as a query parameter and manually verifies the JWT.
- **deleteMany for Ownership** — Prisma's `delete` only accepts unique field selectors. Trip deletion uses `deleteMany({ where: { id, userId } })` for safe ownership-verified deletion.

---


## 📄 License

This project is licensed under the **MIT License** — free to use, modify, and distribute.

---

<p align="center">Built with ❤️ for Incredible India 🇮🇳</p>
