# ClearNotes 🌊

An AI meeting notetaker that joins calls, transcribes, and emails action items. Built as a "Calm System" - an airy, peaceful product experience that helps you focus on what matters.

![ClearNotes](https://img.shields.io/badge/ClearNotes-Calm%20System-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-teal)

## Features

- 🤖 **AI-Powered Transcription** - Joins Zoom/Google Meet calls and transcribes in real-time
- ✅ **智能 Action Items** - Automatically extracts tasks and decisions from meetings
- 📧 **Email Delivery** - Sends action items to all participants after meetings
- 🎯 **Clean Dashboard** - View, search, and manage all your meeting transcripts
- 🔐 **Secure Auth** - NextAuth.js with email and OAuth providers
- 🌊 **Calm UI** - Soft gradients, muted colors, relaxed spacing

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Python + FastAPI + WebSocket
- **Database**: PostgreSQL + Prisma ORM
- **AI**: OpenAI GPT-4 for transcription and action item extraction
- **Auth**: NextAuth.js
- **Deploy**: Vercel (frontend) + Railway/Render (backend)

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- OpenAI API key

### Installation

1. **Clone and setup environment**
```bash
git clone https://github.com/yourusername/clearnotes.git
cd clearnotes
```

2. **Setup Frontend**
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
```

3. **Setup Backend**
```bash
cd ../backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
```

4. **Database Setup**
```bash
cd ../frontend
npx prisma migrate dev
npx prisma generate
```

5. **Run Development Servers**

Frontend:
```bash
cd frontend
npm run dev
```

Backend:
```bash
cd backend
uvicorn main:app --reload --port 8000
```

6. **Open** http://localhost:3000

## Environment Variables

### Frontend (.env.local)
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
DATABASE_URL=postgresql://user:pass@localhost:5432/clearnotes
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/clearnotes
OPENAI_API_KEY=sk-...
ZOOM_WEBHOOK_SECRET=...
GOOGLE_MEET_CREDENTIALS=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

## Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Railway)
```bash
cd backend
railway up
```

## Project Structure

```
clearnotes/
├── frontend/          # Next.js 14 application
│   ├── app/          # App router pages
│   ├── components/   # React components
│   ├── lib/          # Utilities and configs
│   └── prisma/       # Database schema
├── backend/          # Python FastAPI application
│   ├── main.py       # API entry point
│   ├── routes/       # API endpoints
│   ├── services/     # Business logic
│   └── models/       # Pydantic models
└── shared/           # Shared types/constants
```

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please use GitHub Issues.

---

Built with ❤️ for calm, focused work.
