# SwampScheduler 🐊
A Gator-themed productivity web app for UF students

## Quick Setup for Team
Prerequisites
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
Now edit ```.env``` with our Supabase credentials (check team chat for keys).

4. **Run the server**
  ```sh
  python app.py
  ```

5. **Test it works**
   Go to ```http://localhost:5000/api/health``` - you should see a success message. (I will put it in one of our disc chats)

## Current Status
- ✅ Flask backend running
- ✅ Supabase connected
- 🔄 Working on auth and task endpoints

## Tech Stack
- **Backend:** Flask + Supabase
- **Frontend:** React (coming soon)
