# EnecaWork Frontend Structure

## Project Overview
EnecaWork Frontend is a Next.js application built with React, TypeScript, and Tailwind CSS. The project follows a modern modular architecture focusing on clean separation of concerns and component reusability.

## Directory Structure

### `/app`
The main application directory that follows Next.js 13+ App Router structure:
- `/app/page.tsx` - The landing page of the application
- `/app/layout.tsx` - The root layout that wraps all pages
- `/app/globals.css` - Global CSS styles
- `/app/auth/` - Authentication-related pages (login, register, forgot password)
- `/app/dashboard/` - Main application dashboard with various features
  - `/tasks/` - Task management functionality
  - `/planning/` - Planning and scheduling features
  - `/settings/` - User and application settings page with profile management

### `/components`
Reusable UI components organized by functionality:
- `/components/ui/` - Basic UI components (buttons, inputs, cards, etc.)
- `/components/debug/` - Components for debugging and development
- `sidebar.tsx` - Main navigation sidebar
- `auth-button.tsx` - Authentication buttons
- `auth-input.tsx` - Form inputs for authentication
- `FormInput.tsx` - Enhanced form input component with validation
- `SelectField.tsx` - Dropdown select field component
- `theme-provider.tsx` - Theme context provider for dark/light mode
- `theme-toggle.tsx` - Theme switching component
- `login-animation.tsx` - Animation component for login page

### `/lib`
Utility functions and shared logic:
- `/lib/auth/` - Authentication utilities
- `/lib/api/` - API service functions
  - `profile.ts` - User profile data fetching functions
  - `references.ts` - Reference data (departments, teams, etc.) fetching functions
  - `mock-data.ts` - Mock data for development mode
- `/lib/providers/` - React context providers
  - `query-provider.tsx` - TanStack React Query provider setup
- `/lib/logger/` - Logging functionality
- `/lib/mocks/` - Mock data for development
- `utils.ts` - General utility functions

### `/hooks`
Custom React hooks:
- `/hooks/auth/` - Authentication-related hooks and types
  - `types.ts` - TypeScript interfaces for authentication and user profiles
- `useProfile.tsx` - Hook for managing user profile data
- `useReferences.tsx` - Hook for managing reference data (departments, teams, etc.)
- `use-mobile.tsx` - Hook for responsive design and mobile detection
- `use-toast.ts` - Toast notification hook

### `/public`
Static assets like images, fonts, and icons.

### `/styles`
Additional styling resources beyond the global CSS.

## Configuration Files
- `next.config.mjs` - Next.js configuration, including API rewrites to the backend
- `middleware.ts` - Request middleware handling authentication and protected routes
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Project dependencies and scripts
  - Dependencies include `@tanstack/react-query` for data fetching
- `.env.local` - Environment variables (not committed to repository)

## Authentication Flow
The application implements a complete authentication system with:
- Login/Register
- Email verification
- Password reset
- Protected routes
- Token-based authentication with refresh tokens

## Data Management
- TanStack React Query for server state management
- Support for both production API calls and development mode mock data
- Form validation with React Hook Form

## Development Workflow
The project uses Next.js development server with hot reloading. Start the development server with:
```
npm run dev
```

## Deployment
The application is configured for deployment on Vercel with production API endpoints.
