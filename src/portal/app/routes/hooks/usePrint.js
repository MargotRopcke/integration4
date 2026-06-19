import { useState, useCallback } from "react";

/**
 * Builds a photo collage and sends it to the local print server.
 */
export function usePrint() {
  const [status,    setStatus]    = useState("idle"); // "idle"|"printing"|"done"|"error"
  const [collageUrl,setCollageUrl]= useState(null);
  const [errorMsg,  setErrorMsg]  = useState("");

  const buildCollage = useCallback((photos) => {
    const cols  = 3, cellW = 640, cellH = 480, pad = 16;
    const rows  = Math.ceil(photos.length / cols);
    const cw    = cols * cellW + (cols + 1) * pad;
    const ch    = rows * cellH + (rows + 1) * pad;

    const c   = document.createElement("canvas");
    c.width   = cw;
    c.height  = ch;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, cw, ch);

    const drawCell = (img, x, y) => {
      const r = 12;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + cellW - r, y);
      ctx.quadraticCurveTo(x + cellW, y, x + cellW, y + r);
      ctx.lineTo(x + cellW, y + cellH - r);
      ctx.quadraticCurveTo(x + cellW, y + cellH, x + cellW - r, y + cellH);
      ctx.lineTo(x + r, y + cellH);
      ctx.quadraticCurveTo(x, y + cellH, x, y + cellH - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, x, y, cellW, cellH);
      ctx.restore();
      // Label bar
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(x, y + cellH - 36, cellW, 36);
    };

    const promises = photos.map((photo, i) => new Promise((resolve) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x   = pad + col * (cellW + pad);
      const y   = pad + row * (cellH + pad);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        drawCell(img, x, y);
        ctx.fillStyle = "#fff";
        ctx.font      = "bold 18px system-ui, sans-serif";
        ctx.fillText(`📍 ${photo.locationName}`, x + 12, y + cellH - 11);
        resolve();
      };
      img.onerror = resolve;
      img.src = photo.dataUrl;
    }));

    return Promise.all(promises).then(() => c.toDataURL("image/jpeg", 0.92));
  }, []);

  const triggerPrint = useCallback(async (dataUrl) => {
    const res  = await fetch("http://127.0.0.1:3456/print-collage", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ image: dataUrl }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Print failed");
  }, []);

  /**
   * @param {object[]} reactionPhotos  - captured during swipe
   * @param {object[]} likedLocations  - fallback if no photos
   * @param {Function} onDone          - called after successful print (navigate to next step)
   */
  const startPrinting = useCallback(async (reactionPhotos, likedLocations, onDone) => {
    setStatus("printing");
    setErrorMsg("");
    try {
      const items = reactionPhotos.length > 0
        ? reactionPhotos
        : likedLocations.map((loc) => ({ dataUrl: loc.image, locationName: loc.name }));

      const url = items.length > 0 ? await buildCollage(items) : null;
      setCollageUrl(url);
      if (url) await triggerPrint(url);
      setStatus("done");
      setTimeout(() => onDone?.(), 2000);
    } catch (err) {
      console.error("Print error:", err);
      setErrorMsg(err.message || "Could not reach print server.");
      setStatus("error");
    }
  }, [buildCollage, triggerPrint]);

  const reset = useCallback(() => {
    setStatus("idle");
    setCollageUrl(null);
    setErrorMsg("");
  }, []);

  return { status, collageUrl, errorMsg, startPrinting, reset };
}
