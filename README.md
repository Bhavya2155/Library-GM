# Gnan Mandir Library Management System

A modern, high-performance library management platform featuring a premium **Glassmorphic UI**, robust **Role-Based Access Control (RBAC)**, and real-time circulation tracking. 

Built with React, Node.js, and powered by Turso (SQLite) at the edge.

## ✨ Key Features

### 🛡️ Role-Based Access Control (RBAC)
- Five distinct roles: **Admin**, **Coordinator**, **Senior Leader**, **Leader**, and **Student**.
- Dynamic UI rendering based on roles (e.g., Senior Leaders only see Dashboard, Books, and Circulation).
- Color-coded badges across the app for quick role identification.
- Secure login history tracking with intelligent privacy masks.

### 📚 Advanced Book Circulation
- Complete workflow for issuing, returning, and renewing books.
- Instant, real-time background syncing of **Overdue Notifications**.
- Smart global search allowing instant lookup by exact student names.
- Support for both registered **Students** (using GM No.) and temporary **Guests**.

### 📊 Interactive Analytics Dashboard
- Real-time insights into library usage.
- View **Top 10 Readers** and **Most Popular Books**.
- Toggle between List, Vertical Bar, Pie (Donut), and Line charts.
- **Export Capabilities**: Instantly download chart data as raw \.CSV\ files or capture high-quality \.PNG\ images.

### 💎 Premium UI/UX
- Beautiful, frosted-glass (Glassmorphism) aesthetics using **Tailwind CSS**.
- Fully responsive design that looks great on desktop and mobile.
- Smooth micro-animations, transitions, and toast notifications.

## 🛠️ Technology Stack

**Frontend:**
- React 18 + Vite (TypeScript)
- Tailwind CSS (Styling & Glassmorphism)
- Recharts (Data Visualization)
- HTML-to-Image (Chart Exports)
- React Router DOM (Routing)
- Lucide React (Icons)

**Backend & Database:**
- Node.js + Express.js (TypeScript)
- Prisma ORM
- Turso (LibSQL/SQLite Database at the edge)
- JSON Web Tokens (JWT Authentication)
- bcryptjs (Password Hashing)

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [Git](https://git-scm.com/) installed on your machine.

### 1. Clone the repository
\\\ash
git clone https://github.com/Bhavya2155/Library-GM.git
cd Library-GM
\\\

### 2. Setup the Backend & Database
\\\ash
cd backend
npm install
\\\
Create a \.env\ file in the \ackend\ directory and add your Turso credentials:
\\\env
PORT=5000
TURSO_DATABASE_URL=libsql://your-turso-db-url.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
JWT_SECRET=your_super_secret_jwt_key
\\\
Generate Prisma Client and start the server:
\\\ash
npx prisma generate
npm run dev
\\\

### 3. Setup the Frontend
Open a new terminal window and navigate to the frontend directory:
\\\ash
cd frontend
npm install
\\\
Start the frontend development server:
\\\ash
npm run dev
\\\

The application will now be running at \http://localhost:5173\.

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
