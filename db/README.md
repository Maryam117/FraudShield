# FraudShield Database Setup Guide

This directory contains the MySQL Database Initialization scripts for **FraudShield**.

## Prerequisites
- **MySQL Server** (v8.0 or v5.7+) or **XAMPP / WAMP / Laragon** running locally.
- **phpMyAdmin** accessible at: `http://localhost/phpmyadmin/`

---

## Step-by-Step Installation via phpMyAdmin

### Option A: Automatic Import (Recommended)

1. **Open phpMyAdmin**: Navigate to `http://localhost/phpmyadmin/` in your browser.
2. **Create Database**:
   - Click on **Databases** tab.
   - Enter Database Name: `fraudshield_db`
   - Select Collation: `utf8mb4_unicode_ci`
   - Click **Create**.
3. **Import Schema (DDL)**:
   - Select `fraudshield_db` from the left sidebar.
   - Click the **Import** tab.
   - Click **Choose File** and select `schema.sql` from `FraudShield/db/schema.sql`.
   - Scroll down and click **Import** (or **Go**).
4. **Import Seed Data (DML)**:
   - Stay inside `fraudshield_db`.
   - Click the **Import** tab again.
   - Click **Choose File** and select `data.sql` from `FraudShield/db/data.sql`.
   - Click **Import** (or **Go**).

---

### Option B: Command Line (MySQL CLI)

If you have MySQL CLI added to your PATH or XAMPP terminal, you can run:

```bash
mysql -u root -p < schema.sql
mysql -u root -p fraudshield_db < data.sql
```

---

## Default Credentials Seeded in Database

| Role | Username | Password | Email |
|---|---|---|---|
| **System Admin** | `admin` | `admin123` | admin@fraudshield.io |
| **Standard User 1** | `user1` | `password123` | john.doe@example.com |
| **Standard User 2** | `user2` | `password123` | sarah.connor@example.com |

---

## Database Schema Tables Overview

- `users`: User profiles, BCrypt encrypted credentials, and role permissions (`ROLE_USER`, `ROLE_ADMIN`).
- `fraud_rules`: Configurable baseline dynamic rules (High amount threshold, velocity spike, geo anomaly, high risk merchants).
- `transactions`: Complete transaction ledger with calculated risk scores, triggered rule codes, and statuses (`APPROVED`, `SUSPICIOUS`, `REJECTED`, `PENDING_REVIEW`).
- `fraud_alerts`: Risk management alerts assigned to admins for investigation.
- `audit_logs`: Enterprise compliance logging for system events and security operations.
