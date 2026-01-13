# Corix

A modern, real-time collaborative group messaging platform built with React, TypeScript, Convex, and Vite.

## Features

### Authentication
- Email/password registration with verification
- Google OAuth integration
- TOTP-based two-factor authentication (2FA)
- Password reset flow
- Secure session management

### Group Management
- Create and manage groups
- Role-based permissions (Admin, Editor, Viewer, Removed)
- Invite members via email
- Soft-delete groups (archival)
- Group settings and configuration

### Messaging
- Real-time messaging within groups
- 500 character limit per message
- Automatic scroll to latest
- Pagination support
- Message attribution (preserves deleted user messages)

### Audit & Accountability
- Comprehensive audit logging for:
  - Membership changes
  - Role updates
  - Invitations sent/accepted
  - Group actions
- Admin-only audit log viewing
- Timestamped event tracking

### User Management
- Profile management
- Account deletion with safeguards
- Email verification status
- 2FA setup and management
- Prevents deletion if sole admin of groups

### Super-Admin System
- System administrator panel
- View all groups and users
- Restore soft-deleted groups
- Hard delete groups and users (permanent)
- Elevated permissions for system management

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TanStack Router** - File-based routing
- **Zustand** - State management
- **CSS Modules** - Scoped styling

### Backend & Database
- **Convex** - Real-time backend and database
- **Convex Auth** - Authentication provider
- **Real-time subscriptions** - Live data updates

### Services
- **Resend** - Transactional email delivery
- **Google OAuth** - Social authentication

## Project Structure

```
corix/
├── convex/                 # Backend (Convex functions)
│   ├── schema.ts          # Database schema
│   ├── auth.ts            # Authentication config
│   ├── groups.ts          # Group operations
│   ├── memberships.ts     # Member management
│   ├── messages.ts        # Messaging system
│   ├── invitations.ts     # Invitation system
│   ├── auditLogs.ts       # Audit logging
│   └── users.ts           # User operations
├── src/
│   ├── features/          # Feature modules
│   │   ├── auth/          # Auth components
│   │   ├── groups/        # Group components
│   │   ├── members/       # Member components
│   │   ├── messages/      # Message components
│   │   ├── audit/         # Audit log components
│   │   └── admin/         # Admin panel components
│   ├── routes/            # File-based routing
│   ├── shared/            # Shared components & utils
│   └── main.tsx           # App entry point
├── specs/                 # Specification documents
├── DEPLOYMENT.md          # Deployment guide
└── PRODUCTION_NOTES.md    # Production considerations

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Convex account (free at https://convex.dev)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd corix
```

2. Install dependencies:
```bash
npm install
```

3. Set up Convex:
```bash
npx convex dev
```

This will:
- Create a Convex development deployment
- Generate your `CONVEX_URL`
- Set up the database schema

4. Configure environment variables:

Create `.env.local`:
```bash
VITE_CONVEX_URL=<your-convex-url>
```

In Convex dashboard, set:
```bash
AUTH_GOOGLE_ID=<your-google-oauth-id>
AUTH_GOOGLE_SECRET=<your-google-oauth-secret>
RESEND_API_KEY=<your-resend-api-key>
FROM_EMAIL=noreply@yourdomain.com
SITE_URL=http://localhost:5173
```

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### First Super-Admin Setup

After creating your first user:
1. Go to Convex dashboard
2. Navigate to Data → `users` table
3. Find your user
4. Add field: `isSuperAdmin` = `true`
5. Refresh your app

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npx convex dev` - Start Convex development mode
- `npx convex deploy --prod` - Deploy to Convex production

### Database Schema

The application uses the following main tables:
- `users` - User accounts and profiles
- `groups` - Group definitions
- `groupMemberships` - User-group relationships with roles
- `messages` - Group messages
- `invitations` - Pending group invitations
- `auditLogs` - System audit trail

All tables include proper indexes for optimal query performance.

### Code Organization

- **Features**: Self-contained modules with components and logic
- **Routes**: File-based routing with TanStack Router
- **Shared**: Reusable components and utilities
- **Convex**: Backend functions (queries, mutations, actions)

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

Quick deploy:
1. Deploy Convex: `npx convex deploy --prod`
2. Deploy to Vercel: Connect repository and deploy
3. Configure environment variables
4. Create super-admin user

## Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Step-by-step deployment
- [Production Notes](./PRODUCTION_NOTES.md) - Edge cases and best practices
- [Specification](./specs/v1.md) - Complete feature specification

## Security

- All backend operations validate permissions
- Soft-delete pattern for data retention
- PII removal on account deletion
- Role-based access control
- Audit logging for accountability

See [PRODUCTION_NOTES.md](./PRODUCTION_NOTES.md) for detailed security considerations.

## Support

For issues and questions:
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
- Review [PRODUCTION_NOTES.md](./PRODUCTION_NOTES.md)
- Consult [Convex documentation](https://docs.convex.dev)

## License

[Your License Here]

## Version

Current Version: 1.0
Last Updated: January 2026
