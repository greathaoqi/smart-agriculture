# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

智慧农业管理平台 (Smart Agriculture Management Platform) - A full-stack Vue 3 + Node.js + MySQL application for managing agricultural operations including farms, devices, planting, inventory, and sales.

## Development Commands

### Local Development

```bash
# Start MySQL container
docker run -d --name sa-mysql -p 12330:3306 \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -e MYSQL_DATABASE=smart_agriculture \
  mysql:8.0 --default-authentication-plugin=mysql_native_password

# Initialize database
docker exec -i sa-mysql mysql -uroot -proot123 smart_agriculture < database/init.sql

# Backend (from backend/)
npm install
npm run dev          # Development with nodemon
npm start            # Production

# Frontend (from frontend/)
npm install
npm run dev          # Development server at http://localhost:5173
npm run build        # Production build
```

### Docker Deployment

```bash
docker-compose up -d
docker-compose down
```

## Architecture

### Frontend (Vue 3)
- **Entry:** `frontend/src/main.js`
- **Router:** `frontend/src/router/index.js` - Vue Router with auth guards
- **State:** Pinia stores in `frontend/src/stores/`
- **API Layer:** `frontend/src/api/` - Axios wrappers for backend endpoints
- **Layout:** `frontend/src/layouts/MainLayout.vue` - Sidebar + header + content structure
- **Request Handling:** `frontend/src/utils/request.js` - Axios interceptors for JWT injection and 401 handling

Dev server proxies `/api` to backend. Production build uses nginx to proxy API requests.

### Backend (Node.js + Express)
- **Entry:** `backend/src/app.js`
- **Routes:** `backend/src/routes/` - Express routers
- **Controllers:** `backend/src/controllers/` - Business logic
- **Models:** `backend/src/models/` - Sequelize ORM (17 models)
- **Auth:** `backend/src/middlewares/auth.js` - JWT verification, permission/role checks

User model uses bcrypt hooks for password hashing. Models sync with DB on startup; admin account auto-created if missing.

### Database (MySQL)
- **Port:** 12330 (mapped from container 3306)
- **Schema:** `database/init.sql` contains full DDL + seed data
- **ORM:** Sequelize with associations defined in `backend/src/models/index.js`

Key tables: `users`, `roles`, `farms`, `plots`, `devices`, `planting_plans`, `inventory`, `orders`

## Key Patterns

### Authentication Flow
1. Frontend calls `POST /api/auth/login`
2. Backend validates password with bcrypt, returns JWT
3. Frontend stores token in localStorage + Pinia
4. Axios interceptor adds `Authorization: Bearer <token>` to all requests
5. Backend `auth` middleware verifies JWT and attaches user to `req.user`

### Adding New Features
- **Backend:** Create model → Create controller → Create route → Register in `app.js`
- **Frontend:** Create view in `views/` → Add route in `router/index.js` → Create API functions in `api/`

### Permission System
- Roles have `permissions` JSON array (e.g., `["farm:*", "user:view"]`)
- Admin role has `["*"]` for full access
- Use `checkPermission()` middleware for role-based route protection

## Environment Variables

Backend `.env`:
```
DB_HOST=localhost
DB_PORT=12330
DB_USER=root
DB_PASSWORD=root123
DB_NAME=smart_agriculture
JWT_SECRET=<secret>
JWT_EXPIRES_IN=7d
PORT=8080
```

Frontend `.env`:
```
VITE_API_BASE_URL=/api
```

## Default Credentials

- Username: `admin`
- Password: `admin123`
