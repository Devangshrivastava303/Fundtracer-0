# FundTracer

A web-based app for transparency of funds for donors and verification of campaigns/NGOs.

---

## Getting Started

### 1️ Install Backend Dependencies

cd ../frontend
npm install
# or yarn install
# or pnpm install
Start the frontend dev server:

bash
Copy code
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
Frontend will run at: http://localhost:3000

*Setup Database (PostgreSQL)*

Download and install PostgreSQL 18 (latest version)
 [link](https://www.postgresql.org/download/)

Create a database (e.g., fundtracer_dbs)

Update your backend/settings.py:

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'fundtracer_dbs',  # your database name
        'USER': 'postgres',         # your postgres username
        'PASSWORD': 'your_password',# your postgres password
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

RUN this command in you /backend to create the same database for no clash

python manage.py makemigrations
python manage.py migrate


If there is an old __init__.py or other old migrations causing conflicts, delete them first and then rerun the commands.

*Run Servers*

Run frontend and backend in separate terminals:

# Backend
cd backend
python manage.py runserver

# Frontend
cd frontend
npm run dev


Backend: http://127.0.0.1:8000

Frontend: http://localhost:3000


*Test Signup & Login*

Open the frontend URL in a browser (or incognito to avoid old localStorage issues).

Create a new user with signup form.

Login using the new user credentials.

Check database tables (auth_user and accounts_profile) to verify the user is saved:
###
Open “SQL Shell (psql)” from Start Menu.

Enter values when prompted:

Server [localhost]: localhost
Database [postgres]: fundtracer_dbs
Port [5432]: 5432
Username [postgres]: postgres
Password: <your_password>


If successful, you will see:

fundtracer_dbs=#

2️⃣ Show All Tables (IMPORTANT)
\dt


You should see something like:

 Schema |        Name        | Type  |  Owner
--------+--------------------+-------+----------
 public | auth_user          | table | postgres
 public | accounts_profile   | table | postgres
 public | django_migrations  | table | postgres
 public | django_session     | table | postgres


✔ This confirms Django is connected to PostgreSQL

3️⃣ Check Registered Users (Signup Verification)
SELECT id, username, email, is_staff, is_superuser
FROM auth_user;


👉 Every signup creates one row here

4️⃣ Check User Profiles (Role + Name)
SELECT id, full_name, role, user_id
FROM accounts_profile;


This confirms:

Full name saved

Role saved (donor / ngo / admin)

Linked to auth_user

Join User + Profile (MOST IMPORTANT QUERY)
SELECT 
    u.username,
    u.email,
    p.full_name,
    p.role
FROM auth_user u
JOIN accounts_profile p
ON u.id = p.user_id;


✔ This proves:

Signup works

Backend is saving data correctly

Frontend → Backend → Database is SUCCESSFUL

###

or you can use
![alt text](image.png)

this cmd sql
![alt text](image-1.png)
these cmds


### Debugging Common Issues
⚠ Cross-Origin Requests (CORS)

If you see warnings like:

Cross origin request detected from 192.168.1.4 to /_next/*


Fix:

Restart the frontend server

Make sure django-cors-headers is installed and configured in settings.py:

INSTALLED_APPS = [
    ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

CORS_ALLOW_ALL_ORIGINS = True  # for dev only