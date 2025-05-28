document.addEventListener("DOMContentLoaded", () => {
  // Element references
  const textInput = document.getElementById("text-input");
  const qrColor = document.getElementById("qr-color");
  const qrSize = document.getElementById("qr-size");
  const qrDesc = document.getElementById("qr-desc");
  const logoInput = document.getElementById("logo-input");
  const logoPreview = document.getElementById("logoPreview");
  const generateBtn = document.getElementById("generate-btn");
  const qrResult = document.getElementById("qr-result");

  const removeBgInput = document.getElementById("remove-bg-input");
  const downloadRemovedBg = document.getElementById("download-removed-bg");

  const downloadPngBtn = document.getElementById("download-png");
  const downloadPdfBtn = document.getElementById("download-pdf");
  const copyImageBtn = document.getElementById("copy-image");
  const shareBtn = document.getElementById("share-btn");
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const toggleBtn = document.getElementById("toggleSidebar");
  const sidebar = document.querySelector(".sidebar");

  // --- Sidebar toggle ---
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });

  // --- Dark mode toggle ---
  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });

  // --- Generate QR Code ---
  generateBtn.addEventListener("click", () => {
    const text = textInput.value.trim();
    if (!text) {
      alert("Masukkan link atau teks terlebih dahulu.");
      return;
    }

    const colorHex = qrColor.value.slice(1); // remove '#'
    const size = qrSize.value;

    // Generate QR image url using qrserver api
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      text
    )}&size=${size}x${size}&color=${colorHex}`;

    qrResult.innerHTML = ""; // Clear previous QR

    // Container div to hold QR and logo overlay + desc
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
    qrImg.style.borderRadius = "12px";
    container.appendChild(qrImg);

    // If logo is selected, overlay logo
    if (logoInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoImg = document.createElement("img");
        logoImg.src = e.target.result;
        logoImg.alt = "Logo";
        logoImg.classList.add("logo-overlay");
        container.appendChild(logoImg);
      };
      reader.readAsDataURL(logoInput.files[0]);
    }

    // Description text under QR
    if (qrDesc.value.trim()) {
      const desc = document.createElement("p");
      desc.textContent = qrDesc.value.trim();
      desc.style.marginTop = "12px";
      desc.style.fontWeight = "600";
      desc.style.color = document.body.classList.contains("dark-mode") ? "#eee" : "#0f172a";
      container.appendChild(desc);
    }

    qrResult.appendChild(container);
  });

  // --- Logo preview when upload logo ---
  logoInput.addEventListener("change", () => {
    logoPreview.innerHTML = "";
    const file = logoInput.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.alt = "Preview Logo";
        logoPreview.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  });

  // --- Remove background from image using remove.bg API or similar ---
  // NOTE: This requires a real API key and integration; here is a simple placeholder
  removeBgInput.addEventListener("change", () => {
    const file = removeBgInput.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    // For demo: just display image (you should replace with real API call)
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.alt = "Preview Remove Background";
      img.style.maxWidth = "100%";
      img.style.borderRadius = "12px";

      // Clear preview and show image
      logoPreview.innerHTML = "";
      logoPreview.appendChild(img);

      // Show download link for demo purposes (actual processed image)
      downloadRemovedBg.href = e.target.result;
      downloadRemovedBg.style.display = "inline-block";
    };
    reader.readAsDataURL(file);

    // ===
    // In real app: you should send file to background removal API here, get processed image, then show + download link
  });

  downloadPngBtn.addEventListener("click", () => {
  if (!qrResult.firstChild) {
    alert("Buat QR Code terlebih dahulu.");
    return;
  }

  html2canvas(qrResult.firstChild).then((canvas) => {
    const link = document.createElement("a");
    link.download = "qr-code.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});

  // --- Download QR as PNG ---
  downloadPngBtn.addEventListener("click", () => {
    if (!qrResult.firstChild) {
      alert("QR Code belum dibuat.");
      return;
    }
    const qrContainer = qrResult.firstChild;

    html2canvas(qrContainer).then((canvas) => {
      const link = document.createElement("a");
      link.download = "qr-code.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  });

  // --- Download QR as PDF ---
  downloadPdfBtn.addEventListener("click", () => {
    if (!qrResult.firstChild) {
      alert("QR Code belum dibuat.");
      return;
    }
    const qrContainer = qrResult.firstChild;
    const opt = {
      margin: 1,
      filename: "qr-code.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().set(opt).from(qrContainer).save();
  });

  // --- Copy QR Image to Clipboard ---
  copyImageBtn.addEventListener("click", async () => {
    if (!qrResult.firstChild) {
      alert("QR Code belum dibuat.");
      return;
    }

    try {
      const qrContainer = qrResult.firstChild;
      const canvas = await html2canvas(qrContainer);
      canvas.toBlob(async (blob) => {
        if (!blob) return alert("Gagal membuat gambar.");
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob,
            }),
          ]);
          alert("QR Code berhasil disalin ke clipboard.");
        } catch {
          alert("Browser tidak mendukung fitur copy clipboard gambar.");
        }
      });
    } catch {
      alert("Terjadi kesalahan saat menyalin QR Code.");
    }
  });

  // --- Share QR Code using Web Share API ---
  shareBtn.addEventListener("click", async () => {
    if (!qrResult.firstChild) {
      alert("QR Code belum dibuat.");
      return;
    }
    if (!navigator.canShare) {
      alert("Browser Anda tidak mendukung fitur berbagi.");
      return;
    }

    try {
      const qrContainer = qrResult.firstChild;
      const canvas = await html2canvas(qrContainer);
      canvas.toBlob(async (blob) => {
        if (!blob) return alert("Gagal membuat gambar untuk dibagikan.");

        const filesArray = [
          new File([blob], "qr-code.png", {
            type: blob.type,
          }),
        ];

        if (navigator.canShare({ files: filesArray })) {
          await navigator.share({
            files: filesArray,
            title: "QR Code dari Z13 Generator",
            text: "Ini QR Code yang saya buat menggunakan Z13 QR Generator Pro.",
          });
        } else {
          alert("Browser Anda tidak mendukung berbagi file gambar.");
        }
      });
    } catch {
      alert("Terjadi kesalahan saat membagikan QR Code.");
    }
  });
});
