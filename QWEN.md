# TheyCare Portal - Comprehensive Project Guide

## Project Overview

TheyCare Portal (also known as Gabay Barangay) is a comprehensive Barangay Management System designed to streamline and modernize local government services in the Philippines. The application empowers barangay officials, healthcare workers, and community leaders with a centralized platform to manage health services, daycare operations, and youth engagement programs efficiently.

The system is built as a full-stack application featuring:
- **Frontend**: React + TypeScript + Vite with modern UI components
- **Backend**: Node.js + Express + TypeScript with Prisma ORM
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage for file uploads
- **Authentication**: JWT-based with role-based access control (RBAC)

Key features include Progressive Web App (PWA) capabilities, enabling offline functionality and app-like experiences on mobile devices.

## Architecture & Technologies

### Frontend Stack
- **Framework**: React 19.x with TypeScript
- **Router**: React Router v7
- **Styling**: Tailwind CSS with shadcn/ui components
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **PDF Generation**: jsPDF and jsPDF Autotable for certificates/reports
- **State Management**: React hooks and context
- **PWA**: Vite plugin for Progressive Web App features
- **Build Tool**: Vite

### Backend Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js v5
- **ORM**: Prisma with PostgreSQL
- **Authentication**: JWT with bcrypt password hashing
- **File Upload**: Multer with Supabase Storage integration
- **Logging**: Morgan for HTTP request logging
- **Security**: Helmet.js for security headers
- **Email**: SendGrid for email notifications
- **PDF Generation**: html-pdf-node and Puppeteer for reports

### Database & Storage
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma with schema.prisma as single source of truth
- **Storage**: Supabase Storage for user-uploaded files (proofs of residency, learning materials)

### Deployment Infrastructure
- **Frontend Hosting**: Vercel (free tier, global CDN)
- **Backend Hosting**: Render (free tier with cold starts)
- **Database & Storage**: Supabase (free forever tier)
- **CI/CD**: Automatic deployments on git push

## User Roles & Access Control

The system implements Role-Based Access Control (RBAC) with the following roles:

- **System Admin**: Full system access and configuration
- **Barangay Captain**: Access to all reports and analytics
- **Barangay Official**: Administrative functions for their department
- **BHW (Barangay Health Worker)**: Health services management
- **BHW Coordinator**: Health services oversight and reporting
- **Daycare Staff/Teacher**: Daycare management and attendance
- **SK Officer**: Event management and youth engagement
- **SK Chairman**: SK analytics and reporting
- **Parent/Resident**: Access to public services, personal records, and health services
- **Visitor**: Public portal access only

## Building and Running

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Supabase account
- PostgreSQL database (local or Supabase)

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Copy environment variables: `cp .env.example .env`
4. Update `.env` with your database and Supabase credentials
5. Generate Prisma client: `npm run prisma:generate`
6. Run database migrations: `npm run prisma:migrate`
7. Seed the database (optional): `npm run prisma:seed`
8. Start development server: `npm run dev`

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Copy environment variables: `cp .env.example .env`
4. Update `VITE_API_URL` to point to your backend server
5. Start development server: `npm run dev`

### Production Deployment
The application is designed for cloud deployment with the following architecture:
- Frontend deployed to Vercel
- Backend deployed to Render
- Database and storage via Supabase

Deployment steps are documented in:
- `DEPLOYMENT_STEPS.md` - Complete step-by-step guide
- `README_DEPLOYMENT.md` - Overview and architecture
- `DEPLOYMENT_CHECKLIST.md` - Quick deployment checklist

## Key Features

### Health Services Module
- Patient registration and management
- Appointment scheduling and management
- Immunization records and e-card generation
- Health record tracking
- Vaccination tracking

### Daycare Management Module
- Online student registration and enrollment
- Daily attendance tracking
- Learning materials repository
- Progress report generation
- Certificate generation

### SK Engagement Module
- Event creation and management
- Public event calendar
- Event registration and attendee tracking
- Participation analytics
- Certificate generation

### Public Portal
- Public announcements viewing
- Event calendar access
- Service information
- Contact details

### Authentication & User Management
- User registration with PENDING status
- Admin approval workflow
- Role-based permissions
- Secure login/logout
- Password reset functionality

### Technical Features
- Progressive Web App (PWA) with offline capabilities
- File upload with Supabase Storage integration
- Automated certificate generation (PDF)
- Role-based dashboard widgets
- Real-time notifications
- Data export capabilities

## Development Conventions

### Code Structure
- Frontend follows React best practices with component-based architecture
- Backend uses Express with modular route organization
- Prisma schema serves as single source of truth for database structure
- Environment variables are managed separately for local and production

### Naming Conventions
- PascalCase for React components
- camelCase for functions and variables
- kebab-case for file names and route paths
- UPPERCASE for environment variables

### Security Practices
- Passwords are hashed using bcrypt
- JWT tokens for authentication with proper expiration
- Input validation using Zod schemas
- CORS configured for secure cross-origin requests
- Helmet.js for security headers

### File Structure
The project follows a clear separation of concerns:
```
theycare-portal/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handling logic
│   │   ├── routes/          # API route definitions
│   │   ├── middleware/      # Authentication and validation
│   │   ├── utils/           # Helper functions and utilities
│   │   └── index.ts         # Main server file
│   ├── prisma/              # Database schema and migrations
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-based components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript type definitions
│   │   └── App.tsx          # Main application component
│   └── package.json
├── README.md                # Basic project info
├── DEMO_GUIDE.md            # Presentation and demo instructions
└── DEPLOYMENT_*             # Comprehensive deployment documentation
```

## Testing & Quality Assurance

While the package.json doesn't show specific test frameworks, the application should follow modern testing practices:
- Unit tests for critical business logic
- Integration tests for API endpoints
- Component tests for UI elements
- End-to-end tests for critical user flows

## Contributing Guidelines

Contributions should follow the established code structure and conventions:
1. Maintain consistent code style with existing codebase
2. Follow security best practices
3. Update documentation for new features
4. Follow the existing environment variable patterns
5. Respect the project's architectural decisions

This project serves as a modern, full-stack solution for barangay management, emphasizing accessibility, security, and user experience while maintaining a sustainable free-tier deployment model.