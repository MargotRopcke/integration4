# The Portal — Server

## Backend: Supabase

This project uses [Supabase](https://supabase.com/) as its backend. There is no custom server — the React client communicates directly with Supabase using the [@supabase/supabase-js](https://supabase.com/docs/reference/javascript/start) library.

## Database

- **Project URL**: `https://wdjqycfyucakllhzxqxv.supabase.co`
- **Table**: `locations`

### Table Schema

| Column               | Type      | Description                        |
|----------------------|-----------|------------------------------------|
| `keyID`              | uuid      | Primary key                        |
| `id`                 | integer   | Location ID                        |
| `name`               | text      | Location name                      |
| `image`              | text      | Image URL                          |
| `price`              | text      | Price info                         |
| `address`            | text      | Street address                     |
| `latitude`           | float     | GPS latitude                       |
| `longitude`          | float     | GPS longitude                      |
| `quote`              | text      | Location quote                     |
| `primary_category_id`| integer   | Vibe category (not yet linked)     |
| `created_at`         | timestamp | Creation timestamp                 |
| `Draggable`          | boolean   | Draggable flag                     |

## Setup

1. The Supabase credentials are configured in the client's `.env` file
2. RLS policies must allow public read access to the `locations` table
3. No additional server setup is needed
