# FraudShield: Real-Time Transaction Monitoring & Fraud Decisioning System

**FraudShield** is an enterprise-grade real-time transaction monitoring, decisioning, and risk management platform built using a modern decoupled 3-tier microservice architecture:
- **`db/`**: MySQL DDL/DML database scripts (`schema.sql` & `data.sql`) and phpMyAdmin setup guide (`http://localhost/phpmyadmin/`).
- **`backend/`**: Java 17 Spring Boot REST API service with Spring Security, JWT authentication, dynamic synchronous Fraud Engine, JPA persistence, and CSV reporting.
- **`frontend/`**: Modern React SPA (Vite + Tailwind CSS + Lucide Icons + Recharts) featuring role-based portals (User Payment submission vs Admin Executive Dashboard, Case Triage Workbench, Rule Configuration Engine).

---

## Folder Structure

```
FraudShield/
├── db/                       # Database initialization & phpMyAdmin scripts
│   ├── schema.sql            # Table definitions (users, transactions, fraud_rules, fraud_alerts, audit_logs)
│   ├── data.sql              # Seed data (Admin/User accounts, baseline rules, sample transactions & alerts)
│   └── README.md             # phpMyAdmin setup tutorial (http://localhost/phpmyadmin/)
├── backend/                  # Spring Boot 3 Java 17 REST API Backend Service
│   ├── pom.xml               # Maven configuration
│   ├── src/main/java/com/fraudshield/
│   │   ├── FraudShieldApplication.java
│   │   ├── config/           # SecurityConfig, CORS, BCrypt
│   │   ├── security/         # JWT filter, UserDetails, Token provider
│   │   ├── entity/           # User, Transaction, FraudRule, FraudAlert, AuditLog
│   │   ├── dto/              # Auth, Transaction, Rule, Alert DTOs
│   │   ├── repository/       # JPA Repositories
│   │   ├── service/          # AuthService, FraudEngineService, TransactionService, RuleService, AlertService
│   │   └── controller/       # AuthController, TransactionController, RuleController, AdminController, ReportController
│   └── README.md             # Backend execution guide
└── frontend/                 # React 18 SPA Frontend Application
    ├── package.json          # Vite, Tailwind CSS, Lucide Icons, Recharts, Axios
    ├── src/
    │   ├── context/          # AuthContext, ToastContext
    │   ├── services/         # API Service layer & mock fallbacks
    │   ├── components font/  # Navbar, Sidebar, MetricCard, StatusBadge, RiskBadge, Modal
    │   └── pages/            # Login, Register, UserDashboard, NewTransaction, AdminDashboard, AlertManagement, RuleEngine, AnalyticsReport, AuditLogs
    └── README.md             # Frontend execution guide
```

---

## Quick Start Guide

### 1. Database Setup (`http://localhost/phpmyadmin/`)
1. Open phpMyAdmin at `http://localhost/phpmyadmin/`.
2. Create a new database named `fraudshield_db`.
3. Import `FraudShield/db/schema.sql` into `fraudshield_db`.
4. Import `FraudShield/db/data.sql` into `fraudshield_db`.

### 2. Backend Service Setup (Port 8080)
```bash
cd FraudShield/backend
mvn spring-boot:run
```

### 3. Frontend Web Portal (Port 5173)
```bash
cd FraudShield/frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Seed Credentials & Demo Access

| Role | Username | Password | Purpose |
|---|---|---|---|
| **System Admin** | `admin` | `admin123` | Executive risk dashboard, rule engine control, fraud case triage workbench |
| **Standard User 1** | `user1` | `password123` | Submit payment transfers, view risk decisioning feedback |
| **Standard User 2** | `user2` | `password123` | Additional client transaction ledger |
