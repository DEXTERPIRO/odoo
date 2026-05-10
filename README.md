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
  <a href="https://groq.com/"><img src="https://img.shields.io/badge/AI-Groq_%2B_OpenRouter-6C63FF?style=flat&logo=openai" alt="Groq AI"></a>
  <a href="https://socket.io/"><img src="https://img.shields.io/badge/Realtime-Socket.io-010101?style=flat&logo=socketdotio" alt="Socket.io"></a>
  <img src="https://img.shields.io/badge/Design-Neumorphic-E0E5EC?style=flat&color=6C63FF" alt="Neumorphic">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat" alt="MIT License">
</p>

<p align="center">
  A comprehensive, visually stunning platform designed to simplify the complexity of planning multi-city Indian travel. Experience tactile Neumorphic design, intelligent AI assistance powered by Groq, and real-time multiplayer collaboration — all in one place.
</p>

---

## Screenshots

<table>
  <tr>
    <td align="center"><b>Login</b></td>
    <td align="center"><b>Dashboard</b></td>
    <td align="center"><b>My Trips</b></td>
  </tr>
  <tr>
    <td><img src="./screenshots/login.png" alt="Login Page" width="100%"/></td>
    <td><img src="./screenshots/dashboard.png" alt="Dashboard" width="100%"/></td>
    <td><img src="./screenshots/trips.png" alt="My Trips" width="100%"/></td>
  </tr>
  <tr>
    <td align="center"><b>Itinerary Builder</b></td>
    <td align="center"><b>Nearby Stops</b></td>
    <td align="center"><b>Community</b></td>
  </tr>
  <tr>
    <td><img src="./screenshots/itinerary.png" alt="Itinerary Builder" width="100%"/></td>
    <td><img src="./screenshots/ai_stops.png" alt="Nearby Stops" width="100%"/></td>
    <td><img src="./screenshots/community.png" alt="Community" width="100%"/></td>
  </tr>
  <tr>
    <td align="center"><b>Create Trip</b></td>
    <td align="center"><b>Profile</b></td>
    <td align="center"><b>Inline Budget Edit</b></td>
  </tr>
  <tr>
    <td><img src="./screenshots/create_trip.png" alt="Create Trip" width="100%"/></td>
    <td><img src="./screenshots/profile.png" alt="Profile" width="100%"/></td>
    <td><img src="./screenshots/budget_edit.png" alt="Budget Edit" width="100%"/></td>
  </tr>
</table>

---

## Core Features

### Intelligent AI Assistance

- **Nearby Popular Places** — Enter any city and the system finds real nearby attractions within 20–30 km. Reads your trip's budget, duration, and existing activity types to return personalized day-trip suggestions
- **AI Itinerary Generation** — Complete day-by-day travel plans tailored to your trip's budget, duration, and destinations, including IRCTC train tips and India-specific advice
- **Smart Packing Lists** — Analyzes destination climate, activities, and trip type to suggest a categorized packing checklist
- **AI Trip Summary** — A formatted narrative summary of your entire itinerary
- **Context-Aware Travel Chatbot** — A floating assistant that answers questions based on your specific trip (destination, dates, budget)
- **Offline Fallback** — Fully demo-able without an API key using curated city data and OpenStreetMap

**AI provider chain (fastest to slowest):**
```
Groq (llama-3.3-70b-versatile, ~1s)
  → OpenRouter (llama-3.3-70b-instruct)
    → OSM Overpass API (real map data for any city, no key needed)
      → Curated city database (10 major Indian cities)
        → Generic mock responses
```

### Real-Time Collaboration

- **Multiplayer Planning** — Invite friends via email to co-plan trips simultaneously
- **Live Presence Indicators** — See who is viewing the trip with live avatar indicators
- **Instant Sync** — Activities, stops, and budget changes sync across all connected users via WebSockets
- **Stop & Activity Broadcasts** — When someone adds a stop or activity, all collaborators see it live

### Comprehensive Trip Management

- **Interactive Itinerary Builder** — Add stops (cities) with a Leaflet.js map interface, organize activities by type (Sightseeing, Food, Adventure, Transport, etc.)
- **Route Planner** — Visual A to B route planning with OSRM routing engine, showing distance and estimated travel time
- **City Map Picker** — Click anywhere on the map or search to set your destination
- **Inline Budget Editing** — Edit the total budget directly from the My Trips dashboard card without opening the full builder
- **Trip Health Score** — Algorithmic score (0–100) evaluating completeness, budget alignment, and activity diversity
- **Trip Status Tracking** — Automatic status (UPCOMING / ONGOING / COMPLETED) based on travel dates

### Budget & Expense Tracker

- **Budget Setup** — Set a total budget when creating a trip
- **Real-Time Expense Logging** — Add expenses by category (Flight, Hotel, Food, Transport, Shopping, etc.)
- **Live Budget Bar** — Visual progress bar showing spending vs. budget with color alerts
- **Spending Breakdown** — Interactive pie chart breaking down spending by category
- **PDF Invoice Export** — Download a professional A4 PDF invoice of all expenses with amounts in INR

