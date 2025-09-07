# Supabase Setup Guide

This document explains the Supabase configuration for this project.

## Files Created

### 1. Environment Configuration (.env)

- Contains Supabase URL and API keys
- Multiple naming conventions supported (Next.js, Vite, React)
- **Remember to replace placeholder values with your actual Supabase project credentials**

### 2. Supabase Client Configuration (lib/supabase.js)

- Initializes the Supabase client with environment variables
- Provides both default and named exports
- Includes optional admin client for server-side operations

### 3. Usage Examples (examples/basic-usage.js)

- Simple connection test
- Basic query example

## Setup Instructions

1. **Create a Supabase Project:**
   - Go to https://supabase.com
   - Create a new project
   - Note your project URL and API keys

2. **Update Environment Variables:**
   Edit the `.env` file and replace the placeholder values:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. **Verify Installation:**
   ```bash
   npm list @supabase/supabase-js
   ```

## Usage

Import the Supabase client in your JavaScript/TypeScript files:

```javascript
import supabase from "./lib/supabase.js";

// Example: Fetch data
const { data, error } = await supabase.from("your_table").select("*");
```

## Security Notes

- Never commit the `.env` file to version control
- Use different keys for different environments (development, staging, production)
- The service role key should only be used in secure server environments

## Installed Packages

- `@supabase/supabase-js`: Official Supabase JavaScript client

## Next Steps

1. Create tables in your Supabase dashboard
2. Set up Row Level Security (RLS) policies
3. Configure authentication if needed
4. Test the connection using the example files
