let $canvas;
let $state;
let video, ctx;
let maskCanvas, maskCtx;
let bodySegmentation;
let bgImage;
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
    ctx.clearRect(0, 0, $canvas.width, $canvas.height);
    if (segmentation) {
      // ctx.fillStyle = 'hotpink';
      // maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      // Draw the background image first
      maskCtx.globalCompositeOperation = 'source-over';
      maskCtx.drawImage(bgImage, 0, 0, maskCanvas.width, maskCanvas.height);
      // Use the segmentation mask to clip: only body area keeps the image
      maskCtx.globalCompositeOperation = 'destination-in';
      maskCtx.putImageData(segmentation.mask, 0, 0);
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-$canvas.width, 0);
      ctx.drawImage(video, 0, 0);
      ctx.drawImage(maskCanvas, 0, 0);
      ctx.restore();
    }
  }
  requestAnimationFrame(draw);
}

const setup = async () => {
  console.log('setup');
  ctx = $canvas.getContext('2d');
  // load background image
  bgImage = new Image();
  bgImage.src = 'img/background.png';
  await new Promise((resolve) => { bgImage.onload = resolve; });
  // create a mask canvas
  maskCanvas = document.createElement('canvas');
  maskCtx = maskCanvas.getContext('2d');
  // create a video stream - specify a fixed size
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: 640,
      height: 480
    }
  });
  video = document.createElement('video');
  video.srcObject = stream;
  video.play();
  // set video & canvas size
  $canvas.width = video.width = maskCanvas.width = 640;
  $canvas.height = video.height = maskCanvas.height = 480;
  // start detecting
  bodySegmentation.detectStart(video, (result) => {
    // store the result in a global variable
    segmentation = result;
  });
  // start the app
  setState(STATE_RUNNING);
}

const preload = async () => {
  setState(STATE_LOADING);
  requestAnimationFrame(draw);
  // bodySegmentation = await ml5.bodySegmentation("BodyPix", { maskType: "parts" });
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