### Packing List Manager

- **AI-Generated Lists** — One-click packing list generation based on destination and trip type
- **Manual Add/Remove** — Fully editable checklist with category grouping
- **Check-off Items** — Mark items as packed with real-time state persistence
- **Reset & Regenerate** — Clear and regenerate the packing list at any time

### Trip Notes

- **Rich Note-Taking** — Create, edit, and delete notes for each trip with tagging support
- **Search & Filter** — Full-text search across all notes
- **Pin Important Notes** — Pin critical notes to the top of the list

### Community & Social

- **Share Trips** — Make any trip public and share it to the community feed
- **Discover Trips** — Browse trips shared by other travellers, filter by destination or sort by likes
- **Copy Trips** — Clone any community trip directly into your account
- **Like System** — Toggle like/unlike on community posts

### Premium Neumorphic Design System

- **Tactile UI** — Complete custom design system (`neu.js`) using dual-shadow depth physics for realistic extruded cards and inset wells
- **Monochromatic Cool-Grey** — Sophisticated `#E0E5EC` base palette with purple (`#6C63FF`) and teal (`#4ECDC4`) accents
- **Smooth Micro-Animations** — Hover lifts, inset presses, transition states on every interactive element
- **Modern Typography** — Plus Jakarta Sans (display) + DM Sans (body) from Google Fonts
- **Responsive Navbar** — Sticky header with active route indicators and mobile hamburger menu

### Authentication & Security

- **JWT Authentication** — Secure stateless auth with 7-day token expiry
- **Password Hashing** — bcrypt with 12 salt rounds
- **Admin Panel** — Admin-only dashboard with user stats, trip trends, and platform metrics
- **Route Guards** — Protected routes redirect unauthenticated users to login

---

## Architecture & Tech Stack

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
│  │  Prisma  │ │  JWT   │ │Socket.io │ │  Groq API   │  │
│  │   ORM    │ │ bcrypt │ │ Realtime │ │ + OpenRouter│  │
│  └──────────┘ └────────┘ └──────────┘ └─────────────┘  │
│  ┌──────────────────────────────────────────────────┐   │
│  │  OSM Overpass + Nominatim (nearby places, free)  │   │
│  └──────────────────────────────────────────────────┘   │
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
| Groq API | Primary AI provider (ultra-fast, llama-3.3-70b) |
| OpenRouter API | AI fallback provider |
| OSM Overpass API | Dynamic nearby places for any city (no key needed) |
| Nominatim | Geocoding (city name → lat/lon) |
| OSRM API | Route distance/duration calculation |

---

## Project Structure

```
traveloop/
├── client/                        # React Frontend (Vite)
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js          # Axios instance + JWT interceptor
│   │   │   └── trips.js           # All API endpoint definitions
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx     # Sticky top navigation bar
│   │   │   │   └── Layout.jsx     # App shell wrapper
│   │   │   └── ui/
│   │   │       ├── AIChatbot.jsx          # Floating AI chat widget
│   │   │       ├── TripHealthScore.jsx    # Trip score sidebar card
│   │   │       ├── LiveCollaborators.jsx  # Real-time viewer avatars
│   │   │       ├── CityMapPicker.jsx      # Leaflet city search modal
│   │   │       ├── RouteMapPicker.jsx     # A to B route planner modal
│   │   │       └── BudgetAlertModal.jsx   # Over-budget warning
│   │   ├── pages/
│   │   │   ├── Login.jsx          # Sign in page
│   │   │   ├── Register.jsx       # Multi-step sign up (3 steps)
│   │   │   ├── Dashboard.jsx      # Home with recent trips & quick access
│   │   │   ├── TripList.jsx       # All trips grid + inline budget edit
│   │   │   ├── CreateTrip.jsx     # New trip form with map pickers
│   │   │   ├── ItineraryBuilder.jsx  # Stop & activity builder + AI nearby
│   │   │   ├── Budget.jsx         # Expense tracker + pie chart
│   │   │   ├── Packing.jsx        # AI packing checklist
│   │   │   ├── Notes.jsx          # Trip notes manager
│   │   │   ├── Community.jsx      # Public trip feed
│   │   │   ├── Profile.jsx        # User profile & stats
│   │   │   ├── Admin.jsx          # Admin analytics dashboard
│   │   │   └── Invoice.jsx        # PDF invoice viewer
│   │   ├── store/
│   │   │   └── authStore.js       # Zustand auth store (persisted)
│   │   └── neu.js                 # Neumorphic design tokens & helpers
│   └── index.html
│
├── server/                        # Node.js + Express Backend
│   ├── prisma/
│   │   └── schema.prisma          # Full database schema
│   ├── routes/
│   │   ├── auth.js                # /register, /login, /me
│   │   ├── trips.js               # CRUD + collaborators + health
│   │   ├── stops.js               # Trip stop management
│   │   ├── activities.js          # Activity CRUD
│   │   ├── expenses.js            # Expense tracking
│   │   ├── packing.js             # Packing list CRUD + reset
│   │   ├── notes.js               # Trip notes CRUD
│   │   ├── community.js           # Share, like, clone trips
│   │   ├── invoice.js             # Invoice data + PDF generation
│   │   ├── ai.js                  # Groq + OpenRouter + OSM AI endpoints
│   │   └── admin.js               # Admin stats & user management
│   ├── middleware/
│   │   └── auth.js                # JWT verification middleware
│   ├── utils/
│   │   ├── tripHealthScore.js     # Trip score algorithm (0-100)
│   │   └── budgetCalculator.js    # Budget aggregation & breakdown
│   ├── index.js                   # Express app + Socket.io server
│   └── seed.js                    # Database seeder (sample data)
│
├── screenshots/                   # README page screenshots
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** (local or cloud — [Supabase](https://supabase.com) / [Neon](https://neon.tech) recommended)
- **Groq API Key** (free) — [console.groq.com](https://console.groq.com) — for fastest AI responses
- **OpenRouter API Key** (optional fallback) — [openrouter.ai](https://openrouter.ai)

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

Create your environment file and edit with your credentials:

```env
DATABASE_URL="postgresql://user:password@host:5432/traveloop"
JWT_SECRET="your_super_secret_jwt_key_here"
GROQ_API_KEY="gsk_xxxxxxxxxxxxxxxxxxxx"
GROQ_MODEL="llama-3.3-70b-versatile"
OPENROUTER_API_KEY="sk-or-xxxxxxxxxxxx"
OPENROUTER_MODEL="meta-llama/llama-3.3-70b-instruct:free"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

