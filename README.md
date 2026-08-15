# 📚 Library Management System (MERN Stack)

A modern, high-performance, and visually stunning Library Management System built with the **MERN Stack** (MongoDB, Express, React, Node.js). This platform features a premium **Glassmorphic UI**, seamless book circulation tracking, and advanced real-time analytics.

## ✨ Features

- **📊 Advanced Analytics Dashboard**: Real-time insights into library usage.
  - View **Top 10 Readers** and **Most Popular Books**.
  - **Multiple Chart Views**: Toggle between List, Vertical Bar, Pie (Donut), and Line charts.
  - **Export Capabilities**: Instantly download chart data as raw `.CSV` files or capture high-quality `.PNG` images of your charts.
- **📚 Book Circulation**: Complete workflow for issuing and returning books.
  - Support for both registered **Students** (using GM No.) and temporary **Guests**.
  - Intelligent search dropdowns and availability tracking.
- **🧑‍🎓 Student & Guest Management**: Dedicated directories to register, edit, and track students and guests. Smart name formatting automatically displays clean First and Last names.
- **🎨 Premium UI/UX**: 
  - Beautiful, frosted-glass (Glassmorphism) aesthetics using **Tailwind CSS**.
  - Fully responsive design that looks great on desktop and mobile.
  - Smooth micro-animations and transitions.
- **🔐 Secure Authentication**: JWT-based admin login with persistent 365-day sessions.

## 🛠️ Technology Stack

**Frontend:**
- React 18 + Vite (TypeScript)
- Tailwind CSS (Styling & Glassmorphism)
- Recharts (Data Visualization)
- HTML-to-Image & html2canvas (Chart Exports)
- SWR (Data Fetching)
- React Router DOM (Routing)
- Lucide React (Icons)

**Backend:**
- Node.js + Express.js (TypeScript via `tsx`)
- MongoDB + Mongoose (Database & Models)
- JSON Web Tokens (JWT Authentication)
- bcryptjs (Password Hashing)

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [Git](https://git-scm.com/) installed on your machine. You will also need a MongoDB database (local or Atlas).

### 1. Clone the repository
```bash
git clone https://github.com/your-username/Library-GM.git
cd Library-GM
```

### 2. Setup the Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory and add your environment variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```
Start the backend development server:
```bash
npm run dev
```

### 3. Setup the Frontend
Open a new terminal window and navigate to the frontend directory:
```bash
cd frontend
npm install
```
Start the frontend development server:
```bash
npm run dev
```

The application will now be running at `http://localhost:5173`.

## 📸 Screenshots

*(Add your screenshots here!)*

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
