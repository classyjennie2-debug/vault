# Vault - Crypto Investment Dashboard

A modern, professional crypto investment platform built with **Next.js 16**, **React 19**, **TypeScript**, **TailwindCSS**, and **MongoDB** (with SQLite fallback).

## 🎯 Features Implemented

### 1. **Dashboard Page** (`/dashboard`)
Complete financial overview with:
- **Financial Summary Cards** - Display:
  - Total Balance (USD)
  - Total Invested
  - Total Profit Earned
  - Active Investments Count
  - Pending Deposits
  - Total Withdrawn
  
- **Portfolio Growth Chart** - Line chart showing balance growth over time using Recharts

- **Recent Activities** - Latest events including:
  - Deposit approvals
  - Investment starts
  - Profit credits
  - Withdrawal processing

- **Recent Transactions** - Last 5 transactions with status badges

### 2. **Investment Plans Page** (`/dashboard/investments`)
Dedicated investment management with:
- **Investment Plans Grid** - Beautiful card layout displaying:
  - Plan name and description
  - Minimum and maximum investment amounts
  - Duration (days/months)
  - Return percentage with TrendingUp icon
  - Risk level badge (Low/Medium/High)
  - "Invest Now" button

- **Investment Calculator** - Real-time calculation showing:
  - Plan selector dropdown
  - Investment amount input
  - Expected profit calculation
  - Total return amount
  - Investment summary with fees

- **Active Investments Table** - Responsive table with:
  - Plan name
  - Invested amount
  - Expected profit
  - Start and end dates
  - Progress bar with percentage
  - Status badge (Active/Completed/Withdrawn)

### 3. **Investment Calculator Component**
Real-time investment calculator that:
- Allows selection of investment plan
- Input custom investment amount
- Automatically calculates expected profit
- Displays total return amount
- Shows plan duration and risk level

### 4. **Deposit Page** (`/dashboard/deposit`)
Comprehensive deposit system supporting:
- Multiple cryptocurrencies (USDT, BTC, ETH, BNB, TRX, SOL)
- Multiple networks (TRC20, ERC20, BEP20, etc.)
- Available wallet addresses with easy copy functionality
- Wallet assignment and verification
- Status tracking for pending deposits

### 5. **Withdraw Page** (`/dashboard/withdraw`)
Complete withdrawal management with:
- Available balance display
- Withdrawal method selection (Bank/Crypto)
- Amount validation
- Bank account or crypto wallet input
- Processing fee calculation
- Withdrawal summary
- Pending status tracking

### 6. **Notification System**
Complete notification management:
- **Bell Icon** in navigation showing unread count
- **Notification Drawer/Modal** with:
  - Unread and Read tabs
  - Notification types: Success, Info, Warning, Error
  - Timestamps for each notification
  - Click to mark as read
  - Action URLs for navigation

### 7. **Enhanced Sidebar Navigation**
Improved navigation with:
- Dashboard link
- Investments link
- Deposit link
- Withdraw link
- Transactions link
- Support link
- Settings link
- User profile section
- Sign out button
- Mobile-responsive hamburger menu

### 8. **Modern UI Components**
All built with:
- TailwindCSS for styling
- Lucide icons (modern icon library)
- Radix UI components (accessible)
- Smooth animations and transitions
- Responsive grid layouts
- Gradient backgrounds
- Subtle shadows
- Hover effects

## 📁 Project Structure

```
project/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard layout with sidebar
│   │   ├── page.tsx                # Main dashboard
│   │   ├── deposit/
│   │   │   └── page.tsx            # Deposit page
│   │   ├── withdraw/
│   │   │   └── page.tsx            # Withdraw page
│   │   └── investments/
│   │       └── page.tsx            # Investments page
│   ├── layout.tsx                  # Global layout
│   └── page.tsx                    # Home page
│
├── components/
│   ├── dashboard/
│   │   ├── dashboard-cards.tsx      # Financial summary cards
│   │   ├── balance-card.tsx         # Balance card
│   │   ├── portfolio-chart.tsx      # Growth chart
│   │   ├── quick-actions.tsx        # Quick action buttons
│   │   ├── recent-transactions.tsx  # Recent transactions list
│   │   ├── recent-activities.tsx    # Recent activities list
│   │   └── notification-bell.tsx    # Notification bell with modal
│   │
│   ├── investments/
│   │   ├── investment-plans-grid.tsx     # Investment plans display
│   │   ├── investment-form.tsx           # Investment form/modal
│   │   ├── investment-calculator.tsx     # Calculator component
│   │   └── active-investments-table.tsx  # Active investments table
│   │
│   └── ui/
│       ├── card.tsx
│       ├── button.tsx
│       ├── input.tsx
│       ├── badge.tsx
│       ├── progress.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── sheet.tsx
│       ├── dialog.tsx
│       └── ... (other Radix UI components)
│
├── lib/
│   ├── types.ts                 # TypeScript types
│   ├── mock-data.ts             # Mock data for development
│   ├── db.ts                    # SQLite database setup
│   ├── mongodb.ts               # MongoDB setup (optional)
│   ├── database-schema.ts       # Database schema documentation
│   ├── api-examples.ts          # API endpoint examples
│   └── utils.ts                 # Utility functions
│
└── public/
    └── ... (static assets)
```

## 🗄️ Database Schema