> The app works fully without any AI key — nearby stops will use the free OpenStreetMap Overpass API automatically.

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

## Database Schema (Key Models)

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

## API Endpoints

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
| PUT | `/api/trips/:id` | Update trip details (incl. budget) |
| DELETE | `/api/trips/:id` | Delete trip |
| GET | `/api/trips/:id/health` | Get trip health score |
| POST | `/api/trips/:id/invite` | Invite collaborator by email |

### AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/suggest-stops` | Find nearby popular places for any city |
| POST | `/api/ai/suggest-itinerary` | Generate day-by-day plan |
| POST | `/api/ai/generate-packing` | Generate packing list |
| POST | `/api/ai/chat` | Travel assistant chat |
| POST | `/api/ai/trip-summary` | Generate trip narrative summary |

### Community

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/community` | Browse public trips |
| POST | `/api/community/share/:tripId` | Share trip publicly |
| POST | `/api/community/like/:postId` | Toggle like on post |
| POST | `/api/community/clone/:tripId` | Clone community trip |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret key for JWT signing |
| `GROQ_API_KEY` | Optional | Primary AI provider (fastest) |
| `GROQ_MODEL` | Optional | Groq model name (default: llama-3.3-70b-versatile) |
| `OPENROUTER_API_KEY` | Optional | AI fallback provider |
| `OPENROUTER_MODEL` | Optional | OpenRouter model name |
| `PORT` | No | Server port (default: 5000) |
| `CLIENT_URL` | No | Frontend URL for CORS (default: http://localhost:5173) |

> The app works fully without any AI key. Nearby stops use the free OpenStreetMap Overpass API, and other AI features use curated mock responses.

---

## Key Design Decisions

- **Neumorphic Design System** — All UI tokens (colors, shadows, radii, fonts) are centralized in `client/src/neu.js`. Every component imports from this single source of truth to prevent visual drift.
- **Top-Level Components** — All reusable form components are defined at module level — not inside render functions — to prevent React from unmounting/remounting on every keystroke.
- **Zustand for Auth** — Lightweight, persisted auth state with `localStorage` via `zustand/middleware/persist`. The token is read synchronously for API interceptors.
- **Socket.io Rooms** — Each trip has its own Socket.io room. Budget updates, new stops, and activities are broadcast only to users in the same room.
- **PDF Auth via Query Param** — Since `window.open()` cannot send Authorization headers, the PDF download endpoint accepts `?token=` as a query parameter and manually verifies the JWT.
- **AI Provider Chain** — `callAI()` tries Groq first (fastest, ~1s), falls back to OpenRouter, then to the free OSM Overpass API for real map data, then to curated city lists, and finally to generic mock responses — ensuring the app always returns useful results.
- **Context-Aware Nearby Stops** — The suggest-stops route reads the full trip context (city, budget per day, trip duration, existing activity types) before querying the AI or OSM, ensuring suggestions fit the traveller's budget and don't repeat activities already planned.

---

## License

This project is licensed under the **MIT License** — free to use, modify, and distribute.

---

<p align="center">Built with love for Incredible India</p>
