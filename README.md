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
2. run 'npm i' & 'npm install lottie-web'

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

## Printer Setup Guide

The portal prints the final photocollage automatically through the server-side `/print` route ([src/portal/app/services/print.js](src/portal/app/services/print.js)), which shells out to your OS's native print command. Since it doesn't go through a print dialog, the printer needs to be configured **on the machine running the portal server** before going live.

### 1. Connect the printer
Plug in or pair the printer (USB or Wi-Fi) to the host machine and install its OS driver as you normally would, so it shows up as a regular system printer.

### 2. Find the exact printer name
- **Windows**: Settings → Bluetooth & devices → Printers & scanners → copy the printer's exact display name.
- **macOS/Linux**: run `lpstat -p` in a terminal to list configured printer names (CUPS).

### 3. Update the config in `print.js`
Open [print.js:16](src/portal/app/services/print.js:16) and set:
```js
const PRINTER_NAME = "Your Exact Printer Name";
```
The name must match exactly — it's passed straight into the OS print command.

### 4. Windows only — install SumatraPDF
On Windows, silent (no-dialog) printing requires [SumatraPDF](https://www.sumatrapdfreader.org/download-free-pdf-viewer). Install it, then update [print.js:21](src/portal/app/services/print.js:21):
```js
const SUMATRA_PATH = "C:\\Path\\To\\SumatraPDF.exe";
```
If SumatraPDF isn't found at that path, the code falls back to `mspaint`'s print-to dialog, which is **not silent** — a window may flash up during printing.

macOS/Linux don't need anything extra; they use the built-in `lp` command (CUPS), which is installed by default.

### 5. Test it
With the dev server running, POST a small base64 JPEG to `/print` (or just walk through the portal's flow to the printing step) and confirm a physical page comes out. Check the server console for errors if `success: false` is returned — common issues are a typo'd `PRINTER_NAME` or the printer being offline.

### Notes
- Printing is forced to grayscale (`monochrome` / `ColorModel=Gray`) and scaled to fit the page automatically.
- Each print job writes a temporary `_collage_print.jpg` to the project root before sending it to the printer — this file is overwritten on every print, not cleaned up automatically.
