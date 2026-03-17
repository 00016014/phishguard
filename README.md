# PhishGuard - AI-Powered Phishing Protection Platform

PhishGuard is a comprehensive, full-stack cybersecurity platform designed to detect, analyze, and educate users about phishing threats. It features a modern AI-driven scanning engine, an interactive learning laboratory, and a robust administrative management system.

## 🏗️ Architecture: Monorepo Structure

The project is organized into a monorepo for seamless management of frontend and backend services.

- **`/frontend`**: Next.js 15 application (App Router, TypeScript, Tailwind CSS).
- **`/backend`**: Django REST Framework (Python 3, SQLite3, persistent storage).

### 🚀 Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   cd frontend && npm install
   ```

2. **Initialize Database & Seed Data**:
   ```bash
   # In the root directory
   npm run seed
   cd backend && python manage.py seed_content
   ```

3. **Start Development Servers**:
   ```bash
   # Starts Frontend (Port 4028) and Backend (Port 8000)
   npm run dev
   ```

---

## 🛠️ Core Features & Technical Modules

### 1. Scan & Detect Hub (`/scan-detect-hub`)
- **Engine**: Python-based heuristic analysis.
- **Support**: Real-time analysis of URLs and Email content.
- **Functionality**: Checks for suspicious TLDs, brand impersonation keywords, urgency tactics, and unencrypted links.
- **History**: All scans are saved to the SQLite database and tied to the user profile.

### 2. Interactive Learning Lab (`/interactive-learning-lab`)
- **Gamification**: Users earn points and streaks by completing modules.
- **Challanges**:
  - **Quizzes**: Knowledge-based assessments.
  - **Simulations**: Hands-on identification of real-world phishing examples (Emails, SMS).
- **Leaderboard**: Real-time ranking of users based on earned security points.

### 3. Threat Intelligence Database (`/threat-intelligence-database`)
- **Dynamic Catalog**: Full searchable and filterable database of active phishing threats.
- **Details**: Detailed analysis, prevention tips, and community insights for each threat.
- **Reporting**: Community-driven reporting system allowing users to submit new threats for moderation.

### 4. Personal Dashboard (`/personal-dashboard`)
- **Security Score**: Aggregated metric based on scan history and learning progress.
- **Activity Tracking**: Visual representation of recent scans and learning trends.
- **Subscription Limits**: Tier-based restriction handling (Free vs Pro).

### 5. Admin Panel (`/admin`)
- **Moderation**: Approve, reject, or resolve community-submitted threat reports.
- **User Management**: Search, suspend, activate, or delete user accounts.
- **System Health**: Real-time audit logs (INFO, WARN, ERROR) and service monitoring.

---

## 🔐 Authentication & Security

- **System**: Custom Django session-based authentication.
- **Persistence**: Cross-origin cookies (Samesite: Lax) enabled between Port 4028 and Port 8000.
- **Bypass**: Neutralized common browser extension errors (MetaMask) via mock script injection in the Root Layout.
- **Signals**: Django Signals automatically create and manage `UserProfile` instances for all users.

### 🔑 Credentials (Seeded)
- **Admin**: `admin` / `admin123`
- **Users**: `alice`, `bob`, `sarah`, `marcus` / `user123`

---

## 📡 API Documentation
The API is available at `http://localhost:8000/api/`.
- **/users/**: Login, logout, profile, and dashboard data.
- **/scans/**: Perform and retrieve scan history.
- **/learning-lab/**: Challenges, stats, and leaderboard.
- **/content/**: Dynamic site text, testimonials, and features.
- **/admin/**: Administrative overview and control actions.

## 📚 Project Docs (Developer + Owner)

Detailed internal documentation is available in `docs/`:

- `docs/01-architecture.md` - architecture and ownership view
- `docs/02-database-schema.md` - database schema and ERD
- `docs/03-user-flows.md` - end-to-end user/admin workflows
- `docs/04-backend-function-reference.md` - backend function and action reference
- `docs/05-frontend-function-reference.md` - frontend service/context function reference
- `docs/06-api-endpoint-map.md` - route map and integration contracts

---

## 👨‍💻 Note for Future Agents
- **API Origin**: Always use `http://localhost:8000` (not `127.0.0.1`) to ensure browser cookies are correctly associated.
- **CSRF**: The API uses `@csrf_exempt` for development ease; ensure standard DRF protection is re-enabled for production.
- **Database**: The `db.sqlite3` file in `/backend` is the single source of truth for all users and content.

---
*Built with Next.js 15, Django REST Framework, and Tailwind CSS.*
