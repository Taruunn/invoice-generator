# Vagmi — send invoices by email (same method as Tarun)

The app sends mail through **Google’s SMTP** using **Vagmi’s own Google account** (a normal Gmail address or Google Workspace address like `you@yourcompany.com`). There is no separate “domain verify” step inside this project: if the mailbox can send mail in Gmail on the web, the same account works here once **2-Step Verification** and an **App password** are set.

## 1. Pick the sender address

Use the Google account that should appear as **From** on client emails (e.g. `vagmi@gmail.com` or Workspace `billing@yourdomain.com`).

## 2. Turn on 2-Step Verification

1. Open [Google Account → Security](https://myaccount.google.com/security).
2. Under **How you sign in to Google**, enable **2-Step Verification** if it is not already on.

## 3. Create an App Password

1. Still under **Security**, open **2-Step Verification**.
2. At the bottom, open **App passwords** (Google may ask you to sign in again).
3. Create an app password:
   - App: **Mail**
   - Device: **Other** → name it e.g. `Invoice app`
4. Google shows a **16-character password** (often shown in groups of 4). Copy it — this is **not** your normal Gmail password.

If you do not see **App passwords**, your account type may restrict them (e.g. some Workspace policies). An admin may need to allow app passwords, or use a standard Gmail account for sending.

## 4. Put values in `.env` / `.env.local` (server)

Restart `npm run dev` after saving.

```env
# Required for Email button while Vagmi workspace is active
GMAIL_USER_VAGMI=vagmi@gmail.com
GMAIL_APP_PASSWORD_VAGMI=xxxx xxxx xxxx xxxx

# Display name in the recipient’s inbox
EMAIL_FROM_NAME_VAGMI=Vagmi

# Shown read-only in the compose modal (should match the mailbox above)
NEXT_PUBLIC_SENDER_EMAIL_VAGMI=vagmi@gmail.com

# Optional: default “To” chips in the email modal
NEXT_PUBLIC_RECIPIENTS_VAGMI=client@example.com
```

- Spaces in the app password are optional: Google shows it like `xxxx xxxx xxxx xxxx` but it’s the same 16 characters. This app strips spaces before sending mail (Tarun can keep spaces in `.env` if you prefer).
- **Tarun’s** variables (`GMAIL_USER`, `GMAIL_APP_PASSWORD`) are separate — Vagmi’s sends **only** use `GMAIL_USER_VAGMI` / `GMAIL_APP_PASSWORD_VAGMI`.

## 5. Send from the app

1. Sign in → choose **Vagmi** workspace.
2. Open or create an invoice → **Email**.
3. Recipients, subject, and PDF attachment behave like Tarun’s flow.

## Troubleshooting

| Issue | What to check |
|--------|----------------|
| `Set GMAIL_USER_VAGMI and GMAIL_APP_PASSWORD_VAGMI` | Both env vars set and dev server restarted |
| Authentication failed | Use **App password**, not normal password; 2FA must be on |
| “Less secure apps” | Use App passwords — do not rely on less-secure settings |
| Workspace / custom domain | Same App password flow for the user mailbox; SPF/DKIM for your domain are managed in Google Admin / DNS, not in this repo |

---

## Invoice numbers (Vagmi only)

**Tarun** keeps invoice **#** aligned with the calendar month slot (Jan → 1, … Dec → 12).

**Vagmi** uses **sequential numbers within each year**, ordered by **calendar month**:

- The **earliest** saved month in that year is **#1**, the next month **#2**, and so on (even if you did not start in January).
- Example: save **May** first → May is **#1**. Later save **April** → April becomes **#1** and May becomes **#2** (April is earlier in the year).
- After each **save** or **delete**, stored invoices for that year are **reindexed** so every PDF/email stays consistent.

This logic applies only when **Vagmi** workspace is selected.
