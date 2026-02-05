# Rhine Route Pro - Dynamic Route & Waybill System

A production-ready logistics tracking platform built with Next.js, Prisma, and PostgreSQL. Features automatic EDD calculation, dynamic routing through predefined terminal sequences, and comprehensive shipment tracking.

## 🎯 Key Features

- **Dynamic Routing** - Shipments follow pre-defined terminal sequences
- **Automatic EDD Calculation** - Estimated Delivery Dates auto-calculate from remaining route terminals
- **Node-Based Tracking** - Position tracked via index in route (0, 1, 2...)
- **Auto EDD Recalculation** - When shipment moves to next terminal, EDD automatically updates
- **Complete Audit Trail** - All movements recorded in TrackingEvent history
- **Admin Dashboard** - Create routes, manage shipments, advance shipments
- **Public Tracking** - Customers track shipments via tracking code
- **Database-Driven** - PostgreSQL + Prisma ORM with migrations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd rhine-route
npm install

# 2. Configure database
cp .env.example .env.local
# Edit .env.local with your PostgreSQL credentials:
# DATABASE_URL="postgresql://user:password@localhost:5432/rhine_route"

# 3. Initialize database
npx prisma migrate deploy

# 4. Seed sample data (5 terminals, 3 routes)
npm run db:seed

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📖 Documentation

- **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Detailed database setup and troubleshooting
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Quick reference and usage examples
- **[REFACTORING_COMPLETE.md](REFACTORING_COMPLETE.md)** - Complete technical documentation
- **[IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md)** - Implementation status and next steps

## 🏗️ Architecture

### Data Model

```
Terminal (name, location, processing_days)
    ↓
RouteNode (ordered sequence)
    ↓
Route (collection of terminals)
    ↓
Waybill (shipment following a route)
    ↓
TrackingEvent (audit trail)
```

### Core Logic

**Waybill Creation:**
```
1. Waybill created with route_id
2. current_node_index = 0 (first terminal)
3. EDD calculated = sum of all terminal processing_days
```

**Moving Shipment:**
```
1. current_node_index incremented (0 → 1)
2. current_terminal updated to next terminal
3. EDD RECALCULATED = sum of remaining terminal processing_days
4. Status updated (PROCESSING → IN_TRANSIT → ARRIVED)
5. TrackingEvent created for audit
```

## 🔧 Database Commands

```bash
# Run migrations
npm run db:migrate

# Push schema to database
npm run db:push

# Open database UI (Prisma Studio)
npm run db:studio

# Seed sample data
npm run db:seed
```

## 📚 Server Actions

### Tracking Operations
- `createTerminal()` - Add logistics hub
- `createRoute()` - Create route with terminals
- `createWaybill()` - Create shipment (auto-calc EDD)
- `getWaybillByTrackingCode()` - Public tracking lookup
- `moveToNextNode()` - Advance shipment (auto-recalc EDD)
- `getTrackingEvents()` - Get movement history

### Admin Operations
- `getAllWaybillsAdmin()` - List all shipments
- `getWaybillDetails()` - Detailed shipment view
- `updateWaybillLocation()` - Move to next terminal
- `createNewWaybill()` - Create from admin panel

All operations are typed, error-handled, and return standardized responses.

## 📊 Sample Data

The database comes pre-seeded with:

**Terminals:**
- New York Hub (1 day)
- Chicago Distribution Center (1 day)
- Los Angeles Port (2 days)
- Dallas Regional Center (1 day)
- Miami International Airport (1 day)

**Routes:**
1. **Coast-to-Coast Express** - NY → Chicago → LA (4 days)
2. **Southern Gateway** - NY → Dallas → Miami (3 days)
3. **Texas Hub Network** - Chicago → Dallas → LA (4 days)

## 🎨 Pages

### Public
- `/` - Home page
- `/tracking` - Track shipment by tracking code
- `/services` - Service offerings
- `/contact` - Contact form

### Protected (Admin)
- `/admin` - Dashboard with shipment management
  - View all shipments
  - Create new shipment
  - Update shipment location (move to next terminal)
  - View detailed tracking

## 🔐 Security

- Server Actions only (no direct client database access)
- HttpOnly cookies for authentication
- Middleware protection on admin routes
- Foreign key constraints for data integrity
- Complete audit trail for compliance

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.1 with App Router
- **Database**: PostgreSQL 12+
- **ORM**: Prisma 6.5.0
- **Frontend**: React 18.3.1 with TypeScript
- **UI**: Shadcn/UI components
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation

## 📦 Project Structure

```
src/
├── actions/
│   ├── tracking.ts      (Waybill/route operations)
│   ├── admin.ts         (Admin operations)
│   └── auth.ts          (Authentication)
├── app/
│   ├── (public)/        (Public pages)
│   ├── (protected)/     (Admin pages)
│   └── (auth)/          (Login)
├── lib/
│   ├── prisma.ts        (Prisma client)
│   └── tracking-utils.ts (Business logic)
└── components/
    ├── layout/          (Navigation, footer)
    └── ui/              (Shadcn components)

prisma/
├── schema.prisma        (Database schema)
├── migrations/          (Migration files)
└── seed.js             (Sample data)
```

## 🧪 Testing

All server actions are unit-testable functions:

```typescript
import { createWaybill, moveToNextNode } from '@/actions/tracking';

describe('Waybill System', () => {
  it('should create waybill with auto EDD', async () => {
    const result = await createWaybill({
      route_id: 'coast-to-coast',
      shipper_name: 'Test Corp',
      receiver_name: 'Test Inc',
      origin: 'NYC', destination: 'LA',
      weight: '10kg', dimensions: '30x20x10cm'
    });
    
    expect(result.success).toBe(true);
    expect(result.waybill.estimated_delivery_date).toBeDefined();
  });
});
```

## 🚀 Development

```bash
# Start dev server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Open database UI
npm run db:studio
```

## 📝 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rhine_route"

# API
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Auth
AUTH_SECRET="your-secret-key-change-this"
```

See `.env.example` for complete template.

## 🐛 Troubleshooting

See [DATABASE_SETUP.md](DATABASE_SETUP.md) for detailed troubleshooting.

Common issues:
- **Connection error**: Verify PostgreSQL is running and credentials are correct
- **Migration error**: Run `npx prisma migrate reset` (⚠️ deletes all data)
- **Type errors**: Run `npx prisma generate`

## 📞 Support

For detailed setup and troubleshooting, see [DATABASE_SETUP.md](DATABASE_SETUP.md).

For architecture and design details, see [REFACTORING_COMPLETE.md](REFACTORING_COMPLETE.md).

## 📄 License

This project is part of the Rhine Route Pro suite.

---

**Status**: ✅ Production Ready

The system is fully implemented with PostgreSQL database, automated EDD calculation, and comprehensive server actions. Ready to deploy after database configuration.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