### Collections (MongoDB)
1. **users** - User accounts and profiles
2. **investmentPlans** - Available investment plans
3. **activeInvestments** - Individual investment instances
4. **deposits** - Deposit transactions
5. **withdrawals** - Withdrawal requests
6. **transactions** - Transaction log
7. **notifications** - User notifications
8. **cryptoWallets** - Available wallet addresses
9. **adminSettings** - System configuration

See `lib/database-schema.ts` for complete schema documentation.

## 🔒 Security Features

- ✅ Input validation on all forms
- ✅ Authorization checks on sensitive endpoints
- ✅ Password hashing with bcrypt
- ✅ Environment variables for secrets
- ✅ Transaction audit logging
- ✅ 2FA support ready
- ✅ Rate limiting ready
- ✅ Fraud detection ready

## 📊 Available Investment Plans

1. **Starter Plan**
   - Min: $100 | Max: $50,000
   - Duration: 7 days
   - Return: 8%
   - Risk: Low

2. **Growth Portfolio**
   - Min: $500 | Max: $500,000
   - Duration: 14 days
   - Return: 15%
   - Risk: Medium

3. **VIP Plan**
   - Min: $2,000 | Max: $1,000,000
   - Duration: 30 days
   - Return: 35%
   - Risk: High

4. **Conservative Bond Fund**
   - Min: $1,000 | Max: $100,000
   - Duration: 12 months
   - Return: 6.5%
   - Risk: Low

5. **Real Estate Trust**
   - Min: $25,000 | Max: $500,000
   - Duration: 24 months
   - Return: 9.2%
   - Risk: Medium

## 🔄 Data Flow

### Investment Flow
1. User selects plan
2. Calculator shows expected profit
3. User confirms investment (form modal)
4. Investment created in database
5. User balance updated
6. Transaction logged
7. Notification sent
8. Investment appears in active investments table

### Deposit Flow
1. User selects deposit method (Crypto/Bank)
2. System assigns wallet address (for crypto)
3. User completes deposit
4. Admin reviews and approves
5. User balance updated
6. Notification sent

### Withdrawal Flow
1. User requests withdrawal
2. System validates balance
3. Withdrawal created with pending status
4. Admin reviews and approves
5. User balance updated
6. Transaction processed
7. Notification sent

## 🚀 Getting Started

### Installation
```bash
npm install
# or
pnpm install
```

### Environment Variables
Create `.env.local`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vault
NODE_ENV=development
```

### Run Development Server
```bash
npm run dev
# or
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
npm start
```

## 📱 Responsive Design
- ✅ Mobile-first approach
- ✅ Responsive grid layouts
- ✅ Mobile navigation menu
- ✅ Touch-friendly buttons
- ✅ Optimized for all screen sizes

## 🎨 Styling
- TailwindCSS 4.2.0
- Custom color scheme with accent colors
- Smooth animations and transitions
- Modern shadows and gradients
- Dark mode support ready

## 🔌 API Endpoints (Ready to Implement)

### User Endpoints
- `GET /api/user/[id]/balance` - Get user balance
- `POST /api/user/[id]/update` - Update user profile

### Investment Endpoints
- `GET /api/investments/plans` - Get all plans
- `POST /api/investments/create` - Create investment
- `GET /api/investments/user/[id]` - Get user investments

### Deposit Endpoints
- `POST /api/deposits/create` - Create deposit
- `GET /api/deposits/user/[id]` - Get user deposits

### Withdrawal Endpoints
- `POST /api/withdrawals/create` - Create withdrawal
- `GET /api/withdrawals/user/[id]` - Get user withdrawals

### Admin Endpoints
- `POST /api/admin/deposits/[id]/approve` - Approve deposit
- `POST /api/admin/withdrawals/[id]/approve` - Approve withdrawal
- `GET /api/admin/dashboard/stats` - Get admin stats

See `lib/api-examples.ts` for implementation examples.

## 📦 Dependencies

### Core
- Next.js 16.1.6
- React 19.2.4
- TypeScript 5.7.3

### UI & Components
- TailwindCSS 4.2.0
- Radix UI components
- Lucide React 0.564.0
- Recharts 2.15.0

### Forms & Validation
- React Hook Form 7.54.1
- Zod 3.24.1

### Database
- Better SQLite3 12.6.2 (current)
- MongoDB (optional)
- Mongoose (optional)

### Utilities
- date-fns 4.1.0
- clsx 2.1.1
- TailwindCSS Merge 3.3.1

## 🐛 Debugging

### View Mock Data
Open `/lib/mock-data.ts` to see all mock data structure.

### Database Queries
See `/lib/api-examples.ts` for query examples.

### Component Testing
Use React Developer Tools browser extension for component inspection.

## 📝 Notes

- Mock data is included for development
- Database schema supports both SQLite and MongoDB
- All notifications are client-side for now
- Complete API routes need to be implemented
- Payment processing integration required for production

## 🔮 Future Enhancements

- [ ] Real payment gateway integration (Stripe, PayPal)
- [ ] Advanced analytics dashboard
- [ ] Automated profit payout schedule
- [ ] Referral program
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] 2-Factor Authentication
- [ ] KYC verification
- [ ] Advanced reporting
- [ ] API for third-party integrations
- [ ] Multi-language support

## 📄 License

MIT License - Feel free to use this as a template for your project.

## 💬 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ using Next.js and React**
