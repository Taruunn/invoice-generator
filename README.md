# 📄 ProInvoice — SaaS Invoice Generator

A sleek, modern invoice generator built with React. Edit invoices directly on the page, switch between templates, and download as PDF — all in a clean, professional interface.

![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel&logoColor=white)

---

## ✨ Features

- **Inline Editing** — Click any text on the invoice to edit it directly. No forms, no sidebar.
- **2 Beautiful Templates** — Classic Minimalist & Typewriter (monospace retro style)
- **PDF Download** — One-click PDF generation via html2pdf.js
- **Print Ready** — Clean print output with no UI chrome
- **Design Panel** — Switch templates, fonts, and accent colors from a floating panel
- **Save & Load** — Persist invoices to a cloud database (Supabase)
- **Password Protected** — Simple login system with credentials from environment variables
- **Zoom Controls** — 50%–150% zoom for comfortable editing
- **Rich Text** — Bold, italic, underline formatting via toolbar
- **Vercel Ready** — Deploys with serverless API routes, zero config

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (custom properties) |
| Icons | Lucide React |
| Database | Supabase (free PostgreSQL) |
| Auth | HMAC token via env vars |
| Hosting | Vercel (serverless functions) |
| PDF | html2pdf.js (CDN) |

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Taruunn/invoice-generator.git
cd invoice-generator
npm install
```

### 2. Set Up Supabase (Free)

1. Create an account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **SQL Editor** and run:

```sql
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Untitled Invoice',
  data JSONB NOT NULL DEFAULT '{}',
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

4. Go to **Project Settings → Data API** for the Project URL
5. Go to **Project Settings → API Keys** for the `service_role` key

### 3. Configure Environment

Create a `.env` file in the project root:

```env
APP_USERNAME=your_username
APP_PASSWORD=your_password
APP_SECRET=any-random-secret-string
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

### 4. Run Locally

```bash
npm install -g vercel   # if not already installed
vercel login
vercel link
vercel dev              # runs frontend + API routes
```

### 5. Deploy to Vercel

1. Push to GitHub
2. Import on [vercel.com](https://vercel.com/new)
3. Add the 5 environment variables in the Vercel dashboard
4. Deploy ✅

## 📁 Project Structure

```
├── api/                        # Vercel serverless functions
│   ├── login.js                # Authentication
│   ├── verify.js               # Token verification
│   └── invoices/
│       ├── index.js            # List & create invoices
│       └── [id].js             # Get, update & delete
├── src/
│   ├── App.jsx                 # Main app shell
│   ├── index.css               # Design system
│   ├── components/
│   │   ├── EditableText.jsx    # Inline editable text
│   │   ├── Toolbar.jsx         # Top action bar
│   │   ├── DesignPanel.jsx     # Template/font/color picker
│   │   └── LoginScreen.jsx     # Auth screen
│   └── templates/
│       ├── Template1.jsx       # Classic Minimalist
│       └── Template2.jsx       # Typewriter Monospace
├── vercel.json
└── package.json
```

## 📝 License

MIT — feel free to use, modify, and share.
