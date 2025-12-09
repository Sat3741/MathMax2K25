# MathMax - Adaptive Math Learning Platform

MathMax is a comprehensive, interactive application designed to help elementary and middle school students improve their basic math skills through daily practice, real-time multiplayer challenges, and personalized learning exercises. It features dedicated dashboards for Students, Teachers, and Admins to track progress and manage learning.

## Core Features

### 🎮 For Students
- **Adaptive Practice Engine**: Personalized math problems (Arithmetic, Fractions, Decimals) that adapt to your skill level.
- **Multiplayer Battle Arena**: Challenge friends in real-time 1v1 math battles using WebSockets.
- **Gamification**: Earn XP, level up, and unlock achievements.
- **Progress Tracking**: Visual charts showing improvement over time.
- **Dashboards**: View assignments, recent activity, and leaderboard rankings.

### 👩‍🏫 For Teachers
- **Class Management**: Create classes and manage student rosters.
- **Assignment Creation**: Create custom assignments with specific deadlines and topics.
- **Analytics Dashboard**: Monitor student performance, identify weak areas, and generate reports.
- **Group Management**: Organize students into groups for targeted learning.

### 🛠 For Admins
- **User Management**: Manage all user roles (Student, Teacher, Admin).
- **Bulk Operations**: Upload students/teachers via CSV/Excel.
- **System Oversight**: Monitor platform usage and manage global settings.

## 🏗 Tech Stack

- **Frontend**: React, Vite, Material-UI (MUI), Lucide React, Recharts.
- **Backend**: Django, Django REST Framework (DRF).
- **Real-time**: Django Channels & Daphne (WebSockets) for Multiplayer.
- **Database**: PostgreSQL.
- **Authentication**: JWT (JSON Web Tokens).

## 🚀 Setup Instructions

### Prerequisites
- **Node.js**: [Download Node.js](https://nodejs.org/)
- **Python 3.8+**: [Download Python](https://python.org/)
- **PostgreSQL**: [Download PostgreSQL](https://www.postgresql.org/)
- **Redis** (Optional, for Channel Layer/Celery): [Download Redis](https://redis.io/)

### Backend Setup (Django)

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    
    # Windows
    venv\Scripts\activate
    
    # macOS/Linux
    source venv/bin/activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Configure Environment Variables:
    Create a `.env` file in the `backend` folder (or check `config/settings.py` for defaults). Ensure you set your database credentials.

5.  Run Migrations:
    ```bash
    python manage.py migrate
    ```

6.  Start the Server (with Channels/Daphne support):
    ```bash
    python manage.py runserver
    ```

### Frontend Setup (React + Vite)

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the Development Server:
    ```bash
    npm run dev
    ```

    The app will typically run at [http://localhost:5173](http://localhost:5173).

## 📂 Project Structure

- **backend/**: Django project root.
    - `api/`: REST API endpoints.
    - `multiplayer/`: WebSocket consumers and routing.
    - `math_engine/`: Logic for generating math problems.
    - `users/`: Custom user models and auth.
- **frontend/**: React application.
    - `src/pages/`: Main application pages.
    - `src/components/`: Reusable UI components.
    - `src/context/`: Global state (Auth, Theme, Multiplayer).

## 🔑 Default Accounts

(If you have loaded `sample_users.csv`)
- **Admin**: `admin@mathmax.com`
- **Teacher**: `teacher@mathmax.com`
- **Student**: `student@mathmax.com`
