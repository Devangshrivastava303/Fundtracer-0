# FundTracer 🎯

A web-based application for **transparency of funds** for donors and **verification of campaigns/NGOs**. FundTracer ensures that charitable contributions reach their intended beneficiaries with complete transparency.

## 📋 About the Project

FundTracer is a platform that bridges the gap between donors and campaigns by providing:
- **Real-time fund tracking** - Monitor where your donations go
- **Campaign verification** - Verify legitimacy of campaigns and NGOs
- **Transparent reporting** - Detailed financial reports from organizations
- **Donor confidence** - Build trust through transparency

---

## 🏗️ Tech Stack

### Backend
- **Framework**: Django 5.0+
- **API**: Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Storage**: AWS S3 (via django-storages)

### Frontend
- **Framework**: Next.js 15+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: React Hooks
- **API Client**: Axios

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 12+
- Git

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure database (update settings.py with your PostgreSQL credentials)
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

Backend will run at: `http://127.0.0.1:8000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will run at: `http://localhost:3000`

---

## 📁 Project Structure

```
fundtracer/
├── backend/
│   ├── accounts/          # User authentication & profiles
│   ├── campaigns/         # Campaign management
│   ├── donations/         # Donation tracking
│   ├── notifications/     # Notification system
│   ├── core/              # Admin & utilities
│   ├── backend/           # Django settings
│   └── manage.py
├── frontend/
│   ├── app/               # Next.js pages
│   ├── components/        # Reusable components
│   ├── lib/               # Utility functions
│   ├── public/            # Static assets
│   └── package.json
├── README.md
├── .gitignore
└── requirements.txt
```

---

## 🔑 Key Features

- ✅ User authentication & profiles
- ✅ Campaign creation & management
- ✅ Real-time donation tracking
- ✅ Admin verification system
- ✅ Responsive UI (Mobile, Tablet, Desktop)
- ✅ Search & filter campaigns
- ✅ Donor dashboard & history
- ✅ Campaign documentation
- ✅ Live statistics

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

---

## 📝 API Documentation

API endpoints will be documented at `/api/docs/` once the project is deployed.

### Main Endpoints
- `POST /api/auth/signup/` - User registration
- `POST /api/auth/login/` - User login
- `GET /api/campaigns/` - List campaigns
- `POST /api/campaigns/` - Create campaign
- `POST /api/donations/` - Create donation
- `GET /api/donations/` - Donation history

---

## 🔐 Environment Variables

Create `.env` files in both backend and frontend directories.

### Backend `.env`
```
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_NAME=fundtracer_dbs
DATABASE_USER=postgres
DATABASE_PASSWORD=your-password
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Commit: `git commit -m "feat: description"`
4. Push: `git push origin feature/your-feature`
5. Create Pull Request

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 👨‍💻 Authors

- **FundTracer Team** - Hackathon 2026

---

## 📞 Support

For issues and feature requests, please create an issue on GitHub.

---

**Built with ❤️ for transparency in charitable giving.**
