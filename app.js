document.addEventListener("DOMContentLoaded", () => {
  const textInput = document.getElementById("text-input");
  const qrColor = document.getElementById("qr-color");
  const qrSize = document.getElementById("qr-size");
  const qrDesc = document.getElementById("qr-desc");
  const logoInput = document.getElementById("logo-input");
  const logoPreview = document.getElementById("logoPreview");
  const generateBtn = document.getElementById("generate-btn");
  const qrResult = document.getElementById("qr-result");

  const removeBgInput = document.getElementById("remove-bg-input");
  const removeBgPreview = document.getElementById("logoPreview"); // Reuse preview area
  const downloadRemovedBg = document.getElementById("download-removed-bg");

  // Sidebar buttons
  const downloadPngBtn = document.getElementById("download-png");
  const downloadPdfBtn = document.getElementById("download-pdf");
  const copyImageBtn = document.getElementById("copy-image");
  const shareBtn = document.getElementById("share-btn");
  const darkModeToggle = document.getElementById("dark-mode-toggle");

  // Toggle Sidebar
  const toggleBtn = document.getElementById("toggleSidebar");
  const sidebar = document.querySelector(".sidebar");
  const mainContainer = document.querySelector(".main-container");

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    mainContainer.classList.toggle("collapsed");
  });

  // Dark Mode Toggle
  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });

  // Generate QR Code with optional logo and description
  generateBtn.addEventListener("click", () => {
    const text = textInput.value.trim();
    if (!text) {
      alert("Masukkan link atau teks terlebih dahulu.");
      return;
    }
    const color = qrColor.value.substring(1);
    const size = qrSize.value;

    // Build QR code URL (basic)
    let qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      text
    )}&size=${size}x${size}&color=${color}`;

    // Clear previous result
    qrResult.innerHTML = "";

    // Create container for QR + desc + logo
    const container = document.createElement("div");
    container.style.position = "relative";
    container.style.display = "inline-block";
    container.style.textAlign = "center";

    // QR Image
    const qrImg = document.createElement("img");
    qrImg.src = qrUrl;
    qrImg.alt = "QR Code";
    qrImg.width = parseInt(size);
    qrImg.height = parseInt(size);
    qrImg.style.display = "block";

    container.appendChild(qrImg);

    // Add logo if exists
    if (logoInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoImg = document.createElement("img");
        logoImg.src = e.target.result;
        logoImg.alt = "Logo";
        // Position logo in center of QR
        logoImg.style.position = "absolute";
        logoImg.style.top = "50%";
        logoImg.style.left = "50%";
        logoImg.style.transform = "translate(-50%, -50%)";
        logoImg.style.width = "20%";
        logoImg.style.height = "20%";
        logoImg.style.borderRadius = "8px";
        logoImg.style.backgroundColor = "white";
        logoImg.style.padding = "2px";
        container.appendChild(logoImg);
      };
      reader.readAsDataURL(logoInput.files[0]);
    }

    // Add description text below QR code if any
    if (qrDesc.value.trim()) {
      const desc = document.createElement("p");
      desc.textContent = qrDesc.value.trim();
      desc.style.marginTop = "8px";
      desc.style.fontWeight = "600";
      container.appendChild(desc);
    }

    qrResult.appendChild(container);
  });

  // Preview logo on logo input change
  logoInput.addEventListener("change", () => {
    logoPreview.innerHTML = "";
    if (logoInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.alt = "Preview Logo";
        img.style.maxWidth = "100%";
        img.style.borderRadius = "8px";
        img.style.border = "1px solid #ccc";
        logoPreview.appendChild(img);
      };
      reader.readAsDataURL(logoInput.files[0]);
    }
  });

  // Remove background image feature
  removeBgInput.addEventListener("change", () => {
    // Clear preview & download link on new file select
    removeBgPreview.innerHTML = "";
    downloadRemovedBg.style.display = "none";
  });

  removeBgInput.addEventListener("change", async () => {
    const file = removeBgInput.files[0];
    if (!file) return;

    // Call remove.bg API
    const formData = new FormData();
    formData.append("image_file", file);
    formData.append("size", "auto");

    try {
      downloadRemovedBg.style.display = "none";
      removeBgPreview.innerHTML = "<p>Memproses gambar...</p>";

      const res = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": "YOUR_REMOVE_BG_API_KEY" // Ganti dengan API key kamu
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Gagal menghapus background.");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      removeBgPreview.innerHTML = "";
      const img = document.createElement("img");
      img.src = url;
      img.alt = "Logo tanpa background";
      img.style.maxWidth = "100%";
      img.style.borderRadius = "8px";
      img.style.border = "1px solid #ccc";
      removeBgPreview.appendChild(img);

      downloadRemovedBg.href = url;
      downloadRemovedBg.download = "logo-tanpa-bg.png";
      downloadRemovedBg.style.display = "inline-block";
    } catch (error) {
      removeBgPreview.innerHTML = "";
      alert("Terjadi kesalahan saat menghapus background: " + error.message);
    }
  });

  // Download QR PNG
  downloadPngBtn.addEventListener("click", () => {
    if (!qrResult.querySelector("img")) {
      alert("Buat QR Code terlebih dahulu.");
      return;
    }
    const qrImg = qrResult.querySelector("img");
    const link = document.createElement("a");
    link.href = qrImg.src;
    link.download = "qr-code.png";
    link.click();
  });

  // Download PDF - menggunakan jsPDF
  downloadPdfBtn.addEventListener("click", async () => {
    if (!qrResult.querySelector("img")) {
      alert("Buat QR Code terlebih dahulu.");
      return;
    }
    // Pastikan jsPDF sudah disertakan di project jika mau pakai fitur ini
    if (typeof jsPDF === "undefined") {
      alert("Fitur PDF butuh library jsPDF. Tambahkan dulu jsPDF di HTML.");
      return;
    }
    const qrImg = qrResult.querySelector("img");
    const pdf = new jsPDF();
    // Add QR image ke pdf
    const imgData = await getBase64ImageFromUrl(qrImg.src);
    pdf.addImage(imgData, "PNG", 15, 15, 180, 180);
    pdf.save("qr-code.pdf");
  });

  // Salin gambar QR ke clipboard
  copyImageBtn.addEventListener("click", async () => {
    if (!qrResult.querySelector("img")) {
      alert("Buat QR Code terlebih dahulu.");
      return;
    }
    try {
      const qrImg = qrResult.querySelector("img");
      const response = await fetch(qrImg.src);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      alert("Gambar QR berhasil disalin ke clipboard!");
    } catch (error) {
      alert("Gagal menyalin gambar ke clipboard.");
    }
  });

  // Bagikan (Share API)
  shareBtn.addEventListener("click", async () => {
    if (!qrResult.querySelector("img")) {
      alert("Buat QR Code terlebih dahulu.");
      return;
    }
    if (!navigator.share) {
      alert("Fitur share tidak didukung di browser ini.");
      return;
    }
    const qrImg = qrResult.querySelector("img");
    try {
      const response = await fetch(qrImg.src);
      const blob = await response.blob();
      const filesArray = [
        new File([blob], "qr-code.png", {
          type: blob.type,
        }),
      ];
      await navigator.share({
        title: "QR Code",
        files: filesArray,
      });
    } catch (error) {
      alert("Gagal membagikan QR Code.");
    }
  });

  // Helper function untuk convert image URL ke base64 (pakai canvas)
  async function getBase64ImageFromUrl(imageUrl) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    return new Promise((resolve) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };
    });
  }
});
