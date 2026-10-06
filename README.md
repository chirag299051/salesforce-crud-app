# Salesforce CRUD App

React + Express application for CRUD operations on Salesforce Account, Opportunity, Lead, Contact, and Case records.

## Architecture

- Frontend: React + Vite
- Backend: Node.js + Express
- Authentication: Salesforce OAuth 2.0 Authorization Code Flow with PKCE
- Salesforce API: REST API / SOQL
- Sessions: express-session with MongoDB in production
- Frontend deployment: GitHub Pages
- Backend deployment: Render

## Local development

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5050` by default.

Copy `backend/.env.example` to `backend/.env` and fill in the Salesforce OAuth credentials.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The local frontend uses `http://localhost:5050` unless `VITE_API_URL` is set.

## Production environment variables

### Render backend

- `NODE_ENV=production`
- `SESSION_SECRET`
- `SALESFORCE_CLIENT_ID`
- `SALESFORCE_CLIENT_SECRET`
- `SALESFORCE_LOGIN_URL=https://login.salesforce.com`
- `SALESFORCE_CALLBACK_URL=https://YOUR-RENDER-SERVICE.onrender.com/auth/callback`
- `FRONTEND_URL=https://chirag299051.github.io/salesforce-crud-app/`
- `MONGODB_URI`

### GitHub Pages

Create a repository variable named `VITE_API_URL` containing the Render backend URL, for example:

`https://YOUR-RENDER-SERVICE.onrender.com`

The GitHub Actions workflow builds and deploys the frontend whenever `main` is updated.

## Salesforce OAuth callback

The Salesforce External Client App must contain the exact production callback URL configured in Render.
