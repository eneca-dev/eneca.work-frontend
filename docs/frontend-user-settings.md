# Frontend User Settings Management

## Overview
The User Settings functionality provides a complete profile management system for users. It allows users to view and update their personal information, department, team, position, and category assignments.

## Components

### Settings Page
- **Location**: [`app/dashboard/settings/page.tsx`](../app/dashboard/settings/page.tsx)
- **Description**: Main settings page component that presents the user profile editing form
- **Features**:
  - Form with personal information fields
  - Department and team selection
  - Position and category selection
  - Profile photo management
  - Role and permissions display

### Form Components
- **FormInput**: [`components/FormInput.tsx`](../components/FormInput.tsx)
  - Enhanced input field with validation support
  - Error state display
  - Label and styling consistency

- **SelectField**: [`components/SelectField.tsx`](../components/SelectField.tsx)
  - Dropdown component for reference data selection
  - Works with department, team, position, and category data
  - Error state display

## Hooks and Data Management

### Profile Hook
- **Location**: [`hooks/useProfile.tsx`](../hooks/useProfile.tsx)
- **Description**: Custom hook for profile data management
- **Features**:
  - TanStack React Query for data fetching and caching
  - Profile data retrieval
  - Profile updates with optimistic updates
  - Loading and error state management
  - Toast notifications for success/error feedback

### Reference Data Hook
- **Location**: [`hooks/useReferences.tsx`](../hooks/useReferences.tsx)
- **Description**: Custom hook for reference data management
- **Features**:
  - Fetching departments, teams, positions, categories
  - Filtering teams by selected department
  - Loading and error state management

## API Services

### Profile API
- **Location**: [`lib/api/profile.ts`](../lib/api/profile.ts)
- **Description**: API functions for user profile management
- **Operations**:
  - `fetchUserProfile()`: Retrieve the current user's profile
  - `updateUserProfile()`: Update user profile information

### Reference Data API
- **Location**: [`lib/api/references.ts`](../lib/api/references.ts)
- **Description**: API functions for reference data
- **Operations**:
  - `fetchDepartments()`: Get all departments
  - `fetchTeams()`: Get teams (optionally filtered by department)
  - `fetchPositions()`: Get all positions
  - `fetchCategories()`: Get all categories

### Type Definitions
- **Location**: [`hooks/auth/types.ts`](../hooks/auth/types.ts)
- **Description**: TypeScript interfaces for user profile and reference data
- **Key Types**:
  - `UserProfile`: User profile data structure
  - `Department`: Department data structure
  - `Team`: Team data structure with department association
  - `Position`: Position data structure
  - `Category`: Category data structure

## Development Support

### Mock Data
- **Location**: [`lib/api/mock-data.ts`](../lib/api/mock-data.ts)
- **Description**: Mock data for development
- **Features**:
  - Sample departments, teams, positions, categories
  - Sample user profile data
  - Used automatically in development mode

### React Query Provider
- **Location**: [`lib/providers/query-provider.tsx`](../lib/providers/query-provider.tsx)
- **Description**: Sets up TanStack React Query for the application
- **Features**:
  - QueryClient configuration with sensible defaults
  - Applied in the root layout for global availability

## Flow and Functionality

1. User navigates to the Settings page
2. The settings page loads the user profile using `useProfile` hook
3. Reference data (departments, teams, etc.) is loaded via `useReferences` hook
4. Form is populated with current user data
5. When a department is selected, related teams are filtered automatically
6. User edits their profile information
7. On form submission, profile data is updated via `updateProfile`
8. Success/error notifications are displayed using toast messages
9. Optimistic updates provide immediate feedback

## State Management
- Form state is managed with React Hook Form
- Server state is managed with TanStack React Query
- Changes are tracked to enable/disable the save button
- Unsaved changes trigger a confirmation prompt on page navigation
