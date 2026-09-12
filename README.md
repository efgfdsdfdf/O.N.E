# O.N.E Multi-Concepts

Production-ready automotive website and inventory management system built with React, Vite, Tailwind CSS, and Supabase.

## Features

- **Public Website**: Beautiful, dark-themed responsive design optimized for mobile.
- **WhatsApp Integration**: Every listing generates customized WhatsApp messages directly to the seller.
- **Product Discovery**: Search, filter, and sort vehicles, accessories, spare parts, and more.
- **Favorites System**: Save items without needing a user account (uses localStorage).
- **Admin Dashboard**: Full CRUD inventory management, enquiries tracking, and analytics.
- **Supabase Backend**: Complete PostgreSQL schema with Row Level Security (RLS) policies.

## Prerequisites

- Node.js 18+ (React 19, Vite)
- A Supabase account and project

## Setup Instructions

### 1. Database Setup (Supabase)

1. Create a new project on [Supabase](https://supabase.com/).
2. Navigate to the SQL Editor in your Supabase dashboard.
3. Open `supabase/migrations/001_initial_schema.sql` from this repository.
4. Copy the entire contents and run it in the SQL Editor. This will create all tables, enums, triggers, and RLS policies.
5. Create a storage bucket named `listings` and make it public.

### 2. Environment Variables

1. Copy `.env.example` to `.env`.
2. Get your Supabase URL and Anon Key from your project settings (Project Settings -> API).
3. Update the `.env` file:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_SITE_URL=http://localhost:5173
   ```

### 3. Create an Admin User

1. Go to Authentication in your Supabase dashboard.
2. Click "Add User" -> "Create New User".
3. Enter an email (e.g., `admin@onemulticoncepts.com.ng`) and password.
4. The auto-profile trigger in the database will automatically set this user's role to 'admin'.

### 4. Seed Essential Settings (Required)

Run the following SQL in your Supabase SQL Editor to configure your site's WhatsApp number and basic details:

```sql
INSERT INTO website_settings (key, value) VALUES 
('business_name', 'O.N.E Multi-Concepts'),
('business_phone', '+2348000000000'),
('business_whatsapp', '+2348000000000'), -- IMPORTANT: Required for contact buttons
('business_email', 'admin@onemulticoncepts.com.ng'),
('business_address', 'Ikeja, Lagos, Nigeria'),
('business_coordinates_lat', '6.6018'),
('business_coordinates_lng', '3.3515'),
('business_opening_hours', '{"Monday":"9:00 AM - 6:00 PM","Tuesday":"9:00 AM - 6:00 PM","Wednesday":"9:00 AM - 6:00 PM","Thursday":"9:00 AM - 6:00 PM","Friday":"9:00 AM - 6:00 PM","Saturday":"10:00 AM - 4:00 PM","Sunday":"Closed"}'),
('hero_title', 'Your Trusted Automotive Partner'),
('hero_subtitle', 'Quality vehicles, genuine parts, and premium accessories all in one place.');
```

### 5. Running the Application

1. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Visit `http://localhost:5173` to see the public site.
4. Visit `http://localhost:5173/admin` to log in with the user you created in Step 3.

## Tech Stack Details

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v3, shadcn/ui (Radix UI primitives)
- **Routing**: React Router v6
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Maps**: React Leaflet
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
