// app/routes/print.js
//
// Resource route — no UI, handles POST /print.
// Receives a base64 JPEG collage from the browser,
// writes it to disk, and sends it to the printer.

import { exec } from "child_process";
import { writeFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

// ─── Config ──────────────────────────────────────────────────────────────────

// Windows: update this to match your printer name exactly.
// Check: Settings → Bluetooth & devices → Printers & scanners
const PRINTER_NAME = "HP ENVY 5530 series";

// Windows: path to SumatraPDF for silent, no-dialog printing.
// Download: https://www.sumatrapdfreader.org/download-free-pdf-viewer
// Falls back to mspaint if not found.
const SUMATRA_PATH = "C:\\Users\\devin\\AppData\\Local\\SumatraPDF\\SumatraPDF.exe";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildPrintCmd(filePath) {
  if (process.platform === "win32") {
    if (existsSync(SUMATRA_PATH)) {
      return `"${SUMATRA_PATH}" -print-to "${PRINTER_NAME}" -print-settings "fit-page,monochrome" -silent "${filePath}"`;
    }
    return `rundll32 shimgvw.dll,ImageView_PrintTo /pt "${filePath}" "${PRINTER_NAME}"`;
  }

  if (process.platform === "darwin") {
    return `lp -d "${PRINTER_NAME}" -o ColorModel=Gray -o fit-to-page "${filePath}"`;
  }

  // Linux
  return `lp -d "${PRINTER_NAME}" -o ColorModel=Gray -o fit-to-page "${filePath}"`;
}

function runCmd(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err) => (err ? reject(err) : resolve()));
  });
}

// ─── Action ──────────────────────────────────────────────────────────────────

export async function action({ request }) {
  // Parse body
  let image;
  try {
    ({ image } = await request.json());
  } catch {
    return Response.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (!image?.startsWith("data:image/")) {
    return Response.json({ success: false, error: "Missing or invalid image field" }, { status: 400 });
  }

  // Write temp file
  const filePath = path.join(process.cwd(), "_collage_print.jpg");
  const base64 = image.replace(/^data:image\/\w+;base64,/, "");

  try {
    await writeFile(filePath, base64, "base64");
  } catch (err) {
    return Response.json({ success: false, error: `Could not write file: ${err.message}` }, { status: 500 });
  }

  // Print
  try {
    await runCmd(buildPrintCmd(filePath));
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
