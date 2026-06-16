const canvas = document.getElementById('drawingFrame');
const ctx = canvas.getContext('2d');

let isDrawing = false;

// Drawing settings
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.strokeStyle = 'black';
ctx.lineWidth = 3;

// --- Drawing events ---
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
});

canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);

// --- Touch support (for tablets / phones) ---
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.stroke();
});

canvas.addEventListener('touchend', () => isDrawing = false);

// --- Clear button ---
document.getElementById('clear').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// --- Save & Print button ---
document.getElementById('save').addEventListener('click', () => {
    // Export canvas as PNG with transparent background (no background fill)
    const imageData = canvas.toDataURL('image/png');

    // Store in localStorage so the print page can access it
    localStorage.setItem('drawingImage', imageData);

    // Navigate to the print page
    window.location.href = 'print.html';
});