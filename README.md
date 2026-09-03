# 🏋️ GymLife — Professional Fitness Management & Athlete Portal

A modern, full-stack fitness management and athlete portal built with **React (Vite)**, **Django REST Framework**, and **Brevo SMTP** transactional messaging.

---

## 🌟 Key Features

* **🏋️ Athlete & Member Experience**:
  * Interactive Class Timetable with dynamic filtering by day and trainer.
  * Real-time online booking and appointment scheduling.
  * Instant branded confirmation vouchers and transactional emails via Brevo SMTP.
  * Interactive BMI Calculator & personalized fitness tool suite.
  * Multilingual interface support (English, Hindi, Marathi).

* **🛡️ Defensive Security & Anti-Hacking Layer**:
  * **Cryptographic HMAC-SHA256 Signed Tokens**: Prevents session forgery and token tampering.
  * **Sliding-Window Rate Limiting**: Multi-tiered protection against brute-force password guessing and DoS floods.
  * **Defensive HTTP Headers Middleware**: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
  * **Input Sanitization**: Neutralizes Stored/Reflected XSS and CRLF email injection attacks.
  * **RBAC & IDOR Protection**: Secure access control for customer appointments and member records.

* **📊 Complete Admin Management Portal**:
  * Real-time KPI dashboard with membership analytics.
  * Appointment approval, reschedule, and cancellation workflows.
  * Member directory and subscription plan manager.
  * Trainer profiles and weekly schedule planner.
  * Notification delivery logs and gateway self-test diagnostics.

---

## 🏗️ Project Structure

```
gymlife-project/
├── gymlife-master/
│   ├── backend/               # Django REST API Backend
│   │   ├── core/              # Core business models, views, and security layer
│   │   ├── notifications/     # Notification coordinator, Brevo SMTP, SMS, WhatsApp
│   │   ├── gymlife_project/   # Django settings and WSGI/ASGI configuration
│   │   ├── manage.py
│   │   ├── requirements.txt
│   │   └── .env.example
│   │
│   └── frontend/              # Vite React Frontend
│       ├── public/            # Static assets, fonts, icons, and custom favicon
│       ├── src/
│       │   ├── components/    # Reusable UI, navbar, modal, and dynamic meta
│       │   ├── context/       # Auth, Toast, and Language context providers
│       │   ├── pages/         # Public pages and Admin management portal
│       │   └── utils/         # API client and helper functions
│       ├── package.json
│       └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Python 3.10+**
* **Node.js 18+ & npm**

---

### 1. Backend Setup (Django)

```bash
# Navigate to backend directory
cd gymlife-master/backend

# Create and activate virtual environment
python -m venv ../venv
# Windows
..\venv\Scripts\activate
# Linux/macOS
source ../venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and insert your Brevo SMTP key & secrets

# Apply database migrations
python manage.py migrate

# (Optional) Seed sample data
python populate_db.py

# Start Django development server
python manage.py runserver 127.0.0.1:8000
```

---

### 2. Frontend Setup (React / Vite)

```bash
# Navigate to frontend directory
cd gymlife-master/frontend

# Install node dependencies
npm install

# Start development server
npm run dev
```

* **Frontend Application**: `http://localhost:5173/`
* **Backend API Gateway**: `http://127.0.0.1:8000/api/`
* **Admin Management Portal**: `http://localhost:5173/admin/dashboard`

---

## 📧 Brevo SMTP Configuration

In `gymlife-master/backend/.env`:
```ini
BREVO_SMTP_SERVER=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_LOGIN=your-login@smtp-brevo.com
BREVO_SMTP_KEY=xsmtpsib-your-key
DEFAULT_FROM_EMAIL=GymLife Fitness Arena <support.gymcenter@gmail.com>
```

---

## 🔒 Security Best Practices

* Never commit `.env` with live keys into version control (managed by `.gitignore`).
* Change `SECRET_KEY` and set `DEBUG=False` with configured `ALLOWED_HOSTS` in production.
* Run `python manage.py check` before deploying.

---

## 📄 License
MIT License. Created for GymLife Elite Fitness & Sports Arena.
