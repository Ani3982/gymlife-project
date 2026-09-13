# 🚀 GymLife Production Deployment Guide

This guide details the step-by-step production deployment procedure for the **GymLife** full-stack platform.

---

## 📋 1. Production Environment Variables Checklist

Ensure the following variables are configured in production environment / secret manager:

```ini
# Core Django Settings
DEBUG=False
SECRET_KEY=your-generated-random-50-char-secret-key
ALLOWED_HOSTS=api.gymlife.com,gymlife.com,localhost
CORS_ALLOWED_ORIGINS=https://gymlife.com,https://app.gymlife.com
CSRF_TRUSTED_ORIGINS=https://gymlife.com,https://app.gymlife.com

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require

# Firebase Authentication & FCM Push
FIREBASE_PROJECT_ID=gymlife-fitness-portal
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@gymlife-fitness-portal.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CREDENTIALS_PATH=

# Brevo SMTP (Transactional Emails)
BREVO_SMTP_SERVER=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_LOGIN=your-brevo-login@smtp-brevo.com
BREVO_SMTP_KEY=xsmtpsib-your-smtp-api-key
DEFAULT_FROM_EMAIL=GymLife Fitness Arena <support.gymcenter@gmail.com>

# Carrier SMS Gateway
FAST2SMS_API_KEY=your-fast2sms-api-key
```

---

## 🏗️ 2. Build & Asset Compilation

```bash
# 1. Build React Frontend Production Bundle
cd gymlife-master/frontend
npm install
npm run build

# 2. Collect Django Static Files
cd ../backend
python -m venv ../venv
source ../venv/bin/activate  # (..\venv\Scripts\activate on Windows)
pip install -r requirements.txt
python manage.py collectstatic --noinput
```

---

## 🗄️ 3. Apply Migrations to Supabase

```bash
python manage.py migrate
python manage.py verify_database_migration
```

---

## 🛡️ 4. Security Check

Run Django's deployment checklist to verify SSL, cookie security, and middleware:

```bash
python manage.py check --deploy
```

---

## 🌐 5. Production WSGI Web Server Execution

### Linux (Gunicorn + Uvicorn/Waitress + Nginx):
```bash
gunicorn gymlife_project.wsgi:application --bind 0.0.0.0:8000 --workers 4 --threads 2 --timeout 60
```

### Windows Server (Waitress):
```cmd
waitress-serve --port=8000 gymlife_project.wsgi:application
```
