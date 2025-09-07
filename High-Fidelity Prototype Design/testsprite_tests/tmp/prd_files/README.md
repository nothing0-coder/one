# SplitEasy Backend

This directory contains the backend Supabase Edge Functions for the SplitEasy expense splitting application.

## Tech Stack

- **Runtime**: Supabase Edge Functions (Deno runtime)
- **Framework**: Hono (lightweight web framework)
- **Language**: TypeScript
- **Database**: Supabase PostgreSQL

## Setup

### Prerequisites

1. Install the Supabase CLI:

   ```bash
   npm install -g supabase
   ```

2. Initialize Supabase in your project (if not already done):

   ```bash
   supabase init
   ```

3. Link to your Supabase project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ```

### Local Development

1. Start the local Supabase stack:

   ```bash
   supabase start
   ```

2. Serve the edge functions locally:
   ```bash
   npm run dev
   # or
   supabase functions serve
   ```

The server function will be available at:
`http://localhost:54321/functions/v1/server`

## API Endpoints

The server function provides the following endpoints:

### Authentication

- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/signout` - User logout

### User Management

- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile

### Groups

- `POST /groups` - Create a new group
- `GET /groups` - Get user's groups
- `POST /groups/:id/members` - Add member to group
- `GET /groups/:id/members` - Get group members

### Expenses

- `POST /expenses` - Create new expense
- `GET /expenses` - Get expenses (optionally filtered by group)

### Dashboard

- `GET /dashboard/stats` - Get dashboard statistics

## Deployment

Deploy the server function to Supabase:

```bash
npm run deploy
# or
supabase functions deploy server
```

## Environment Variables

Make sure to set up the following environment variables in your Supabase project:

- Database connection is handled automatically by Supabase
- Authentication is handled by Supabase Auth

## File Structure

```
backend/
├── package.json
├── README.md
└── supabase/
    └── functions/
        └── server/
            ├── index.tsx      # Main server function
            └── kv_store.tsx   # Key-value store utilities
```

## Development Notes

- The server uses Hono framework for routing and middleware
- All routes require authentication except for signup
- CORS is configured for the frontend applications
- The function runs on the Deno runtime in Supabase Edge Functions
