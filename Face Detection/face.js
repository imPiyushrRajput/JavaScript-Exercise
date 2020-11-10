const video = document.querySelector('.webcam');

const canvas = document.querySelector('.video');
const ctx = canvas.getContext('2d');

const faceCanvas = document.querySelector('.face');
const faceCtx = faceCanvas.getContext('2d');

const faceDetector = new window.FaceDetector();

const optionsInputs = document.querySelectorAll('.controls input[type="range"]');

const options = {
  SIZE: 10,
  SCALE: 1.35,
};

function handleOption(event) {
  const { value, name } = event.currentTarget;
  options[name] = parseFloat(value);
}

optionsInputs.forEach(input => input.addEventListener('input', handleOption));


async function populateVideo() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 },});
  video.srcObject = stream;
  await video.play();
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  faceCanvas.width = video.videoWidth;
  faceCanvas.height = video.videoHeight;
}

async function detect() {
  const faces = await faceDetector.detect(video);
  faces.forEach(drawFace);
  faces.forEach(censor);
  requestAnimationFrame(detect);
}

function drawFace(face) {
  const { width, height, top, left } = face.boundingBox;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgb(255,255,255)';
  ctx.lineWidth = 3;
  ctx.strokeRect(left, top, width, height);

}

function censor({ boundingBox: face }) {
  
  faceCtx.imageSmoothingEnabled = false;
  faceCtx.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
  
  faceCtx.drawImage(video, face.x, face.y, face.width, face.height, face.x, face.y, options.SIZE, options.SIZE);

  const width = face.width * options.SCALE;
  const height = face.height * options.SCALE;

  faceCtx.drawImage(faceCanvas, face.x, face.y, options.SIZE, options.SIZE, face.x - (width - face.width) / 2, face.y - (height - face.height) / 2, width, height );
}

populateVideo().then(detect);
