import { useState, useRef, useEffect } from "react";

/**
 * Manages the name-drawing canvas for step 1.
 * Returns { canvasRef, hasDrawn, handleClear, handleSave }
 * handleSave(onSaved) calls onSaved(dataUrl) when the canvas is exported.
 */
export function useCanvasDrawing(active) {
  const canvasRef = useRef(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.lineCap   = "round";
    ctx.lineJoin  = "round";
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#1477CC";

    const getPos = (e) => {
      const rect    = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: ((clientX - rect.left) / rect.width)  * canvas.width,
        y: ((clientY - rect.top)  / rect.height) * canvas.height,
      };
    };

    let lastPos = null;

    const handleStart = (e) => { lastPos = getPos(e); setHasDrawn(true); };

    const handleMove = (e) => {
      if (e.touches) e.preventDefault();
      const pos = getPos(e);
      ctx.beginPath();
      if (lastPos) {
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else {
        ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#1477CC";
        ctx.fill();
      }
      lastPos = pos;
      setHasDrawn(true);
    };

    const handleEnd = () => { lastPos = null; };

    canvas.addEventListener("mouseenter",  handleStart);
    canvas.addEventListener("mousemove",   handleMove);
    canvas.addEventListener("mouseleave",  handleEnd);
    canvas.addEventListener("touchstart",  handleStart, { passive: false });
    canvas.addEventListener("touchmove",   handleMove,  { passive: false });
    canvas.addEventListener("touchend",    handleEnd);

    return () => {
      canvas.removeEventListener("mouseenter",  handleStart);
      canvas.removeEventListener("mousemove",   handleMove);
      canvas.removeEventListener("mouseleave",  handleEnd);
      canvas.removeEventListener("touchstart",  handleStart);
      canvas.removeEventListener("touchmove",   handleMove);
      canvas.removeEventListener("touchend",    handleEnd);
    };
  }, [active]);

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = (onSaved) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSaved(canvas.toDataURL("image/png"));
  };

  return { canvasRef, hasDrawn, handleClear, handleSave };
}
