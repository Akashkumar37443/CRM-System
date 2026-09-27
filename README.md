# 🏢 Enterprise CRM System

A full-featured Customer Relationship Management system built with .NET 9 Web API, React, Entity Framework Core, and MS SQL Server.

![.NET Core](https://img.shields.io/badge/.NET-9.0-blue) ![React](https://img.shields.io/badge/React-18-61dafb) ![MS SQL](https://img.shields.io/badge/MS_SQL-Server-red) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4)

## ✨ Features

- **Dashboard** — KPI cards, pipeline charts, revenue trends, activity feed
- **Contacts** — Full CRUD, search, company linking, status tracking
- **Companies** — Account management, industry tagging, revenue tracking
- **Deals Pipeline** — Kanban board with stage management, deal cards
- **Tasks** — Task management with priorities, types, due dates, overdue detection
- **Reports** — Revenue analytics, pipeline analysis, team performance metrics
- **Settings** — Profile management, notification preferences, theme selection
- **Authentication** — JWT-based login with secure password hashing

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS v4 |
| Backend | .NET 9 Web API (C#) |
| ORM | Entity Framework Core 9 |
| Database | MS SQL Server |
| Auth | JWT Bearer Authentication |
| Charts | Recharts |
| Icons | Lucide React |

## 📁 Project Structure

```
CRM-System/
├── backend/                     # .NET Web API
│   ├── CRM.API/                 # Controllers, Program.cs
│   ├── CRM.Core/                # Domain entities, DTOs, interfaces
│   ├── CRM.Infrastructure/      # EF Core, repositories
│   └── CRM.sln
├── frontend/                    # React app (Vite)
│   ├── src/
│   │   ├── components/          # Layout, reusable components
│   │   ├── pages/               # Dashboard, Contacts, Companies, etc.
│   │   ├── services/            # Axios API layer
│   │   └── context/             # Auth context
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/) (LocalDB or Express)

### 1. Configure Database

Update the connection string in `backend/CRM.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=CRM_Enterprise;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
  }
}
```

### 2. Run Backend

```bash
cd backend
dotnet run --project CRM.API
```

The API will start at `http://localhost:5000`

### 3. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will open at `http://localhost:5173`

### 4. Login

Use the demo credentials:
- **Email:** `admin@crm.com`
- **Password:** `Admin@123`

## 📡 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/login` | POST | Login |
| `/api/auth/register` | POST | Register |
| `/api/dashboard` | GET | Dashboard KPIs |
| `/api/contacts` | GET/POST | List/Create contacts |
| `/api/contacts/{id}` | GET/PUT/DELETE | Get/Update/Delete contact |
| `/api/companies` | GET/POST | List/Create companies |
| `/api/deals` | GET/POST | List/Create deals |
| `/api/tasks` | GET/POST | List/Create tasks |
| `/api/activities` | GET | Recent activities |

## 📝 License

MIT
