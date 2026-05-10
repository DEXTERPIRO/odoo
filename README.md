<div align="center">
  
  <img src="./client/src/assets/hero.png" alt="Traveloop India Logo" width="120" />

  # 🇮🇳 Traveloop India

  **AI-Powered Travel Planning & Collaborative Itinerary Builder**

  [![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=flat&logo=nodedotjs)](https://nodejs.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
  [![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-8E75B2?style=flat&logo=google)](https://deepmind.google/technologies/gemini/)
  [![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-010101?style=flat&logo=socketdotio)](https://socket.io/)

  <p align="center">
    A comprehensive, visually stunning platform designed to simplify the complexity of planning multi-city Indian travel. Experience tactile Neumorphic design, intelligent AI assistance, and real-time multiplayer collaboration.
  </p>

</div>

---

## ✨ Core Features

### 🤖 Intelligent AI Assistance (Powered by Google Gemini)
- **AI Itinerary Generation:** Instantly generate day-by-day travel plans customized to your budget and duration.
- **Smart Packing Lists:** AI analyzes your destination's climate and activities to suggest the perfect packing checklist.
- **Context-Aware Travel Assistant:** A floating AI Chatbot that answers questions based on your specific trip context.

### 👥 Real-Time Collaboration
- **Multiplayer Planning:** Invite friends via email to view and edit trips simultaneously.
- **Live Presence:** See exactly who is viewing the trip with live avatar indicators and "online" pulses.
- **Instant Updates:** Activities, stops, and budget changes sync across all connected clients via WebSockets.

### 🗺️ Comprehensive Trip Management
- **Interactive Itinerary Builder:** Add cities and dates using a map-based interface. Organize activities by type (Sightseeing, Food, Adventure, etc.).
- **Dynamic Budget Tracking:** Set a budget limit and track expenses in real-time. Visual progress bars alert you when you approach your limit.
- **Trip Health Score:** An automated, algorithmic score (out of 100) that evaluates your itinerary's completeness, budget alignment, and activity diversity.

### 🎨 Premium Neumorphic Design System
- **Tactile UI:** A complete custom design system (`neu.js`) utilizing advanced dual-shadow depth physics for extruded cards and deep inset wells.
- **Monochromatic Cool-Grey:** A sophisticated, distraction-free `#E0E5EC` palette.
- **Modern Typography:** Utilizing *Plus Jakarta Sans* and *DM Sans* for maximum readability and aesthetic appeal.

---

## 🏗️ Architecture & Tech Stack

Traveloop is structured as a decoupled full-stack application:

### Frontend (Client)
- **Framework:** React.js (Vite)
- **Styling:** Custom JavaScript-injected Neumorphism (`neu.js`) + Vanilla CSS
- **Routing:** React Router DOM
- **State Management:** Zustand (Auth) + React hooks
- **Notifications:** React Hot Toast
- **Maps:** Leaflet.js / React-Leaflet

### Backend (Server)
- **Environment:** Node.js + Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens) & bcrypt
- **Real-Time Engine:** Socket.io
- **AI Integration:** `@google/genai` (Gemini API)

---

## 🚀 Getting Started

Follow these instructions to run the project locally.

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL running locally or via a cloud provider

### 1. Database & Server Setup

Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Configure your environment variables:
```bash
cp .env.example .env
```
*Edit the `.env` file to include your PostgreSQL connection string, a JWT secret, and your Google Gemini API key.*

Run database migrations to initialize the schema:
```bash
npx prisma migrate dev --name init
```

Start the backend development server:
```bash
npm run dev
```
*(The server will start on `http://localhost:5000`)*

### 2. Client Setup

Open a new terminal window, navigate to the client directory, and install dependencies:
```bash
cd client
npm install
```

Start the frontend development server:
```bash
npm run dev
```
*(The client will start on `http://localhost:5173`)*

---

## 📂 Project Structure

```text
traveloop/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── api/            # Axios API client & endpoints
│   │   ├── components/     # Reusable UI & Layout components
│   │   ├── pages/          # Full page views (Dashboard, Itinerary, etc.)
│   │   ├── store/          # Zustand global state
│   │   └── neu.js          # Centralized Neumorphic design tokens
├── server/                 # Node.js/Express Backend
│   ├── prisma/             # Database schema and migrations
│   ├── routes/             # Express API routers
│   ├── utils/              # Helper functions (Health score, Budget calc)
│   └── index.js            # Express app entry & Socket.io setup
└── README.md
```

---

