# Integration4
Integration 4: Femke Denoo, Mila Jakiç, Eline Deblancq, Margot Röpcke

## List team members and roles: 
- Femke Denoo, Lead Visual Design
- Eline Deblancq, Lead Development
- Margot Röpcke, Lead Experience Design
- Mila Jakic, Project Manager

## List agreements:
- Communicate
- Be present
- Finish tasks
- Honesty
- Put in effort

## List links process etc.:
- Figjam: https://www.figma.com/board/Ln5E4FdmMkBqnhtheX4yGl/INT4-FJ?node-id=41-2&t=bEkD5Hre0IFDZGRn-1
- Figma: https://www.figma.com/design/mpJdmvMZZ3YsKBAPYG6O1x/INT4?node-id=43-60&t=kTfVcQNCcco6jNe3-1

 
## setup
To run the project on your own machine, follow these steps:

1. Download the project folders

Copy both the portal and webapp folders into your local src directory.

2. Update the QR code link

Before starting the application, you need to update the QR code URL used by the portal.

Open the following file:

portal/app/routes/steps/stepQR.jsx

Replace the current QR code link with a URL that points to your local version of the application.

3. Set up the environment variables

Create an .env file and add your own database credentials and API keys.

An .env.example file is included to help you get started with the required configuration.

4. Create the database

This project uses Supabase as its database provider.

In the setup folder, you will find:

SQL scripts to create the database structure.
SQL scripts to populate the database with the required data.

Additional documentation is available:

database-tables.md – Overview of the database schema and table structure.
database-data.md – Description of the initial data and its contents.
5. Start the application

Once the QR code URL, environment variables, and database have been configured, you can run the project locally.