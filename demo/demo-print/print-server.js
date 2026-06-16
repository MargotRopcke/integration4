const http = require("http");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const PORT = 3456;
const PRINTER_NAME = "HP_ENVY_5530_series";
const PHOTO_PATH = path.join(__dirname, "A2.png"); // photo must be in same folder

const server = http.createServer((req, res) => {
  // Allow requests from the local webpage
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/print") {
    if (!fs.existsSync(PHOTO_PATH)) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: "A2.png not found next to print-server.js" }));
      return;
    }

    let printCmd;

    if (process.platform === "win32") {
      // Windows: use mspaint to print silently
      printCmd = `mspaint /pt "${PHOTO_PATH}" "${PRINTER_NAME}"`;
    } else if (process.platform === "darwin") {
      // macOS: use lp with black & white option
      printCmd = `lp -d "${PRINTER_NAME}" -o ColorModel=Gray "${PHOTO_PATH}"`;
    } else {
      // Linux: use lp
      printCmd = `lp -d "${PRINTER_NAME}" "${PHOTO_PATH}"`;
    }

    console.log("Running:", printCmd);
    exec(printCmd, (error, stdout, stderr) => {
      if (error) {
        console.error("Print error:", error.message);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: error.message }));
      } else {
        console.log("Print job sent successfully.");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`\n✅ Print server running at http://127.0.0.1:${PORT}`);
  console.log(`🖨️  Printer: ${PRINTER_NAME}`);
  console.log(`🖼️  Photo:   ${PHOTO_PATH}`);
  console.log(`\nKeep this window open, then open index.html in your browser.\n`);
});