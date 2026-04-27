# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

云上丽水农业乡村 (Yunshang Lishui Agriculture) - A full-stack Vue 3 + Node.js + MySQL application for managing agricultural operations including farms, devices, planting, inventory, sales, weather monitoring, greenhouse management, and IoT device control.

## Development Commands

### Local Development

```bash
# Start MySQL container
docker run -d --name sa-mysql -p 12330:3306 \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -e MYSQL_DATABASE=smart_agriculture \
  mysql:8.0 --default-authentication-plugin=mysql_native_password

# Initialize database (base schema)
docker exec -i sa-mysql mysql -uroot -proot123 smart_agriculture < database/init.sql

# Run database extensions (device_types, greenhouses, alert_rules, alert_messages)
docker exec -i sa-mysql mysql -uroot -proot123 smart_agriculture < database/extend.sql

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

# Deploy to production server
ssh opc@138.2.81.121 "cd ~/smart-agriculture && git pull && docker-compose up -d --build"
```

## Architecture

### Frontend (Vue 3)
- **Entry:** `frontend/src/main.js`
- **Router:** `frontend/src/router/index.js` - Vue Router with auth guards, routes organized by module
- **State:** Pinia stores in `frontend/src/stores/`
- **API Layer:** `frontend/src/api/` - Axios wrappers matching backend endpoints
- **Layout:** `frontend/src/layouts/MainLayout.vue` - Sidebar + header + content
- **Request Handling:** `frontend/src/utils/request.js` - Axios interceptors for JWT injection and 401 handling
- **Big Screen:** `frontend/src/views/BigScreen.vue` - Full-screen data visualization with Leaflet map

Dev server proxies `/api` to backend. Production uses nginx to proxy API requests.

### Backend (Node.js + Express)
- **Entry:** `backend/src/app.js` - Registers all routes
- **Routes:** `backend/src/routes/` - Express routers (auth, user, farm, device, deviceType, greenhouse, weather, alert, etc.)
- **Controllers:** `backend/src/controllers/` - Business logic per module
- **Models:** `backend/src/models/` - Sequelize ORM (22 models)
- **Auth:** `backend/src/middlewares/auth.js` - JWT verification, permission/role checks

Models sync with DB on startup; admin account auto-created if missing.

### Database (MySQL)
- **Schema:** `database/init.sql` - Base DDL + seed data
- **Extensions:** `database/extend.sql` - Device types, greenhouses, alert tables (run after init.sql)
- **ORM:** Sequelize with associations defined in `backend/src/models/index.js`

Key tables: `users`, `roles`, `farms`, `plots`, `devices`, `device_types`, `greenhouses`, `planting_plans`, `inventory`, `orders`, `alert_rules`, `alert_messages`

## Key Patterns

### Authentication Flow
1. Frontend calls `POST /api/auth/login`
2. Backend validates password with bcrypt, returns JWT
3. Frontend stores token in localStorage + Pinia
4. Axios interceptor adds `Authorization: Bearer <token>` to all requests
5. Backend `auth` middleware verifies JWT and attaches user to `req.user`

### Adding New Features
- **Backend:** Create model in `models/` → Create controller in `controllers/` → Create route in `routes/` → Register in `app.js` → Add associations in `models/index.js`
- **Frontend:** Create view in `views/<module>/` → Add route in `router/index.js` → Create API functions in `api/<module>.js`

### Permission System
- Roles have `permissions` JSON array (e.g., `["farm:*", "user:view"]`)
- Admin role has `["*"]` for full access
- Use `checkPermission()` middleware for role-based route protection

### Big Screen Map (Leaflet)
- Uses CartoDB dark tile layer (no API key required)
- Farm markers show name labels, device markers show status dots
- Default center: Lishui, Zhejiang (28.46, 119.92)

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

## Production Deployment

- **Server:** `opc@138.2.81.121`
- **Project directory:** `/home/opc/smart-agriculture`
- **Access URL:** https://arm.ajiu.lol:12350
- **Repository:** https://github.com/greathaoqi/smart-agriculture.git
- **Branch:** main