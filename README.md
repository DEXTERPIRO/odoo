# Traveloop India 🇮🇳

> AI-powered travel planning platform for Incredible India — built for the hackathon.

## Overview

Traveloop India is a full-stack travel planning application that allows users to plan, build, and share multi-city Indian trips with intelligent AI assistance, real-time collaboration, and budget tracking.

## Features

- **AI Trip Planner** — Day-by-day itinerary suggestions powered by Gemini AI
- **Itinerary Builder** — Add cities, dates, and activities with an interactive map picker
- **Budget Tracker** — Real-time INR cost breakdown with budget alerts
- **Packing Lists** — AI-generated packing lists tailored to your trip
- **Trip Notes** — Rich note-taking per trip
- **Live Collaboration** — Real-time multiplayer planning via WebSockets
- **Trip Health Score** — Automatic score for itinerary completeness
- **Community** — Share trips and clone others' plans
- **AI Chatbot** — Context-aware India travel assistant

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18 + Vite, Neumorphic CSS     |
| Backend  | Node.js + Express                   |
| Database | PostgreSQL + Prisma ORM             |
| AI       | Google Gemini API                   |
| Realtime | Socket.IO                           |
| Auth     | JWT + bcrypt                        |
| Maps     | Leaflet.js + OpenStreetMap          |

## Design System

Built with a custom **Neumorphism (Soft UI)** design system:
- Base: `#E0E5EC` cool grey
- Dual-shadow depth physics (light top-left, dark bottom-right)
- `Plus Jakarta Sans` + `DM Sans` typography
- All tokens centralized in `client/src/neu.js`

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL

### Setup

```bash
# 1. Install server dependencies
cd server && npm install

# 2. Configure environment
cp .env.example .env   # fill in DB_URL, JWT_SECRET, GEMINI_API_KEY

# 3. Run database migrations
npx prisma migrate dev

# 4. Install client dependencies
cd ../client && npm install

# 5. Start development servers
# Terminal 1 — server
cd server && npm run dev

# Terminal 2 — client
cd client && npm run dev
```

App runs at `http://localhost:5173`

## Team

Built with love for the hackathon. All code lives on the `main` branch.
