# Vault Investment Platform

A modern, secure investment platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

- User authentication and authorization
- Investment plan management
- Transaction processing (deposits, withdrawals, investments)
- Real-time portfolio tracking
- Admin dashboard for user and transaction management
- Crypto wallet address management
- Notification system
- Responsive design with dark mode support

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: JWT tokens
- **Charts**: Recharts

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in required variables like `JWT_SECRET`, `DATABASE_URL` (for production).

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

- `JWT_SECRET`: Secret key for JWT token signing (required)
- `DATABASE_URL`: PostgreSQL connection string (optional, uses SQLite if not provided)
- `NODE_ENV`: Set to 'production' for production builds

## Database

The application supports both SQLite (for development) and PostgreSQL (for production). Database schema is automatically created on first run.

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## Project Structure

- `app/`: Next.js app router pages and API routes
- `components/`: Reusable React components
- `lib/`: Utility functions, database, auth, types
- `hooks/`: Custom React hooks
- `public/`: Static assets

## Security

- Password hashing with bcrypt
- JWT-based authentication
- Input validation on API endpoints
- SQL injection protection via parameterized queries

## Contributing

1. Run linting: `npm run lint`
2. Ensure TypeScript types are correct
3. Test thoroughly before submitting PRs

## License

MIT