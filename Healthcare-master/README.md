# Healthcare MVP - AI-Powered Healthcare Prototype

⚠️ **CRITICAL WARNING: DO NOT USE REAL PHI - PROTOTYPE ONLY** ⚠️

This is a prototype healthcare application for demonstration purposes only. It is NOT intended for use with real patient data, protected health information (PHI), or in clinical settings. All data should be synthetic and for testing purposes only.

## Features

- **AI-Powered Triage**: Symptom assessment with safety-first recommendations
- **Televisit Scheduling**: Meeting management with AI-generated SOAP notes
- **Real-time Chat**: Secure 1:1 messaging between patients and clinicians
- **Remote Patient Monitoring**: Vitals ingestion with automated alerting
- **Role-Based Access**: Patient/Clinician/Admin roles with appropriate permissions
- **Consent Management**: Explicit consent required for transcript persistence

## Requirements

- Node.js 18 or 20
- npm
## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

3. **Start the application:**
   ```bash
   npm run dev
   ```

The application will be available at http://localhost:5173 (frontend) and http://localhost:3001 (API).

## Test Users

- **Clinician**: doc1@example.com / password123
- **Patient**: pat1@example.com / password123

## API Endpoints

- `POST /api/auth/login` - User authentication
- `POST /api/triage` - AI-powered symptom triage
- `POST /api/meetings` - Schedule televisits
- `POST /api/meetings/:id/transcript` - Upload meeting transcripts
- `POST /api/meetings/:id/summary` - Generate AI summaries
- `POST /api/rpm` - Ingest RPM data with alerting
- `POST /api/chat/channels` - Create chat channels
- `POST /api/ai/decision` - Log AI decision confirmations

## Testing

```bash
npm test
```

## Compliance TODOs for Production

❌ **This prototype is NOT production-ready. Required for compliance:**

1. **HIPAA Compliance**: Business Associate Agreement (BAA) with all vendors
2. **Data Security**: Encryption at rest and in transit
3. **Audit Logging**: Comprehensive access and modification logs
4. **STT Provider**: HIPAA-compliant speech-to-text service
5. **Clinical Validation**: Medical review of all AI outputs
6. **Access Controls**: Multi-factor authentication, role permissions
7. **Data Retention**: Compliant data lifecycle management
8. **Incident Response**: Security breach procedures
9. **Backup & Recovery**: HIPAA-compliant data backup
10. **Penetration Testing**: Security vulnerability assessments

## Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite with Knex.js migrations
- **Real-time**: Socket.io
- **AI**: OpenAI-compatible client wrapper

## Development Commands

- `npm run dev` - Start development servers
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with test data
- `npm test` - Run test suite
- `npm run lint` - Run ESLint
