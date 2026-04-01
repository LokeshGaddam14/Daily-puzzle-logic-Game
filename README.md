# Logic Looper — Premium Daily Puzzle Game

![Logic Looper Banner](screenshots/home.png)

## Overview
**Logic Looper** is a sophisticated, high-end daily logic puzzle platform built with a modern, cinematic UI/UX. It offers players a curated selection of brain-teasers that refresh every 24 hours, including Pattern Match, Deduction Grids, and more.

The application features:
- **Cinematic Motion**: High-impact animations via Framer Motion.
- **Glassmorphism Design**: A sleek, modern aesthetic with translucent layers and vibrant gradients.
- **Dynamic Puzzles**: Unique puzzles generated daily based on a secure date-based seeding algorithm.
- **Full-Stack Architecture**: A robust Node.js backend with a React-Vite frontend.

## Key Features
- 🧩 **Diverse Puzzle Types**: From visual pattern matching to deductive logic grids.
- 🔥 **Daily Streaks**: Track your progress and maintain your daily solving streak.
- 🏆 **Global Leaderboards**: Compare your scores with players worldwide (integrated with a secure backend).
- 💡 **Intelligent Hint System**: Context-aware hints to help you through the toughest challenges.
- 🌑 **Dark Mode Aesthetic**: A premium dark-first interface optimized for focus.

## Gameplay
### Visual Pattern Matching
Test your logic limits with dynamically generated mind-benders.
![Gameplay Screenshot](screenshots/gameplay.png)

## Tech Stack
### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS & Vanilla CSS
- **State Management**: Redux Toolkit
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **API**: Express.js
- **Database**: Prisma ORM (SQLite/PostgreSQL)
- **Authentication**: JWT & Passport.js
- **Security**: Helmet, CORS, Rate Limiting

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/LokeshGaddam14/Daily-puzzle-logic-Game.git
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the App**:
   Open `http://localhost:5173` in your browser.

## Author
Developed with ❤️ by **Lokesh Gaddam**.
