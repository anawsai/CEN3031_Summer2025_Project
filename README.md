# SwampScheduler 🐊

A Gator-themed productivity web app for UF students

## Quick Setup for Team

### Prerequisites

Make sure you have installed on your computer:

- Node.js: https://nodejs.org/en
- Python: https://www.python.org/

### Backend Setup

1. **Clone and navigate**

```sh
git clone https://github.com/yourusername/swampscheduler.git
cd swampscheduler/backend
```

2. **Project Setup**

```sh
# Set up the virtual environment
python -m venv swamp_env

# On Mac/Linux:
source swamp_env/bin/activate

# On Windows Command Prompt:
swamp_env\Scripts\activate

# On Windows PowerShell:
swamp_env\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

3. **Environment variables**

```sh
# Copy .env.example template to .env
cp .env.example .env
```

Now edit `.env` with our Supabase credentials (check team chat for keys).

4. **Run the server**

```sh
python app.py
```

5. **Test it works**
   Go to `http://localhost:5000/api/health` - you should see a success message.

### Frontend Setup

1. **Navigate to frontend**
   ```sh
   cd swampscheduler/frontend
   ```
2. **_Install Dependencies_**
   ```sh
   npm install
   npm install lucide-react
   ```
3. **_Run the development server_**
   ```sh
   npm start
   ```
4. **_Test it works_**
   Go to `http://localhost:3000` - you should see the SwampScheduler homepage.

## Reproducible Build Setup (Recommended)

We have a fully reproducible build setup using Nix for both development and production environments. This ensures everyone has the exact same dependencies and configuration.

### Quick Start with Nix

1. **Install Nix** (if you haven't already. we use the determinate nix installer below):
   ```sh
   curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install
   ```

2. **Clone and enter the project**:
   ```sh
   git clone https://github.com/yourusername/swampscheduler.git
   cd swampscheduler
   ```

3. **Enter the development environment**:
   ```sh
   nix develop --impure
   ```

4. **Run the application**:
   - For production mode:
     ```sh
     frontend-prod  # Builds the React frontend
     backend-prod   # Starts the Flask backend with Gunicorn
     ```
   - For development mode:
     ```sh
     frontend       # Starts React dev server
     backend        # Starts Flask dev server
     ```

That's it! Nix handles all dependencies, environment setup, and configuration for a fully reproducible build.

## Current Status

-  Flask backend running
-  Supabase connected
-  Full authentication system
-  Task management with XP/gamification
-  Pomodoro timer
-  Shared boards
-  Achievement system
-  Production deployment ready

## Tech Stack

- **Backend:** Flask + Supabase
- **Frontend:** React.js with CSS modules
- **Database:** PostgreSQL (via Supabase)
- **DevOps:** Nix for reproducible builds
