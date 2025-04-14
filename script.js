const UNSPLASH_ACCESS_KEY = "W3BVxZCukvu1OufjDdyqobQ9PMDzW6fG14yWZmlcT68";

const gallery = document.getElementById("gallery");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const categorySelect = document.getElementById("category-select");
const modal = document.getElementById("image-modal");
const modalImg = document.getElementById("modal-image");
const modalDownload = document.getElementById("modal-download");
const closeBtn = document.querySelector(".close-btn");

// Categories list
const categories = [
  "Space",
  "Technology",
  "Cars & Bikes",
  "Anime & Cartoons",
  "Movies & TV Shows",
  "Gaming",
  "Quotes & Typography",
  "3D & Digital Art",
  "Fantasy",
  "Seasonal & Holidays",
  "Aesthetic & Mood",
  "Sports",
  "Fashion & Style",
  "Textures & Patterns",
  "Minimalist",
  "Live Wallpapers"
];

// Populate the dropdown
function populateCategories() {
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

// Create a gallery card for each wallpaper
function createGalleryItem(wallpaper) {
  const item = document.createElement("div");
  item.className = "gallery-item";

  const img = document.createElement("img");
  img.src = wallpaper.url;
  img.alt = wallpaper.title;
  img.style.cursor = "pointer";

  img.addEventListener("click", () => {
    openModal(wallpaper);
  });

  const info = document.createElement("div");
  info.className = "gallery-item-info";
  info.innerHTML = `
    <strong>${wallpaper.title}</strong><br>
    Resolution: ${wallpaper.resolution}<br>
    Photo by <a href="${wallpaper.photographerUrl}" target="_blank">${wallpaper.photographer}</a>
  `;

  const downloadBtn = document.createElement("button");
  downloadBtn.className = "download-btn";
  downloadBtn.textContent = "Download";
  downloadBtn.addEventListener("click", () => {
    forceDownload(wallpaper.downloadUrl, `${wallpaper.title.replace(/\s+/g, "_")}.jpg`);
  });

  item.appendChild(img);
  item.appendChild(info);
  item.appendChild(downloadBtn);

  return item;
}

// Load wallpapers into gallery
function loadGallery(wallpapers) {
  gallery.innerHTML = "";
  wallpapers.forEach((wallpaper) => {
    const item = createGalleryItem(wallpaper);
    gallery.appendChild(item);
  });
}

// Fetch wallpapers from Unsplash
async function fetchWallpapers(category, count = 100) {
  const perPage = 30;
  let page = 1;
  let fetched = [];

  while (fetched.length < count) {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(category)}&page=${page}&per_page=${perPage}&client_id=${UNSPLASH_ACCESS_KEY}`
    );
    const data = await res.json();
    if (!data.results.length) break;

    fetched = fetched.concat(data.results);
    page++;
  }

  return fetched.slice(0, count).map((img, i) => ({
    url: img.urls.regular,
    title: `${category} Wallpaper ${i + 1}`,
    category: category,
    resolution: `${img.width}x${img.height}`,
    downloadUrl: img.links.download, // ✅ FIXED HERE
    photographer: img.user.name,
    photographerUrl: img.user.links.html,
  }));
}

// Modal functions
function openModal(wallpaper) {
  modalImg.src = wallpaper.url;
  modalImg.alt = wallpaper.title;

  const filename = `${wallpaper.title.replace(/\s+/g, "_")}.jpg`;

  modalDownload.onclick = () => {
    forceDownload(wallpaper.url, filename);
  };

  modal.classList.remove("hidden");
}


// Force download of the image with the correct file extension
async function forceDownload(url, filename) {
  try {
    const response = await fetch(url, { mode: "cors" });
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Revoke the blob URL to free memory
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed:", error);
  }
}





// Close modal
closeBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});

// Category select handler
categorySelect.addEventListener("change", async () => {
  const selectedCategory = categorySelect.value;
  const query = selectedCategory === "All" ? "wallpapers" : selectedCategory;
  const wallpapers = await fetchWallpapers(query, 100);
  loadGallery(wallpapers);
});

// Search button handler
searchBtn.addEventListener("click", async () => {
  const query = searchInput.value.trim();
  if (query) {
    const wallpapers = await fetchWallpapers(query, 100);
    loadGallery(wallpapers);
  }
});

// Init
(async () => {
  populateCategories();
  const defaultWallpapers = await fetchWallpapers("nature", 100);
  loadGallery(defaultWallpapers);
})();
