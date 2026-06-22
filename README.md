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

## Development Process

The project was developed using an iterative and research-driven approach. Before implementing major features, multiple prototypes and proof-of-concepts were created to evaluate technical feasibility and compare different solutions.

Several technologies were researched and tested throughout the development process, including ML5, MediaPipe, MapLibre, Supabase, React Router, touchscreen input and browser-based video processing. Existing tutorials, classroom exercises, official documentation and community resources were used as starting points for experimentation and implementation.

The application was built with React and React Router, allowing different parts of the project to be structured into reusable components and routes. Supabase was chosen as the backend database solution based on its ease of integration and suitability for the project's requirements. Database tables and seed data were created using a combination of manually entered content and AI-assisted SQL generation. Location data was collected manually through Google Maps and imported into the database.

During development, multiple approaches were explored for gesture recognition and background segmentation. Initial experiments with ML5 were eventually replaced by MediaPipe after evaluating performance, available documentation and reliability. Similar research and prototyping were conducted for mapping solutions, eventually leading to the adoption of MapLibre as a free and customizable alternative to Google Maps and Mapbox.

AI tools were used throughout the project as a development aid. They were primarily used for generating initial code structures, debugging, explaining unfamiliar technologies, adapting example code to project-specific requirements and accelerating repetitive development tasks. All AI-generated code was reviewed, tested and modified before being integrated into the project.

To ensure transparency regarding AI usage, every pull request requires the completion of an AI usage questionnaire. Contributors must document whether AI was used, how it was used and which parts of the implementation were influenced by AI-generated suggestions before a merge can be approved.

You can also find all our demos and tryouts in the demo folder, where you can see everything we tried and perhaps also how we approached things.

See the figma for more detail: https://www.figma.com/design/mpJdmvMZZ3YsKBAPYG6O1x/INT4?node-id=203-11718&t=SjhZnUqHX3G5SI3Y-1

 
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
