const img = document.getElementById("artImage");
const black = document.getElementById("blackScreen");


const LOG_URL = "https://script.google.com/macros/s/AKfycby3KBeO_6jL19J9sNul7sXJtFTC-nbfIv55H3wcD1zyuI80Jwe5x71FBrPCYrzGKhezLg/exec";

const MANIFEST_URL = "https://script.google.com/macros/s/AKfycbymCopYuNlDwnA8BlczBZLhXuE5VM8G1V5IiNeha8kMyQUCjheUFcYIi1lBmQ1Dasg1kQ/exec";

const PRELOAD_COUNT = 10;

let images = [];
let queue = [];
let index = 401;

function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

// Load manifest once
async function loadManifest() {
  const res = await fetch(MANIFEST_URL);
  images = await res.json();
}

// Logging
function logToSheet(entry) {
  fetch("https://corsproxy.io/?" + encodeURIComponent(LOG_URL), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      time: new Date().toISOString(),
      ...entry
    })
  });
}

// Preload images
async function preloadImages(count = 1) {
  for (let i = 0; i < count; i++) {
    const art = images[index % images.length];

    const preImg = new Image();
    preImg.src = art.url;

    queue.push({
      id: art.name,
      image: art.url
    });

    index++;
  }
}

async function slideshow() {
  await loadManifest();

  console.log("Preloading first 10 images...");
  await preloadImages(PRELOAD_COUNT);

  while (true) {
    const art = queue.shift();

    preloadImages(1);

    logToSheet(art);

    img.src = art.image;
    img.style.display = "block";
    black.style.display = "none";

    await wait(5000); 

    img.style.display = "none";
    black.style.display = "block";

    await wait(3000);
  }
}

slideshow();





