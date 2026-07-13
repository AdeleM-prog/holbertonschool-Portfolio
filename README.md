# AlimIA

AlimIA is a personalized nutrition web application that generates AI-driven recipes and meal plans based on each user's dietary profile, household, and preferences.

Solo capstone project developed as part of the RNCP5 Web and Mobile Web Developer certification at Holberton School.

---

## Table of contents

- [Overview](#overview)
- [Live demo](#live-demo)
- [Features](#features)
- [Architecture](#architecture)
- [Data model](#data-model)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the project](#running-the-project)
- [Deployment](#deployment)
- [Tests](#tests)
- [API overview](#api-overview)
- [Project structure](#project-structure)
- [Git workflow](#git-workflow)
- [Roadmap](#roadmap)
- [Author](#author)

---

## Overview

AlimIA helps users build meal plans that fit their profile: dietary constraints, diet type, household composition, and food preferences. Recipes and meal plans are generated through Mistral AI, and all nutritional data comes from Ciqual, the official French food composition database published by ANSES.

The frontend never communicates directly with the database or with external services. Every request is routed through the backend, which centralizes authentication, business logic, and API keys.

## Live demo

The application is deployed and publicly accessible.

- Application: [https://keen-recreation-production.up.railway.app](https://keen-recreation-production.up.railway.app)
- API documentation (Swagger): [https://holbertonschool-portfolio-production.up.railway.app/docs](https://holbertonschool-portfolio-production.up.railway.app/docs)

## Features

- Full authentication: registration, login, password update, account deletion, logout, with the JWT stored in an httpOnly cookie
- User profile: gender, age, household members, dietary constraints, diet type, liked and disliked foods
- Food search across a curated set of 838 Ciqual 2025 food items
- AI-generated recipes and personalized meal plans (daily or weekly)
- Weekly meal plan view, with a day selector on mobile and a seven-column table on desktop
- Automatically generated shopping list, with ingredient aggregation and unit normalization
- AI assistant for free-form nutrition questions
- Favorite recipes
- Dashboard with quick access to the current meal plan

## Architecture

The application follows a three-tier client-server architecture.

```mermaid
flowchart LR
    U([User]) --> FE[React + TailwindCSS<br/>Frontend]
    FE <-->|REST requests<br/>JWT in httpOnly cookie| BE[FastAPI<br/>Backend]
    BE <--> DB[(PostgreSQL)]
    BE -->|Recipe and meal plan generation,<br/>nutrition assistant| AI[Mistral AI<br/>mistral-large-latest]
    CQ[(Ciqual 2025<br/>ANSES, 838 curated items)] -.->|Initial import| DB

    style FE fill:#eef7ee,stroke:#7bab7e
    style BE fill:#eef2fa,stroke:#5b7fb5
    style DB fill:#fdf3e3,stroke:#d9a441
    style AI fill:#f5eefb,stroke:#9b6fc2
    style CQ fill:#fdf3e3,stroke:#d9a441
```

- **React**: responsive user interface for mobile and desktop, communicating exclusively with FastAPI over HTTP REST
- **FastAPI**: handles incoming requests, verifies JWT authentication, runs business logic, builds the prompts sent to Mistral AI, and queries PostgreSQL
- **PostgreSQL**: stores all persistent data, including user profiles, meal plans, recipes, shopping lists, favorites, and Ciqual food data
- **Mistral AI**: generates recipes, meal plans, and nutrition assistant responses; called exclusively from FastAPI, never from the frontend

## Data model

The database is organized around the `users` table. Every other table is linked to it, directly or indirectly, through foreign keys with cascading delete: removing an account irreversibly removes all associated data.

The `foods` table is seeded from a curated subset of 838 Ciqual 2025 codes and is used both for food search and for ingredient matching during recipe and meal plan generation. Food preferences are stored in two dedicated join tables, `liked_foods` and `disliked_foods`, linking users to specific Ciqual entries.

```mermaid
erDiagram
    USERS ||--o{ HOUSEHOLD_MEMBERS : has
    USERS ||--o{ MENUS : creates
    USERS ||--o{ RECIPES : generates
    USERS ||--o{ SHOPPING_LISTS : owns
    USERS ||--o{ FAVORITE_RECIPES : adds
    USERS ||--o{ LIKED_FOODS : likes
    USERS ||--o{ DISLIKED_FOODS : dislikes
    MENUS ||--|{ MENU_MEALS : contains
    MENUS ||--o| SHOPPING_LISTS : generates
    RECIPES ||--o{ MENU_MEALS : used_in
    RECIPES ||--|{ RECIPE_INGREDIENTS : made_of
    RECIPES ||--o{ FAVORITE_RECIPES : favorited_as
    FOODS ||--o{ RECIPE_INGREDIENTS : used_in
    FOODS ||--o{ LIKED_FOODS : liked_by
    FOODS ||--o{ DISLIKED_FOODS : disliked_by
    SHOPPING_LISTS ||--|{ SHOPPING_LIST_ITEMS : contains

    USERS {
        uuid id PK
        string email
        string hashed_password
        string gender
        date birth_date
        int household_size
        string dietary_constraints
        string diet_type
    }
    HOUSEHOLD_MEMBERS {
        uuid id PK
        uuid user_id FK
        string first_name
        string gender
        date birth_date
    }
    FOODS {
        uuid id PK
        string ciqual_code
        string name
        float energy_cal
        float proteins
        float carbohydrates
        float fats
        float sugars
        float fiber
        float sodium
    }
    LIKED_FOODS {
        uuid id PK
        uuid user_id FK
        uuid food_id FK
    }
    DISLIKED_FOODS {
        uuid id PK
        uuid user_id FK
        uuid food_id FK
    }
    RECIPES {
        uuid id PK
        uuid user_id FK
        string name
        string meal_type
        int prep_time
        int cook_time
        int servings
    }
    RECIPE_INGREDIENTS {
        uuid id PK
        uuid recipe_id FK
        uuid food_id FK
        float quantity
        string unit
        string state
    }
    MENUS {
        uuid id PK
        uuid user_id FK
        string type
        date start_date
        date end_date
    }
    MENU_MEALS {
        uuid id PK
        uuid menu_id FK
        uuid recipe_id FK
        date date
        string meal_type
    }
    SHOPPING_LISTS {
        uuid id PK
        uuid menu_id FK
        uuid user_id FK
        timestamp created_at
    }
    SHOPPING_LIST_ITEMS {
        uuid id PK
        uuid shopping_list_id FK
        string ingredient
        float quantity
        string unit
    }
    FAVORITE_RECIPES {
        uuid id PK
        uuid user_id FK
        uuid recipe_id FK
    }
```

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, TailwindCSS, React Router, Jest |
| Backend | FastAPI (Python 3.12), SQLAlchemy, Pydantic, Pytest |
| Database | PostgreSQL |
| AI | Mistral AI (`mistral-large-latest`) |
| Authentication | JWT in an httpOnly cookie, bcrypt hashing |
| Deployment | Railway |

## Prerequisites

- Node.js (LTS)
- Python 3.12
- PostgreSQL 16
- A Mistral AI API key

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/AdeleM-prog/holbertonschool-Portfolio.git
cd alimia
```

### 2. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate      # on Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
DATABASE_URL=postgresql://alimia_user:your_password@localhost:5432/alimia
MISTRAL_API_KEY=your_mistral_api_key
SECRET_KEY=your_secret_key
```

The signing algorithm (`HS256`) is set directly in `services/auth.py` and does not need to be defined as an environment variable.

Keep `.env` out of version control (it should be listed in `.gitignore`), and commit a `.env.example` with placeholder values to document the expected format.

### 3. Database

Create the PostgreSQL database, the application role, and grant the required privileges:

```bash
sudo -u postgres psql -c "CREATE DATABASE alimia;"
sudo -u postgres psql -c "CREATE USER alimia_user WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE alimia TO alimia_user;"
sudo -u postgres psql -d alimia -c "GRANT ALL ON SCHEMA public TO alimia_user;"
```

Both grants are required: PostgreSQL does not automatically extend database-level privileges to the `public` schema, so the schema-level grant must be run separately, on every machine where the project is set up.

The food search feature relies on the `unaccent` PostgreSQL extension for accent-insensitive matching. Enable it once per database:

```bash
sudo -u postgres psql -d alimia -c "CREATE EXTENSION IF NOT EXISTS unaccent;"
```

Tables are created automatically on application startup through `Base.metadata.create_all`. Once the backend has been started at least once, seed the curated Ciqual food data:

```bash
python3 seeds/seeds_foods.py
```

Running this script more than once without clearing the table first will duplicate every row, since it does not truncate the table automatically:

```bash
sudo -u postgres psql -d alimia -c "TRUNCATE TABLE foods RESTART IDENTITY CASCADE;"
```

### 4. Frontend

```bash
cd ../frontend
npm install
```

## Running the project

Backend, from `backend/`, with the virtual environment activated:

```bash
uvicorn main:app --reload
```

Frontend, from `frontend/`:

```bash
npm run dev
```

The frontend communicates with the API through a Vite proxy (`/api/...`), which avoids cross-port cookie issues between the frontend and backend during local development.

## Deployment

The application is deployed on Railway, with the backend, the frontend, and the PostgreSQL database running as three separate services within the same project, each redeploying automatically on every push to `main`.

**Backend**: FastAPI service, connected to the Railway PostgreSQL instance through a referenced `DATABASE_URL` variable. Required environment variables:

```env
DATABASE_URL=<referenced from the Postgres service>
MISTRAL_API_KEY=your_mistral_api_key
SECRET_KEY=<generated by Railway>
ENVIRONMENT=production
FRONTEND_URL=<the deployed frontend URL, for CORS>
```

The `ENVIRONMENT` variable switches the authentication cookie from `SameSite=Lax` (used locally, where frontend and backend share the same effective origin through the Vite proxy) to `SameSite=None; Secure` (required in production, where the frontend and backend are served from two distinct Railway domains).

**Frontend**: since the frontend and backend live on separate domains in production, the Vite dev proxy used locally no longer applies once the app is built into static files. A small Express server (`server.cjs`) reproduces the same behavior in production: it serves the built static files and forwards any request to `/api` to the backend, so the rest of the application code (all `fetch('/api/...')` calls) stays identical between local development and production.

```env
BACKEND_URL=<the deployed backend URL>
```

Build command: `npm run build`. Start command: `node server.cjs`.

**Database**: PostgreSQL is provisioned as a managed Railway service. After the first deployment, the `unaccent` extension must be enabled and the Ciqual data seeded once, the same way as in local setup, but pointed at the Railway database's public connection URL instead of a local one.

## Tests

Backend, using Pytest:

```bash
cd backend
pytest --cov
```

Frontend, using Jest:

```bash
cd frontend
npm test -- --coverage
```

The backend test suite covers 40 tests across 10 files with 87% coverage. The frontend test suite covers 79 tests across 21 files with approximately 86% coverage.

## API overview

Interactive Swagger documentation generated automatically by FastAPI is available at `http://localhost:8000/docs` locally, or at the [production Swagger URL](https://holbertonschool-portfolio-production.up.railway.app/docs) listed above.

Authentication relies on a JWT stored in an httpOnly cookie, set automatically by the backend on registration or login. Authenticated endpoints read this cookie directly; there is no `Authorization` header to set manually, including when testing through Swagger.

**Authentication**

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Create a new account | ❌ |
| POST | `/auth/login` | Log in and receive a JWT, set as an httpOnly cookie | ❌ |
| GET | `/auth/me` | Verify the current session | ✅ |
| POST | `/auth/logout` | Clear the authentication cookie | ✅ |
| PATCH | `/auth/password` | Update the current password | ✅ |
| DELETE | `/users/me` | Permanently delete the account and all associated data | ✅ |

**User profile**

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/users/me` | Retrieve the current user's profile | ✅ |
| PATCH | `/users/me` | Update one or more profile fields | ✅ |

**Household members**

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/users/me/household-members` | List household members | ✅ |
| POST | `/users/me/household-members` | Add a household member | ✅ |
| PATCH | `/users/me/household-members/{member_id}` | Update a household member | ✅ |
| DELETE | `/users/me/household-members/{member_id}` | Remove a household member | ✅ |

**Food preferences**

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/users/me/liked-foods` | List liked foods | ✅ |
| POST | `/users/me/liked-foods` | Add a liked food | ✅ |
| DELETE | `/users/me/liked-foods/{food_id}` | Remove a liked food | ✅ |
| GET | `/users/me/disliked-foods` | List disliked foods | ✅ |
| POST | `/users/me/disliked-foods` | Add a disliked food | ✅ |
| DELETE | `/users/me/disliked-foods/{food_id}` | Remove a disliked food | ✅ |

**Foods**

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/foods/search?q={query}` | Search foods by name, accent-insensitive | ✅ |
| GET | `/foods/{food_id}` | Retrieve full nutritional detail for a food | ✅ |

**Recipes and favorites**

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/recipes/generate` | Generate a recipe from a list of ingredients | ✅ |
| POST | `/recipes/{recipe_id}/alternatives` | Generate an alternative to an existing recipe | ✅ |
| GET | `/users/me/favorites` | List favorite recipes | ✅ |
| POST | `/users/me/favorites` | Add a recipe to favorites | ✅ |
| DELETE | `/users/me/favorites/{favorite_id}` | Remove a recipe from favorites | ✅ |

**Menus**

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/menus/generate` | Generate a daily or weekly meal plan | ✅ |
| POST | `/menus` | Save a validated meal plan | ✅ |
| GET | `/menus/current` | Retrieve the current active meal plan | ✅ |
| GET | `/menus/{menu_id}` | Retrieve a specific meal plan | ✅ |
| PATCH | `/menus/{menu_id}` | Update a meal plan through the AI | ✅ |

**Shopping list**

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/menus/{menu_id}/shopping-list` | Generate a shopping list from a meal plan | ✅ |
| GET | `/menus/{menu_id}/shopping-list` | Retrieve a meal plan's shopping list | ✅ |
| PATCH | `/menus/{menu_id}/shopping-list/items/{item_id}` | Update a shopping list item, for example marking it as checked | ✅ |

**AI assistant**

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/assistant/ask` | Ask a free-form nutrition question | ✅ |

## Project structure

```
alimia/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas (API contracts)
│   ├── routes/          # FastAPI endpoints
│   ├── services/        # Business logic, including AI integration
│   ├── seeds/           # Ciqual import script and curated food code list
│   └── requirements.txt
├── frontend/
│   ├── server.cjs        # Production server: serves the build and proxies /api
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── assets/
│   └── package.json
└── README.md
```

## Git workflow

The project follows a Gitflow-inspired branching strategy, with `dev` as the integration branch and `main` reserved for stable, deployable code.

```
main        → stable code only, updated from dev
dev         → integration branch, base for all work
feature/*   → new functionality, branched from dev
chore/*     → setup, configuration, maintenance
bugfix/*    → non-critical bug fixes
hotfix/*    → critical fixes applied directly against main
```

**Starting new work**

```bash
git fetch origin
git checkout dev
git checkout -b feature/short-description
```

Fetching before checking out avoids committing to the wrong branch when switching machines.

**Committing**

Commit messages are written in English and follow a conventional format:

```
feat: add user authentication
fix: correct JWT expiration handling
chore: update Ciqual seed script
```

**Opening a pull request**

Branches are pushed and merged into `dev` through a pull request on GitHub, never merged locally, to avoid accidental force-push incidents. Each pull request follows a fixed English-language template covering the description, the related issue, the type of change, the changes made, the tests performed, and a validation checklist.

## Roadmap

Directions considered for a future version:

- Fuzzy food search (`pg_trgm`) to tolerate typos
- Recipe illustrations via the Unsplash API
- Sport profile, weight goals, and progress tracking
- AI-generated food reintroduction plans
- Facade architecture to decouple the API, business logic, and persistence layers
- Migration of the frontend to React Native

## Author

Designed, developed, and tested individually, covering product management, source control management, quality assurance, and development, as part of the RNCP5 Web and Mobile Web Developer certification at Holberton School.
