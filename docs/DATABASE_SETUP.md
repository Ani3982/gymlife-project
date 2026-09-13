# 🏋️ GymLife Database Architecture & Migration Guide

This document details the database architecture, Supabase PostgreSQL configuration, backup protocols, verification suites, and rollback procedures for the **GymLife** platform.

---

## 🏗️ 1. Architecture Overview

```
                      GYMLIFE
                         │
                         ▼
                Frontend Application (React / Vite)
                         │
                         ▼
                Django REST Framework API Gateway
                         │
                         ▼
               PostgreSQL / Supabase (Single Source of Truth)
                         │
       ┌─────────────────┼──────────────────┐
       ▼                 ▼                  ▼
    Members         Appointments         Payments
    Trainers        Memberships          Attendance
    Classes         Bookings             Admin Data
                         │
                         │
              ┌──────────┴───────────┐
              ▼                      ▼
        Firebase Auth          Firebase FCM
              │                      │
         Google Login            Push Alerts
                                     │
                                     ▼
                               Member Browser
```

* **Relational Single Source of Truth**: Supabase PostgreSQL (Production) / SQLite 3 (Development Fallback).
* **Transactional Email**: Brevo SMTP (`notifications/services/email_service.py`).
* **Carrier SMS**: Fast2SMS API (`notifications/services/sms_service.py`).
* **Client Auth & Push**: Firebase Auth & Firebase Cloud Messaging (`notifications/services/firebase_service.py`).

---

## 🗄️ 2. Database Environments & Dynamic Switching

Django dynamically inspects `DATABASE_URL` in [`backend/.env`](file:///c:/Users/hp/Downloads/gymlife-project-main/gymlife-project-main/gymlife-master/backend/.env):

```python
# backend/gymlife_project/settings.py
DATABASE_URL_CONFIG = config('DATABASE_URL', default='').strip()
if not DATABASE_URL_CONFIG:
    DATABASE_URL_CONFIG = f"sqlite:///{BASE_DIR / 'db.sqlite3'}"

DATABASES = {
    'default': dj_database_url.parse(
        DATABASE_URL_CONFIG,
        conn_max_age=600,
        conn_health_checks=True,
    )
}
```

* **Local Development**: Leave `DATABASE_URL=` empty in `.env`. Django seamlessly utilizes local [`backend/db.sqlite3`](file:///c:/Users/hp/Downloads/gymlife-project-main/gymlife-project-main/gymlife-master/backend/db.sqlite3).
* **Production**: Populate `DATABASE_URL` with your Supabase PostgreSQL connection string.

---

## ⚡ 3. Supabase Project Setup & Connection String

1. Create a free project at [supabase.com](https://supabase.com/).
2. Navigate to **Project Settings** → **Database** → **Connection string** → **URI**.
3. Select **Transaction Pooler** (Port `6543`) or **Direct Connection** (Port `5432`).
4. Format:
   ```ini
   DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
   ```

---

## 🚀 4. Automated Migration to Supabase

To migrate all existing SQLite tables, user accounts, and business records to Supabase:

```bash
# Navigate to backend
cd gymlife-master/backend

# Activate virtualenv
..\venv\Scripts\activate

# Run the automated migration engine
python migrate_to_postgres.py --database-url "postgresql://postgres.[ref]:[password]@[host]:6543/postgres?sslmode=require"
```

The script automatically executes:
1. Schema migration (`python manage.py migrate`) against Supabase PostgreSQL.
2. Data loading (`python manage.py loaddata gymlife_backup.json`).
3. Automated row-by-row and foreign key verification.

---

## 🔍 5. Verification Suite

Run the built-in management command at any time to verify data integrity:

```bash
python manage.py verify_database_migration
```

### Expected Output Matrix:
```
=================================================================
      GymLife Database Migration & Relationship Verification     
=================================================================

Active Database Engine: django.db.backends.postgresql
Active Database Target: postgres
---------------------------------------------------------------------------
MODEL                          | Expected (Backup) | Active DB  | Diff   | Status
---------------------------------------------------------------------------
auth.user                      | 4                 | 4          | 0      | PASS
core.adminprofile              | 2                 | 2          | 0      | PASS
core.service                   | 4                 | 4          | 0      | PASS
core.trainer                   | 4                 | 4          | 0      | PASS
core.classitem                 | 5                 | 5          | 0      | PASS
core.classschedule             | 27                | 27         | 0      | PASS
core.pricingplan               | 3                 | 3          | 0      | PASS
core.member                    | 5                 | 5          | 0      | PASS
core.payment                   | 5                 | 5          | 0      | PASS
core.booking                   | 4                 | 4          | 0      | PASS
core.appointment               | 26                | 26         | 0      | PASS
core.blogpost                  | 3                 | 3          | 0      | PASS
core.galleryitem               | 9                 | 9          | 0      | PASS
core.contactmessage            | 3                 | 3          | 0      | PASS
core.contactinfo               | 1                 | 1          | 0      | PASS
core.gymsettings               | 1                 | 1          | 0      | PASS
core.notification              | 4                 | 4          | 0      | PASS
core.auditlog                  | 1                 | 1          | 0      | PASS
notifications.notificationlog  | 8                 | 8          | 0      | PASS
---------------------------------------------------------------------------

[Relational Integrity Verification]
  [OK] Admin Profiles with valid User FK             (0 orphaned)
  [OK] Members with assigned Membership Plan         (5/5 members linked)
  [OK] Payments with valid Member FK                 (5/5 linked)
  [OK] Classes linked to Trainers                    (5/5 classes linked)
  [OK] Class Schedules linked to Class Items         (27/27 linked)
  [OK] Bookings & Appointments queryable             (4 bookings)
  [OK] Notification logs queryable                   (8 logs verified)

[SUCCESS] Database integrity and row count verification PASSED with 0 discrepancies.
```

---

## 📦 6. Backup Protocol

* **Create a Fresh JSON Dump**:
  ```bash
  python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission --indent 2 -o gymlife_backup.json
  ```
* **Local SQLite Binary Backups**:
  Stored in [`backend/backups/`](file:///c:/Users/hp/Downloads/gymlife-project-main/gymlife-project-main/gymlife-master/backend/backups/).

---

## 🔄 7. Instant Rollback Procedure

If you ever need to revert from PostgreSQL back to local SQLite:
1. Open [`backend/.env`](file:///c:/Users/hp/Downloads/gymlife-project-main/gymlife-project-main/gymlife-master/backend/.env).
2. Set `DATABASE_URL=` (leave blank).
3. Restart Django server (`python manage.py runserver`).
4. Django will immediately resume using [`backend/db.sqlite3`](file:///c:/Users/hp/Downloads/gymlife-project-main/gymlife-project-main/gymlife-master/backend/db.sqlite3) with zero data loss.
