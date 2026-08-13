<div align="center">

  # 🗳️ UTASVotes
  ### *Secure, Transparent & Real-Time Campus Electoral System*

  [![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![Built By](https://img.shields.io/badge/Built%20By-yk-FF4500?style=for-the-badge&logo=github)](https://github.com/)

  ---

  <p align="center">
    <b>UTASVotes</b> is a state-of-the-art university e-voting platform designed for <b>CKT-UTAS</b>. It streamlines candidate applications, nomination payments, campaign feeds, instant vote casting with cryptographic-style digital receipts, live election analytics, and commission management.
  </p>

</div>

---

## ✨ Features At A Glance

### 🎓 Student & Voter Experience
* 🗳️ **Instant & Secure Voting**: Interactive voting booth with real-time selection validation, ballot review, and instant receipt generation.
* 📜 **Digital Receipts**: Uniquely generated verification codes for full transparency and anti-double voting protection.
* 📢 **Campaign Feed**: Social-style feed for candidates to post manifestos, campaign videos, announcements, and engage with students through comments and likes.
* 📊 **Live Results Dashboard**: Real-time turnout tracking, candidate vote share percentages, and winner declarations rendered using **Recharts**.

### 📝 Candidate Nomination & Applications
* 📑 **Step-by-Step Registration**: Interactive 6-step candidate nomination workflow.
* 📤 **Document Vault**: Direct upload of passport photo, manifesto PDF, academic transcript, and student ID to Supabase Cloud Storage.
* 💳 **Mobile Money (MoMo) Integration**: Seamless payment processing for non-refundable nomination fees.
* 🔍 **Automated Eligibility Checks**: Minimum CGPA verification, institutional email authentication, and constitutional compliance checks.

### 🏛️ Electoral Commission & Admin Panel
* 📥 **Bulk Student Data Import**: Fast Excel (`.xlsx` / `.csv`) roster parsing and automatic student user creation.
* ⚙️ **Election Lifecycle Management**: Full control to create, schedule, pause, activate, or conclude elections.
* 🛡️ **Role-Based Access Control (RBAC)**: Time-bound commission privilege upgrades with automatic expiry downgrades.
* 📧 **Automated Email Notifications**: Real-time transactional emails for application decisions, password resets, and election alerts via **Resend**.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | [Next.js 15 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & Custom CSS Design Tokens |
| **Backend & Auth** | [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS Policies, Storage) |
| **Data Analytics** | [Recharts](https://recharts.org/) |
| **Email Delivery** | [Resend API](https://resend.com/) |
| **Spreadsheet Utilities** | [XLSX](https://npm.im/xlsx) |

---

## 👥 Role Access Matrix

| Role | Access Permissions |
| :--- | :--- |
| **Student** | Student Dashboard, Vote in Active Elections, Apply for Candidacy, Campaign Feed, Results |
| **Candidate** | Student Features + Post Campaign Feed Updates & Video Manifestos |
| **Commission** | Electoral Commission Panel, Candidate Vetting, Student Import, Live Analytics |
| **Admin** | Full System Control, User Role Management, System Alerts & Security Logs |

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: `v18.0.0` or higher
* **npm** / **yarn** / **pnpm**

### 1. Clone the Repository
```bash
git clone https://github.com/yk/UI-UTASVOTES.git
cd UI-UTASVOTES
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=UTASVotes <onboarding@resend.dev>
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:4028](http://localhost:4028) in your browser.

---

## 📦 Build & Deployment

```bash
# Type check code
npm run type-check

# Build for production
npm run build

# Start production server
npm run serve
```

---

## 👑 Creator & Lead Builder

<div align="center">

  ### Designed & Engineered with ❤️ by **yk**

  [![Developer](https://img.shields.io/badge/Developer-yk-FF4500?style=for-the-badge&logo=github)](https://github.com/)

  *Crafted for secure, accessible, and modern campus democracy.*

</div>

---

<p align="center">
  <sub>© 2026 UTASVotes. Designed by <b>yk</b>. All rights reserved.</sub>
</p>