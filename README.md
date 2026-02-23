# EliteTest - Production-Ready Online Testing Platform

EliteTest is a full-stack MERN application designed for high-stakes competition environments.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### Setup Backend

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A strong secret key
4. Seed the admin account:
   ```bash
   npm run seed
   ```
   *Default Admin: `admin` / `adminpassword123`*
5. Start the server:
   ```bash
   npm run dev
   ```

### Setup Frontend

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🛠 Features

- **Admin Control**: Create team accounts, manage questions, and qualify teams for Round 2.
- **Secure MCQ**: Timer-based testing with auto-submit and server-side scoring (+4/-1).
- **Glassmorphic UI**: Premium design built with Tailwind CSS and Framer Motion.
- **Anti-Cheating**: Prevents multiple attempts and warns on browser navigation.
- **Scalable**: Optimized MongoDB queries for 100+ concurrent teams.

## 📁 Folder Structure

- `backend/src/`: MVC architecture (Models, Controllers, Routes, Middleware).
- `frontend/src/`: React components, context API, and hooks.
