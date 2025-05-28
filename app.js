const form = document.getElementById("qrForm");
const qrContainer = document.getElementById("qrcode");
const downloadContainer = document.getElementById("downloadContainer");
const logoPreview = document.getElementById("logoPreview");
let logoURL = "";

form.addEventListener("submit", function (e) {
  e.preventDefault();
  qrContainer.innerHTML = "";
  downloadContainer.innerHTML = "";

  const text = document.getElementById("text").value;
  const color = document.getElementById("color").value;
  const size = parseInt(document.getElementById("size").value);
  const desc = document.getElementById("desc").value;

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;

  QRCode.toCanvas(
    canvas,
    text,
    {
      width: size,
      color: {
        dark: color,
        light: "#ffffff",
      },
    },
    function (err) {
      if (err) return console.error(err);

      const ctx = canvas.getContext("2d");

      if (logoURL) {
        const logo = new Image();
        logo.onload = function () {
          const logoSize = size * 0.2;
          const x = (size - logoSize) / 2;
          const y = (size - logoSize) / 2;
          ctx.drawImage(logo, x, y, logoSize, logoSize);
          appendToContainer(canvas, desc);
        };
        logo.src = logoURL;
      } else {
        appendToContainer(canvas, desc);
      }
    }
  );
});

function appendToContainer(canvas, desc) {
  qrContainer.appendChild(canvas);
  if (desc) {
    const descElem = document.createElement("p");
    descElem.textContent = desc;
    descElem.style.textAlign = "center";
    descElem.style.marginTop = "10px";
    qrContainer.appendChild(descElem);
  }
  addDownloadButton(canvas);
}

document.getElementById("logo").addEventListener("change", async function () {
  const file = this.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("File harus berupa gambar!");
    this.value = "";
    return;
  }

  const formData = new FormData();
  formData.append("image_file", file);
  formData.append("size", "auto");

  const apiKey = "VfujqScV6JYmAvNKTza6PK28"; // Ganti dengan API key Anda

  try {
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: formData,
    });

    if (!response.ok) throw new Error("Gagal hapus background");
    const blob = await response.blob();
    logoURL = URL.createObjectURL(blob);
  } catch (err) {
    console.warn("Remove.bg gagal, fallback ke logo biasa");
    logoURL = URL.createObjectURL(file);
  }

  // Tampilkan preview logo
  logoPreview.innerHTML = "";
  const img = document.createElement("img");
  img.src = logoURL;
  img.alt = "Preview Logo";
  img.style.maxWidth = "100px";
  img.style.marginTop = "10px";
  logoPreview.appendChild(img);
});

function addDownloadButton(canvas) {
  const btn = document.createElement("button");
  btn.textContent = "⬇️ Unduh QR (PNG)";
  btn.onclick = function () {
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "qrcode.png";
    a.click();
  };
  downloadContainer.appendChild(btn);
}

function downloadPNG() {
  const canvas = qrContainer.querySelector("canvas");
  if (!canvas) return;
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "qrcode.png";
  a.click();
}

function downloadPDF() {
  const element = qrContainer;
  if (!element) return;
  html2pdf().from(element).save("qrcode.pdf");
}

function copyQR() {
  const canvas = qrContainer.querySelector("canvas");
  if (!canvas) return;

  canvas.toBlob((blob) => {
    const item = new ClipboardItem({ "image/png": blob });
    navigator.clipboard.write([item]).then(() => {
      alert("QR code berhasil disalin ke clipboard!");
    });
  });
}

function shareQR() {
  const canvas = qrContainer.querySelector("canvas");
  if (!canvas || !navigator.canShare) {
    alert("Fitur berbagi tidak didukung di browser ini.");
    return;
  }

  canvas.toBlob((blob) => {
    const file = new File([blob], "qrcode.png", { type: "image/png" });

    if (navigator.canShare({ files: [file] })) {
      navigator
        .share({
          title: "QR Code",
          files: [file],
        })
        .catch((err) => {
          console.error("Gagal berbagi:", err);
        });
    } else {
      alert("Fitur berbagi tidak tersedia di perangkat ini.");
    }
  });
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}


document.getElementById("bgInput").addEventListener("change", async function () {
  const file = this.files[0];
  if (!file || !file.type.startsWith("image/")) return alert("Pilih file gambar!");

  const formData = new FormData();
  formData.append("image_file", file);
  formData.append("size", "auto");

  const apiKey = "VfujqScV6JYmAvNKTza6PK28"; // <- Ganti dengan milikmu

  try {
    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: formData,
    });

    if (!res.ok) throw new Error("Gagal memproses gambar");

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    document.getElementById("bgResult").innerHTML = `<img src="${url}" style="max-width:100%; border:1px solid #ccc;" />`;
  } catch (err) {
    alert("Gagal menghapus background gambar.");
    console.error(err);
  }
});
