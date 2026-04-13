# Joyida Project

Joyida is a multi-platform application consisting of a mobile app, a web dashboard, and a shared backend.

## Project Structure

- **`backend/`**: FastAPI (Python) based API.
- **`frontend/`**: React + Vite + TypeScript web application.
- **`mobile/`**: Flutter mobile application for Android and iOS.

## Getting Started

### Backend
1. `cd backend`
2. `python3 -m venv venv`
3. `source venv/bin/activate`
4. `pip install -r requirements.txt`
5. `uvicorn app.main:app --reload`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

### Mobile
1. `cd mobile`
2. `flutter run`

## Tech Stack
- **Backend**: FastAPI, SQLAlchemy, Pydantic, PostgreSQL/SQLite.
- **Frontend**: React, Vite, TypeScript, Tailwind CSS (optional).
- **Mobile**: Flutter, Provider/Riverpod.
