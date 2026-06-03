let $canvas;
let $state;
let video, ctx;
let maskCanvas, maskCtx;
let bodySegmentation;
let segmentation;
const STATE_LOADING = "loading";
const STATE_RUNNING = "running";
const ALL_STATES = [STATE_LOADING, STATE_RUNNING];
let state = STATE_LOADING;

const setState = (value) => {
    console.log('setState', value);
    state = value;
    $state.textContent = state;
    document.documentElement.classList.remove(...ALL_STATES);
    document.documentElement.classList.add(state);
};

const draw = () => {
    if (state === STATE_RUNNING) {
        // 1. Clear the main canvas
        ctx.clearRect(0, 0, $canvas.width, $canvas.height);

        if (segmentation) {
            // 2. Draw the mask onto the hidden mask canvas
            maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
            maskCtx.putImageData(segmentation.mask, 0, 0);

            ctx.save();

            // Mirror the canvas to match a webcam view
            ctx.scale(-1, 1);
            ctx.translate(-$canvas.width, 0);

            // 3. Fill the entire background with hotpink first
            ctx.fillStyle = "hotpink";
            ctx.fillRect(0, 0, $canvas.width, $canvas.height);

            // 4. Draw the person's mask outline onto the main canvas
            ctx.drawImage(maskCanvas, 0, 0);

            // 5. Change composition mode so the video ONLY draws inside the mask
            // ctx.globalCompositeOperation = "source-over";
            // ctx.putImageData(segmentation.mask, 0, 0);
            // ctx.drawImage(video, 0, 0);

            // 6. Reset composition mode so it behaves normally on the next frame
            ctx.globalCompositeOperation = "source-in";

            ctx.restore();
        }
    }
    requestAnimationFrame(draw);
}

const setup = async () => {
    console.log('setup');
    ctx = $canvas.getContext('2d');

    maskCanvas = document.createElement('canvas');
    maskCtx = maskCanvas.getContext('2d');

    const stream = await navigator.mediaDevices.getUserMedia({
        video: {
            width: 640,
            height: 480
        }
    });
    video = document.createElement('video');
    video.srcObject = stream;
    video.play();

    $canvas.width = video.width = maskCanvas.width = 640;
    $canvas.height = video.height = maskCanvas.height = 480;

    bodySegmentation.detectStart(video, (result) => {
        segmentation = result;
    });

    setState(STATE_RUNNING);
}

const preload = async () => {
    setState(STATE_LOADING);
    requestAnimationFrame(draw);
    bodySegmentation = await ml5.bodySegmentation("SelfieSegmentation", {
        maskType: "person",
    });
    console.log('model ready');
    setup();
}

const init = () => {
    $canvas = document.querySelector('#canvas');
    $state = document.querySelector('#state');
    preload();
}
init();