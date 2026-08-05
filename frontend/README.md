# FraudShield Frontend Portal (React 18 + Vite + Tailwind CSS)

High-performance Single Page Application (SPA) offering intuitive user portals, real-time alert notifications, executive dashboards, and fraud rule management.

## Key Features
- **Dual Role Interfaces**: Customized dashboards for Standard Users (Transaction submission & history) vs. Risk Officers (Executive analytics, case triage workbench, rule config, CSV exports, audit logs).
- **Design System**: Glassmorphism cards, dark mode aesthetics, dynamic risk badges, and interactive Recharts visualizations.
- **One-Click Demo Authentication**: Instant login buttons for Admin (`admin`/`admin123`) and User (`user1`/`password123`) for effortless evaluation.
- **Automated Fallback**: Built-in mock data fallback layer allowing complete UI walkthrough even when offline or before backend is booted up.

---

## How to Run

### Prerequisites
- Node.js 18+ and npm installed (`node -v`).

### Running Locally

```bash
# Navigate to frontend folder
cd FraudShield/frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

The application will launch at: `http://localhost:5173`
