# MathMax

## Setup Instructions

Since the automated setup could not be completed due to missing environment tools, please follow these steps to get the project running.

### Prerequisites
1.  **Install Xcode Command Line Tools**: `xcode-select --install`
2.  **Install Node.js**: Download from [nodejs.org](https://nodejs.org/) or `brew install node`
3.  **Install Python 3**: Should be available after installing Xcode tools.

### Backend Setup (Django)
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create a virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install django djangorestframework django-cors-headers
    ```
4.  Run migrations:
    ```bash
    python manage.py migrate
    ```
5.  Start the server:
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
3.  Start the development server:
    ```bash
    npm run dev
    ```

Open [http://localhost:5173](http://localhost:5173) to view the application.
