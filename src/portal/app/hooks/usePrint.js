import { useState, useCallback } from "react";
import { saveCollage } from "../services/data";
import bagSvg  from "../../assets/stickers/bag-yellow.svg";
import lipsSvg from "../../assets/stickers/lips-green.svg";
import aLogoSvg from "../../assets/icons/a-logo.svg";

const BG_COLOR = "#fdfeef";       // style/creamy vanilla
const BRAND_RED = "#e03c31";      // style/blood orange

const CARD_COLORS = ["#fadae0", "#007fa3", "#e03c31", "#b5e28d", "#ffcd00", "#144552"];
const CARD_TEXT_COLORS = ["#e03c31", "#fdfeef", "#fdfeef", "#e03c31", "#e03c31", "#fdfeef"];

const CATEGORY_STICKER = {
  style:   bagSvg,
  flavour: lipsSvg,
};

export function usePrint() {
  const [status,     setStatus]     = useState("idle");
  const [collageUrl, setCollageUrl] = useState(null);
  const [errorMsg,   setErrorMsg]   = useState("");

  const loadImage = (src) => new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timeout = setTimeout(() => resolve(null), 8000);
    img.onload  = () => { clearTimeout(timeout); resolve(img); };
    img.onerror = () => { clearTimeout(timeout); resolve(null); };
    img.src = src;
  });

  const roundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const buildCollage = useCallback(async (photos, sessionUserId, categoryName) => {
    const W = 2480, H = 3508;

    const c   = document.createElement("canvas");
    c.width   = W;
    c.height  = H;
    const ctx = c.getContext("2d");

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, W, H);

    const cols    = 3, rows  = 2;
    const padX    = 160, padTop  = 120;
    const gapX    = 48,  gapY   = 32;
    const labelH  = 104, borderW = 14;
    const cellW   = Math.floor((W - padX * 2 - gapX * (cols - 1)) / cols);
    const gridH   = Math.round(H * 0.60);
    const cellH   = Math.floor((gridH - padTop - gapY * (rows - 1) - labelH * rows) / rows);

    // Pre-load custom fonts before drawing any text
    await Promise.allSettled([
      document.fonts.load("normal 200px AntwerpenTallTall"),
      document.fonts.load("700 48px SunAntwerpen"),
    ]);

    const qrSrc = sessionUserId
      ? `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(
          `https://margotropcke.github.io/integration4/?user=${sessionUserId}`
        )}`
      : null;

    const stickerSrc = categoryName
      ? CATEGORY_STICKER[categoryName.trim().toLowerCase()] ?? null
      : null;

    const photoImgs = await Promise.all(
      photos.slice(0, 6).map((p) => loadImage(p.dataUrl))
    );
    const qrImg      = await loadImage(qrSrc);
    const stickerImg = await loadImage(stickerSrc);

    for (let i = 0; i < Math.min(photos.length, 6); i++) {
      const col       = i % cols;
      const row       = Math.floor(i / cols);
      const x         = padX + col * (cellW + gapX);
      const y         = padTop + row * (cellH + gapY + labelH);
      const color     = CARD_COLORS[i % CARD_COLORS.length];
      const textColor = CARD_TEXT_COLORS[i % CARD_TEXT_COLORS.length];
      const img       = photoImgs[i];

      // Card frame: a single rounded shape spanning photo + label band
      ctx.fillStyle = color;
      roundRect(ctx, x - borderW, y - borderW, cellW + borderW * 2, cellH + borderW * 2 + labelH, 28);
      ctx.fill();

      ctx.save();
      roundRect(ctx, x, y, cellW, cellH, 16);
      ctx.clip();
      if (img) {
        const scale = Math.max(cellW / img.width, cellH / img.height);
        const dw = img.width * scale, dh = img.height * scale;
        ctx.drawImage(img, x + (cellW - dw) / 2, y + (cellH - dh) / 2, dw, dh);
      } else {
        ctx.fillStyle = "#ccc";
        ctx.fillRect(x, y, cellW, cellH);
      }
      ctx.restore();

      ctx.fillStyle = textColor;
      ctx.font      = "700 48px SunAntwerpen, Georgia, serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(photos[i].locationName || "", x + cellW / 2, y + cellH + borderW + labelH / 2);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
    }

    const bottomY = padTop + rows * (cellH + gapY + labelH) + 64;

    ctx.fillStyle = BRAND_RED;
    ctx.font      = "normal 200px AntwerpenTallTall, Georgia, serif";
    ctx.fillText("THE",    padX, bottomY + 200);
    ctx.fillText("PORTAL", padX, bottomY + 430);

    const logoImg = await loadImage(aLogoSvg);
    if (logoImg) {
      const lsz = 100;
      ctx.drawImage(logoImg, padX, bottomY + 470, lsz, lsz);
    }

    if (qrImg) {
      const qrSize = 480, qrX = W - padX - qrSize, qrY = bottomY + 40;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    }

    if (stickerImg) {
      const sz = 360, sx = W / 2 - sz / 2, sy = padTop + rows * (cellH + gapY + labelH) - sz * 0.45;
      ctx.drawImage(stickerImg, sx, sy, sz, sz);
    }

    // Screen preview — color, downscaled
    const pw = 620, ph = Math.round(H * pw / W);
    const preview = document.createElement("canvas");
    preview.width = pw; preview.height = ph;
    preview.getContext("2d").drawImage(c, 0, 0, pw, ph);
    const colorUrl = preview.toDataURL("image/jpeg", 0.9);

    // Print version — full resolution grayscale
    const gray = document.createElement("canvas");
    gray.width = W; gray.height = H;
    const gCtx = gray.getContext("2d");
    gCtx.drawImage(c, 0, 0);
    const imgData = gCtx.getImageData(0, 0, W, H);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const luma = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
      d[i] = d[i + 1] = d[i + 2] = luma;
    }
    gCtx.putImageData(imgData, 0, 0);
    const printUrl = gCtx.canvas.toDataURL("image/jpeg", 1.0);

    return { colorUrl, printUrl };
  }, []);

  const triggerPrint = useCallback(async (printUrl) => {
    const res  = await fetch("/print", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ image: printUrl }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Print failed");
  }, []);

  const startPrinting = useCallback(async (reactionPhotos, sessionUserId, categoryName, onDone, likedLocations = []) => {
    setStatus("printing");
    setErrorMsg("");
    try {
      // When user opted out of photos, fall back to location images from Supabase
      let photos = reactionPhotos;
      if (!photos || photos.length === 0) {
        if (likedLocations && likedLocations.length > 0) {
          photos = likedLocations.map((loc) => ({
            dataUrl: loc.image,
            locationName: loc.name,
            locationImage: loc.image,
            locationId: loc.keyID,
          }));
        } else {
          throw new Error("No photos to print.");
        }
      }
      const { colorUrl, printUrl } = await buildCollage(photos, sessionUserId, categoryName);
      setCollageUrl(colorUrl);

      const [printResult] = await Promise.allSettled([
        triggerPrint(printUrl),
        sessionUserId ? saveCollage(sessionUserId, colorUrl) : Promise.resolve(),
      ]);

      if (printResult.status === "rejected") throw printResult.reason;

      setStatus("done");
      setTimeout(() => onDone?.(), 2000);
    } catch (err) {
      console.error("Print error:", err);
      setErrorMsg(err.message || "Print failed.");
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
