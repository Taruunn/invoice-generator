# 📄 ProInvoice — Invoice Generator

A modern, month-based invoice generator built with **Next.js 15**. Features a visual dashboard timeline, inline editing on the invoice, email sending via Gmail SMTP, and PDF downloads.

![Next.js](https://img.shields.io/badge/Next.js_15-000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?logo=react&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel&logoColor=white)

---

## ✨ Features

- **Dashboard Timeline** — 12-month grid to view, create, and manage invoices at a glance
- **Inline Editing** — Click any text on the invoice to edit directly, no forms needed
- **2 Templates** — Classic Minimalist & Typewriter monospace style
- **PDF Download** — One-click PDF generation via html2pdf.js
- **Email Invoices** — Send invoices as PDF attachments via Gmail SMTP (Nodemailer)
- **Design Panel** — Switch templates, fonts, and accent colors
- **Save to Cloud** — Auto-save invoices to Supabase (one per month, overrides on save)
- **Password Protected** — HMAC-based auth with credentials from environment variables
- **Zoom Controls** — 50%–150% zoom for comfortable editing

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Frontend | React 18 |
| Styling | Vanilla CSS |
| Animations | Framer Motion |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL) |
| Email | Nodemailer (Gmail SMTP) |
| Auth | HMAC token via env vars |
| Hosting | Vercel |
| PDF | html2pdf.js (CDN) |

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Taruunn/invoice-generator.git
cd invoice-generator
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run:

```sql
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL DEFAULT 2026,
  data JSONB NOT NULL DEFAULT '{}',
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(month, year)
);
```

3. Get your **Project URL** and **Service Role Key** from Project Settings → API

### 3. Set Up Gmail App Password

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Generate an App Password for "Mail"
3. Copy the 16-character password

### 4. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
# Login credentials
APP_USERNAME=your_login_email
APP_PASSWORD=your_login_password
APP_SECRET=any_random_hex_string

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key

# Gmail SMTP
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=xxxx_xxxx_xxxx_xxxx

# Email display (visible in browser)
NEXT_PUBLIC_SENDER_EMAIL=your_sender@gmail.com
NEXT_PUBLIC_RECIPIENTS=recipient1@example.com,recipient2@example.com
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Deploy to Vercel

1. Push to GitHub
2. Import on [vercel.com/new](https://vercel.com/new)
3. Add all environment variables in the Vercel dashboard
4. Deploy ✅

## 📁 Project Structure

```
├── app/
│   ├── layout.jsx              # Root layout
│   ├── page.jsx                # Entry point
│   ├── globals.css             # Design system
│   ├── api/
│   │   ├── login/route.js      # Authentication
│   │   ├── verify/route.js     # Token verification
│   │   ├── email/route.js      # Send invoice via email
│   │   └── invoices/
│   │       ├── route.js        # List & create invoices
│   │       └── [id]/route.js   # Get & update invoice
│   └── components/
│       ├── App.jsx             # Main app shell
│       ├── Dashboard.jsx       # Month timeline grid
│       ├── EditableText.jsx    # Inline editable text
│       ├── Toolbar.jsx         # Top action bar
│       ├── DesignPanel.jsx     # Template/font/color picker
│       ├── EmailModal.jsx      # Email send dialog
│       ├── SaveModal.jsx       # Save confirmation
│       ├── LoginScreen.jsx     # Auth screen
│       ├── DateInput.jsx       # Date picker input
│       ├── Toast.jsx           # Toast notifications
│       └── templates/
│           ├── Template1.jsx   # Classic Minimalist
│           └── Template2.jsx   # Typewriter Monospace
├── public/
│   └── ysm-logo.png           # Logo
├── .env.example                # Environment template
└── package.json
```

## 📝 License

MIT — feel free to use, modify, and share.
