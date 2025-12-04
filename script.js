const img = document.getElementById("artImage");
const black = document.getElementById("blackScreen");

// Paste your Sheets endpoint here
const LOG_URL = "https://script.google.com/macros/s/AKfycby3KBeO_6jL19J9sNul7sXJtFTC-nbfIv55H3wcD1zyuI80Jwe5x71FBrPCYrzGKhezLg/exec";

let objectIDs = [];
let queue = []; // preload queue of artworks
const PRELOAD_COUNT = 10;

function wait(ms) {
    return new Promise(res => setTimeout(res, ms));
}

// Load all MET IDs
async function loadObjectIDs() {
    const res = await fetch("https://collectionapi.metmuseum.org/public/collection/v1/objects");
    const json = await res.json();
    objectIDs = json.objectIDs;
}

async function fetchArtwork() {
    while (true) {
        const id = objectIDs[Math.floor(Math.random() * objectIDs.length)];
        const res = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
        const data = await res.json();

        if (data.primaryImage && data.primaryImage !== "") {
            return {
                id: data.objectID,
                title: data.title,
                artist: data.artistDisplayName,
                year: data.objectDate,
                image: data.primaryImage
            };
        }
    }
}

function logToSheet(entry) {
    if (!LOG_URL) return;

    fetch("https://corsproxy.io/?" + encodeURIComponent(LOG_URL), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        time: new Date().toISOString(),
        ...entry
    })
})
}

async function preloadImages(count = 1) {
    for (let i = 0; i < count; i++) {
        const art = await fetchArtwork();

        // preload image element
        const preImg = new Image();
        preImg.src = art.image;

        queue.push(art);
    }
}

async function slideshow() {
    await loadObjectIDs();

    console.log("Preloading first 10 images...");
    await preloadImages(PRELOAD_COUNT);

    while (true) {
        // Take first preloaded item
        const art = queue.shift();

        // Start preloading next one immediately
        preloadImages(1);

        logToSheet(art);

        img.src = art.image;
        img.style.display = "block";
        black.style.display = "none";

        await wait(8000);

        img.style.display = "none";
        black.style.display = "block";

        await wait(5000);
    }
}

slideshow();
