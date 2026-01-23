# FundTracer - Commit Guide

## ✅ COMMIT 1: Initial Project Setup
**Message:** `Initial project setup with Django backend and Next.js frontend`

### Files to stage and commit:
```
.gitignore
README.md
CONTRIBUTING.md
requirements.txt
```

### What's included:
- Project documentation and structure
- Contribution guidelines
- Python dependencies
- Git ignore patterns

---

## ✅ COMMIT 2: Backend Models & Database Schema
**Message:** `Add core models for accounts, campaigns, and donations`

### Files to stage and commit:
```
backend/backend/settings.py
backend/backend/urls.py
backend/backend/asgi.py
backend/backend/wsgi.py
backend/backend/__init__.py
backend/manage.py

backend/accounts/
  __init__.py
  apps.py
  models.py
  migrations/
    __init__.py
    0001_initial.py

backend/campaigns/
  __init__.py
  apps.py
  models.py
  migrations/
    __init__.py
    0001_initial.py

backend/donations/
  __init__.py
  apps.py
  models.py
  migrations/
    __init__.py
    0001_initial.py

backend/core/
  __init__.py
  apps.py
  models.py
  exceptions.py
  permissions.py

backend/notifications/
  __init__.py
  apps.py
  migrations/
    __init__.py
```

### What's included:
- User model (UUID primary key, email authentication)
- Campaign & CampaignCategory models
- Donation & DonationReceipt models
- NGO model for organization verification
- All database migrations
- Django settings with PostgreSQL configuration
- Core permissions and exceptions
- App configurations

---

## 🚀 How to Commit (GitHub Desktop)

1. **Commit 1 - Initial Setup:**
   - Select `.gitignore`, `README.md`, `CONTRIBUTING.md`, `requirements.txt`
   - Commit message: `Initial project setup with Django backend and Next.js frontend`

2. **Commit 2 - Backend Models:**
   - Select all files listed in Commit 2 section above
   - Commit message: `Add core models for accounts, campaigns, and donations`

3. **Push to Origin:**
   - After both commits, click "Push origin"

---

## 📊 Statistics

| Commit | Files | Type | Status |
|--------|-------|------|--------|
| 1 | 4 | Config/Docs | ✅ Ready |
| 2 | 30+ | Backend/Models | ✅ Ready |

---

## ⚠️ Important Notes

- DO NOT commit serializers, views, or URLs yet (those are for Commit 3)
- Migrations are included in Commit 2
- Database credentials should be added to `.env` before running migrations
- Use PostgreSQL as specified in settings.py
