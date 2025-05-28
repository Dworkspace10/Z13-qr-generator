// app.js

document.addEventListener("DOMContentLoaded", () => {
  const qrForm = document.getElementById("qrForm");
  const qrImage = document.getElementById("qrImage");
  const logoInput = document.getElementById("logo");
  const logoPreview = document.getElementById("logoPreview");
  const removeBgInput = document.getElementById("removeBgInput");
  const removeBgPreview = document.getElementById("removeBgPreview");
  const removeBgBtn = document.getElementById("removeBgBtn");
  const downloadRemovedBgBtn = document.getElementById("downloadRemovedBgBtn");

  qrForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = document.getElementById("text").value;
    const color = document.getElementById("color").value;
    const size = document.getElementById("size").value;
    const description = document.getElementById("description").value;
    const logoFile = logoInput.files[0];

    if (!url) return alert("Masukkan URL atau teks terlebih dahulu.");

    const qrCodeAPI = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      url
    )}&size=${size}&color=${color.substring(1)}`;

    qrImage.src = qrCodeAPI;
  });

  logoInput.addEventListener("change", () => {
    logoPreview.innerHTML = "";
    const file = logoInput.files[0];
    if (file) {
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
      reader.readAsDataURL(file);
    }
  });

  removeBgInput.addEventListener("change", () => {
    removeBgPreview.innerHTML = "";
  });

  removeBgBtn.addEventListener("click", async () => {
    const file = removeBgInput.files[0];
    if (!file) return alert("Pilih gambar terlebih dahulu.");

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

      const img = document.createElement("img");
      img.src = url;
      img.alt = "Preview Tanpa Background";
      img.style.maxWidth = "100%";
      img.style.border = "1px solid #ccc";
      img.style.borderRadius = "8px";
      removeBgPreview.appendChild(img);

      downloadRemovedBgBtn.href = url;
      downloadRemovedBgBtn.download = "logo-no-bg.png";
      downloadRemovedBgBtn.style.display = "inline-block";
    } catch (error) {
      alert("Terjadi kesalahan saat menghapus background.");
    }
  });

  // Dark mode toggle
  const toggleDark = document.getElementById("toggleDark");
  toggleDark.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });
});
