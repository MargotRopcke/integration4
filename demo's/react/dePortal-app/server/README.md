# Supabase

Strapi is not the only option for a backend. There are plenty of other (hosted) options available. There is [Contentfull](https://www.contentful.com/), [Sanity](https://www.sanity.io/), [Firebase](https://firebase.google.com/), [Airtable](https://www.airtable.com/), [Baserow](https://baserow.io/) and many more. In this example, we will use [Supabase](https://supabase.com/) as a backend. Supabase is an open-source Firebase alternative that provides a Postgres database, authentication, and real-time subscriptions.

## Setup

After creating a Supabase account, you can create a table in a Supabase project. You can do this in the Supabase dashboard. The table should look like this:

```postgresql
create table public."Contacts" (
  id uuid not null default gen_random_uuid (),
  "createdAt" time with time zone null,
  first text null,
  last text null,
  twitter text null,
  avatar text null,
  favorite boolean null,
  notes character varying null,
  constraint Contacts_pkey primary key (id)
) TABLESPACE pg_default;
```

You can run this command in the SQL editor in the Supabase dashboard. There should be an empty table called `Contacts` after running this command.

### Locked

- When you've create the table, you will notice a lock icon next to the table name.  We have to setup some policies to allow to read and write data to the table.

  **WE ARE ABOUT TO OPEN UP THE TABLE FOR EVERYONE TO READ AND WRITE DATA. THIS IS NOT SECURE AND SHOULD NOT BE DONE IN PRODUCTION. BUT FOR NOW...**

- At the right, click the `RLS Disabled` button, go ahead and click `Enable`.
- Click that button again to create an 'RLS Policy'.
- Create a policy now (button on the right)
  - name it something like 'Allow all users to read and write, very very bad idea'.
  - select 'ALL' for the 'Policy Command'
  - set `true` for the 'Using' Expression
  - Uncheck 'Check Expression'.

### API Key

- Go to the `Project overview` tab (Home icon) in the left menu. Next to 'Connecting to your new project', you will see your `Project URL` and `API key`. You will need these values for the `VITE_API_BASE_URL` and `VITE_API_KEY` in the `.env` file.

## Backend communication

Instead of using a plain REST API, we will use the [Supabase JavaScript Client Library](https://supabase.com/docs/reference/javascript/start) to communicate with the backend. Nothing special here, it's just a wrapper around the [REST API](https://supabase.com/docs/guides/api) but can me more convenient to work with. Similar platforms often provide a library like this. Install the library in the client project.

## Fix the issue

Look for tests that are failing and try to fix them.
