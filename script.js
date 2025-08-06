const reader = new Html5Qrcode("reader");
const scanResult = document.getElementById("scanResult");
const resultText = document.getElementById("resultText");
const copyBtn = document.getElementById("copyBtn");
const shareBtn = document.getElementById("shareBtn");
const startScanBtn = document.getElementById("startScanBtn");
const stopScanBtn = document.getElementById("stopScanBtn");
const themeSwitch = document.getElementById("themeSwitch");
const imageFile = document.getElementById("imageFile");
const cameraSelect = document.getElementById("cameraSelect");

let currentCameraId = null;

themeSwitch.addEventListener("change", () => {
  document.body.classList.toggle("dark", themeSwitch.checked);
});

function onScanSuccess(decodedText) {
  resultText.textContent = decodedText;
  scanResult.style.display = "block";
  navigator.vibrate?.(200);
  new Audio("https://www.soundjay.com/buttons/sounds/button-3.mp3").play();
  stopCamera();
}

function startCamera() {
  Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
      currentCameraId = cameraSelect.value || devices[0].id;
      reader.start(
        currentCameraId,
        {
          fps: 10,
          qrbox: 250
        },
        onScanSuccess
      ).then(() => {
        startScanBtn.disabled = true;
        stopScanBtn.disabled = false;
      });
    }
  });
}

function stopCamera() {
  reader.stop().then(() => {
    startScanBtn.disabled = false;
    stopScanBtn.disabled = true;
  });
}

function populateCameraOptions() {
  Html5Qrcode.getCameras().then(devices => {
    cameraSelect.innerHTML = "";
    devices.forEach(cam => {
      const option = document.createElement("option");
      option.value = cam.id;
      option.text = cam.label || `Camera ${cameraSelect.length + 1}`;
      cameraSelect.appendChild(option);
    });
  });
}

startScanBtn.addEventListener("click", startCamera);
stopScanBtn.addEventListener("click", stopCamera);
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(resultText.textContent);
  alert("Copied to clipboard");
});

shareBtn.addEventListener("click", () => {
  if (navigator.share) {
    navigator.share({ text: resultText.textContent });
  } else {
    alert("Sharing not supported on this browser.");
  }
});

imageFile.addEventListener("change", e => {
  if (e.target.files.length === 0) return;

  const file = e.target.files[0];
  reader.scanFile(file, true)
    .then(result => onScanSuccess(result))
    .catch(err => alert("Failed to scan image."));
});

// Init
populateCameraOptions();
