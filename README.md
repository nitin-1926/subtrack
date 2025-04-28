# SubTrack Mail Insight

<div align="center">
  <img src="public/logo.svg" alt="SubTrack Mail Insight Logo" width="200" />
  
  <p><strong>Take control of your subscriptions and financial life through intelligent email analysis</strong></p>

[![Next.js](https://img.shields.io/badge/Built%20with-Next.js-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

</div>

## 🌟 Overview

SubTrack Mail Insight is a powerful financial management application that analyzes your email inbox to automatically track subscriptions, monitor expenses, and provide valuable insights into your spending patterns. By connecting your Gmail account, the application scans for subscription confirmations and payment receipts, helping you take control of your recurring expenses.

### 🎯 Who is this for?

- **Individuals looking to optimize their subscription spending**
- **Budget-conscious consumers wanting visibility into recurring charges**
- **Financial planners seeking tools to help clients manage expenses**
- **Anyone who has lost track of what services they're subscribed to**

## ✨ Key Features

- **📧 Seamless Gmail Integration**: Connect your accounts securely to scan for subscription information
- **💰 Automatic Subscription Detection**: Identify recurring payments without manual input
- **📊 Financial Dashboard**: Visualize spending patterns with intuitive charts and graphs
- **🔍 Spending Insights**: Get personalized recommendations to optimize your subscriptions
- **🔄 Payment Tracking**: Monitor when subscription payments are processed
- **🌐 Multi-account Support**: Connect multiple Gmail accounts for comprehensive coverage
- **🔒 Privacy-focused**: We never store actual email content, only extract relevant data points

## 🖥️ Screenshots

![Dashboard](https://example.com/screenshots/dashboard.png)
![Subscription Management](https://example.com/screenshots/subscriptions.png)
![Account Connection](https://example.com/screenshots/account-connection.png)

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or yarn or bun
- PostgreSQL database

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/subtrack-mail-insight.git
cd subtrack-mail-insight
```

2. **Install dependencies**

```bash
# Using npm
npm install

# Using yarn
yarn

# Using bun
bun install
```

3. **Set up environment variables**

Create a `.env` file in the root directory with the following variables:

```
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/subtrack_db"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (for Gmail integration)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. **Initialize the database**

```bash
npx prisma db push
```

5. **Run the development server**

```bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using bun
bun dev
```

6. **Open the application**

Navigate to [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Tech Stack

### Frontend

- **Next.js**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Reusable UI components
- **Recharts**: Data visualization
- **React Hook Form**: Form validation
- **Zod**: Schema validation

### Backend

- **Next.js API Routes**: Server-side logic
- **NextAuth.js**: Authentication
- **Prisma**: ORM for database access
- **PostgreSQL**: Relational database

## 📋 Project Structure

```
subtrack-mail-insight/
├── app/                  # Next.js App Router
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard pages
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── subscriptions/    # Subscription management
│   └── page.tsx          # Home page
├── components/           # React components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── prisma/               # Prisma schema and migrations
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 🧠 How It Works

1. **Connect your Gmail account** securely using OAuth
2. **Our system scans your inbox** for subscription and payment emails
3. **Relevant data is extracted** and categorized
4. **Your subscription information is displayed** in an easy-to-understand dashboard
5. **Receive insights and recommendations** based on your spending patterns

## 🔐 Privacy & Security

We take your privacy and security seriously:

- **OAuth 2.0**: We never see or store your Gmail password
- **Limited Access**: We only request access to read email content (no send, delete, or modify permissions)
- **Data Extraction Only**: We don't store your actual emails, only extract relevant subscription data
- **Data Encryption**: All sensitive information is encrypted at rest and in transit
- **User Control**: You can revoke access to your Gmail account at any time

## 🤝 Contributing

We welcome contributions to improve SubTrack Mail Insight! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📬 Contact

If you have any questions or suggestions, please open an issue or reach out to us at support@subtrack.io.

---

<div align="center">
  <p>© 2025 SubTrack. All rights reserved.</p>
  <p>Made with ❤️ by our amazing team</p>
</div>
