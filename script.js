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

// 🌗 Toggle theme
themeSwitch.addEventListener("change", () => {
  document.body.classList.toggle("dark", themeSwitch.checked);
});

// ✅ URL check
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

// ✅ Scan result handler
function onScanSuccess(decodedText) {
  console.log("Scanned:", decodedText);
  resultText.textContent = decodedText;
  scanResult.style.display = "block";
  navigator.vibrate?.(200);
  new Audio("https://www.soundjay.com/buttons/sounds/button-3.mp3").play();

  if (isValidUrl(decodedText)) {
    window.open(decodedText, "_blank");
  }

  stopCamera();
}

// 🎥 Request permission
async function requestCameraAccess() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch {
    alert("Camera permission denied.");
    return false;
  }
}

// ✅ Start scanner using selected camera
async function startCamera() {
  const granted = await requestCameraAccess();
  if (!granted) return;

  currentCameraId = cameraSelect.value;
  reader.start(currentCameraId, { fps: 10, qrbox: 250 }, onScanSuccess).then(() => {
    startScanBtn.disabled = true;
    stopScanBtn.disabled = false;
  });
}

// ⛔️ Stop scanner
function stopCamera() {
  reader.stop().then(() => {
    startScanBtn.disabled = false;
    stopScanBtn.disabled = true;
  });
}

// 📸 Populate camera list and auto-select back camera
function populateCameraOptions() {
  Html5Qrcode.getCameras().then(devices => {
    cameraSelect.innerHTML = "";
    let backCamIndex = 0;

    devices.forEach((cam, index) => {
      const option = document.createElement("option");
      option.value = cam.id;
      option.text = cam.label || `Camera ${index + 1}`;
      cameraSelect.appendChild(option);

      // Match back camera label
      if (/back|rear/i.test(cam.label)) {
        backCamIndex = index;
      }
    });

    // Auto-select back camera if found
    cameraSelect.selectedIndex = backCamIndex;
  });
}

// 📋 Copy result
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(resultText.textContent);
  alert("Copied to clipboard!");
});

// 🔗 Share result
shareBtn.addEventListener("click", () => {
  if (navigator.share) {
    navigator.share({ text: resultText.textContent });
  } else {
    alert("Sharing not supported on this browser.");
  }
});

// 🖼 Scan from image
imageFile.addEventListener("change", e => {
  if (!e.target.files.length) return;
  const file = e.target.files[0];
  reader.scanFile(file, true)
    .then(result => onScanSuccess(result))
    .catch(() => alert("Failed to scan image."));
});

// 🎬 Init
startScanBtn.addEventListener("click", startCamera);
stopScanBtn.addEventListener("click", stopCamera);
populateCameraOptions();
