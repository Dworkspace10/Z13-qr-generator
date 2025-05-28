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
  const removeBgPreview = document.getElementById("logoPreview");
  const downloadRemovedBg = document.getElementById("download-removed-bg");

  const downloadPngBtn = document.getElementById("download-png");
  const downloadPdfBtn = document.getElementById("download-pdf");
  const copyImageBtn = document.getElementById("copy-image");
  const shareBtn = document.getElementById("share-btn");
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const toggleBtn = document.getElementById("toggleSidebar");
  const sidebar = document.querySelector(".sidebar");

  // Sidebar toggle
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });

  // Dark mode toggle
  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });

  // Generate QR
  generateBtn.addEventListener("click", () => {
    const text = textInput.value.trim();
    if (!text) return alert("Masukkan link atau teks terlebih dahulu.");

    const color = qrColor.value.substring(1);
    const size = qrSize.value;
    let qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(text)}&size=${size}x${size}&color=${color}`;

    qrResult.innerHTML = "";
    const container = document.createElement("div");
    container.style.position = "relative";
    container.style.display = "inline-block";
    container.style.textAlign = "center";

    const qrImg = document.createElement("img");
    qrImg.src = qrUrl;
    qrImg.alt = "QR Code";
    qrImg.width = parseInt(size);
    qrImg.height = parseInt(size);
    qrImg.style.display = "block";
    container.appendChild(qrImg);

    if (logoInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoImg = document.createElement("img");
        logoImg.src = e.target.result;
        logoImg.alt = "Logo";
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

    if (qrDesc.value.trim()) {
      const desc = document.createElement("p");
      desc.textContent = qrDesc.value.trim();
      desc.style.marginTop = "8px";
      desc.style.fontWeight = "600";
      container.appendChild(desc);
    }

    qrResult.appendChild(container);
  });

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

  removeBgInput.addEventListener("change", async () => {
    const file = removeBgInput.files[0];
    if (!file) return;
    removeBgPreview.innerHTML = "<p>Memproses gambar...</p>";
    downloadRemovedBg.style.display = "none";

    const formData = new FormData();
    formData.append("image_file", file);
    formData.append("size", "auto");

    try {
      const res = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": "YOUR_REMOVE_BG_API_KEY"
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

  downloadPngBtn.addEventListener("click", () => {
    const qrImg = qrResult.querySelector("img");
    if (!qrImg) return alert("Buat QR Code terlebih dahulu.");
    const link = document.createElement("a");
    link.href = qrImg.src;
    link.download = "qr-code.png";
    link.click();
  });

  downloadPdfBtn.addEventListener("click", async () => {
    if (typeof jsPDF === "undefined") {
      alert("Fitur PDF butuh library jsPDF. Tambahkan dulu jsPDF di HTML.");
      return;
    }
    const qrImg = qrResult.querySelector("img");
    if (!qrImg) return alert("Buat QR Code terlebih dahulu.");
    const imgData = await getBase64ImageFromUrl(qrImg.src);
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 15, 15, 180, 180);
    pdf.save("qr-code.pdf");
  });

  copyImageBtn.addEventListener("click", async () => {
    const qrImg = qrResult.querySelector("img");
    if (!qrImg) return alert("Buat QR Code terlebih dahulu.");
    try {
      const response = await fetch(qrImg.src);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      alert("Gambar QR berhasil disalin ke clipboard!");
    } catch (error) {
      alert("Gagal menyalin gambar ke clipboard.");
    }
  });

  shareBtn.addEventListener("click", async () => {
    const qrImg = qrResult.querySelector("img");
    if (!qrImg) return alert("Buat QR Code terlebih dahulu.");
    if (!navigator.share) return alert("Fitur share tidak didukung di browser ini.");
    try {
      const response = await fetch(qrImg.src);
      const blob = await response.blob();
      const filesArray = [new File([blob], "qr-code.png", { type: blob.type })];
      await navigator.share({ title: "QR Code", files: filesArray });
    } catch (error) {
      alert("Gagal membagikan QR Code.");
    }
  });

  function getBase64ImageFromUrl(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
    });
  }
});
