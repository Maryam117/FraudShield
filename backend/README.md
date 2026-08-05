# FraudShield Backend Service (Spring Boot 3 + Java 17)

Enterprise REST API service for **FraudShield** real-time transaction monitoring and decisioning.

## Features
- **Stateless Authentication**: JWT Auth with Spring Security & BCrypt Password Encryption.
- **Role-Based Access Control (RBAC)**: Enforces `ROLE_USER` for transaction operations and `ROLE_ADMIN` for rule & fraud case administration.
- **Synchronous Fraud Engine**: Evaluates transactions against active baseline risk rules (High Amount, Velocity Spike, Geo/IP Anomaly, High-Risk Merchant).
- **Audit Logging**: Automatic audit trail generation for system events.
- **CSV Reporting**: Endpoint for exporting historical fraud logs (`/api/reports/export/csv`).

---

## How to Run

### Prerequisites
1. Java 17+ installed (`java -version`).
2. MySQL running locally with `fraudshield_db` database initialized (see `FraudShield/db/README.md`).

### Running the App

```bash
# Navigate to backend directory
cd FraudShield/backend

# Run with Maven (or Maven Wrapper)
mvn spring-boot:run
```

The server will start at: `http://localhost:8080`

---

## Key API Endpoints

- **Auth**: `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`
- **Transactions**: `POST /api/transactions`, `GET /api/transactions/my`, `GET /api/transactions/{id}`
- **Rules (Admin)**: `GET /api/rules`, `PUT /api/rules/{id}`, `PATCH /api/rules/{id}/toggle`
- **Admin Management**: `GET /api/admin/analytics`, `GET /api/admin/alerts`, `PUT /api/admin/alerts/{id}/resolve`, `GET /api/admin/audit-logs`
- **Reports (Admin)**: `GET /api/reports/export/csv`
