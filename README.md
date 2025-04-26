# SubTrack Mail Insight

<p align="center">
  <img src="public/logo.svg" alt="SubTrack Mail Insight Logo" width="200" />
</p>

<p align="center">
  <strong>Track your subscriptions, expenses, and gain insights from your email inbox</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#environment-setup">Environment Setup</a> •
  <a href="#running-the-application">Running the Application</a> •
  <a href="#api-endpoints">API Endpoints</a> •
  <a href="#database-schema">Database Schema</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

## Features

SubTrack Mail Insight is a powerful application that helps you manage your finances by analyzing your email inbox. Key features include:

- **Gmail Integration**: Securely connect your Gmail account to scan for subscription and expense emails
- **Subscription Tracking**: Automatically detect and track recurring subscriptions
- **Expense Management**: Identify and categorize expenses from email receipts
- **Financial Dashboard**: Visualize your spending patterns and subscription costs
- **Reports & Analytics**: Generate detailed reports on your financial activity
- **User Authentication**: Secure login and registration system
- **Multi-account Support**: Connect and manage multiple Gmail accounts

## Tech Stack

### Frontend
- **React**: UI library for building the user interface
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Reusable UI components
- **React Router**: Client-side routing
- **React Query**: Data fetching and state management
- **Recharts**: Data visualization library

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework for Node.js
- **Prisma**: ORM for database access
- **PostgreSQL**: Relational database
- **JWT**: Authentication mechanism
- **bcrypt**: Password hashing

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/subtrack-mail-insight.git
   cd subtrack-mail-insight
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up the database:
   ```sh
   npx prisma migrate dev
   ```

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/subtrack_db"

# JWT
JWT_SECRET="your_secure_jwt_secret_key_for_authentication"

# Google OAuth (for Gmail integration)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_REDIRECT_URI="http://localhost:5000/api/auth/google/callback"

# Server
PORT=5000
```

## Running the Application

### Development Mode

To run both the frontend and backend concurrently:

```sh
npm run dev:full
```

This will start:
- The React frontend on http://localhost:5173
- The Express backend on http://localhost:5000

### Running Frontend Only

```sh
npm run dev
```

### Running Backend Only

```sh
npm run server
```

### Production Build

```sh
npm run build
npm run preview  # To preview the production build
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/logout` - Logout a user
- `GET /api/auth/me` - Get current user information

### Gmail Accounts
- `GET /api/gmail-accounts` - Get all Gmail accounts for a user
- `POST /api/gmail-accounts` - Add a new Gmail account
- `DELETE /api/gmail-accounts/:id` - Remove a Gmail account

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions
- `POST /api/subscriptions` - Add a new subscription
- `PUT /api/subscriptions/:id` - Update a subscription
- `DELETE /api/subscriptions/:id` - Delete a subscription

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Add a new expense
- `PUT /api/expenses/:id` - Update an expense
- `DELETE /api/expenses/:id` - Delete an expense

## Database Schema

The application uses the following database models:

- **User**: Stores user account information
- **Session**: Manages user authentication sessions
- **GmailAccount**: Stores connected Gmail accounts
- **Subscription**: Tracks recurring subscriptions
- **Expense**: Records individual expenses

## Deployment

### Building for Production

```sh
npm run build
```

### Deploying to a Server

1. Build the application
2. Set up your environment variables on the server
3. Start the server with `node server.js`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
