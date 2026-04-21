// === GRAB HTML ===
const sidePanel = document.getElementById("side-panel");
const closePanelBtn = document.getElementById("close-panel");

const panelImage = document.getElementById("panel-image");
const panelTitle = document.getElementById("panel-title");
const panelRating = document.getElementById("panel-rating");
const panelGenres = document.getElementById("panel-genres");
const panelRuntime = document.getElementById("panel-runtime");
const panelStatus = document.getElementById("panel-status");
const panelSummaryText = document.getElementById("panel-summary-text");

const showContainer = document.getElementById("show-container");
const episodeContainer = document.getElementById("episode-container");

const showSelect = document.getElementById("show-list");
const episodeSelect = document.getElementById("episode-list");

const search = document.getElementById("search");
const display = document.getElementById("count-result");
const backBtn = document.getElementById("back-btn");

// === CACHE ===
const episodeCache = {};

// === STATE ===
const state = {
  shows: [],
  episodes: [],
  searchTerm: "",
  selectedEpisode: "",
  showId: null,
  view: "shows",
};

// === SETUP ===
window.onload = setup;

async function setup() {
  try {
    const res = await fetch("https://api.tvmaze.com/shows");
    const data = await res.json();

    state.shows = data;
    populateShowList();
    updateView();
    render();
  } catch (e) {
    console.error("Error loading shows:", e);
  }

  // EVENTS
  search.addEventListener("input", (e) => {
    state.searchTerm = e.target.value;
    render();
  });

  episodeSelect.addEventListener("change", (e) => {
    state.selectedEpisode = e.target.value;
    render();
  });

  showSelect.addEventListener("change", (e) => {
    closePanelFully();

    const value = e.target.value;

    if (value === "") {
      state.view = "shows";
      state.showId = null;
      state.episodes = [];
      state.searchTerm = "";

      updateView();
      render();
      return;
    }

    const show = state.shows.find((s) => s.name === value);

    if (show) {
      state.showId = show.id;
      state.view = "episodes";

      state.searchTerm = "";
      search.value = "";

      updateView();
      fetchEpisodes(show.id);
    }
  });

  backBtn.addEventListener("click", () => {
    closePanelFully();

    state.view = "shows";
    state.showId = null;
    state.episodes = [];
    state.searchTerm = "";
    state.selectedEpisode = "";

    showSelect.value = "";
    episodeSelect.innerHTML = `<option value="">All episodes</option>`;
    search.value = "";

    updateView();
    render();
  });

  // 🔥 CLICK OUTSIDE PANEL TO CLOSE
  document.addEventListener("click", (e) => {
    if (!sidePanel.classList.contains("active")) return;
    const panelContent = sidePanel.querySelector(".side-panel-content");
    // safer check
    if (!panelContent.contains(e.target)) {
      closePanelFully();
    }
  });
}

// === FETCH EPISODES ===
async function fetchEpisodes(showId) {
  try {
    if (episodeCache[showId]) {
      state.episodes = episodeCache[showId];
      populateEpisodeList();
      render();
      return;
    }

    const res = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
    const data = await res.json();

    episodeCache[showId] = data;
    state.episodes = data;

    state.searchTerm = "";
    state.selectedEpisode = "";

    populateEpisodeList();
    render();
  } catch (e) {
    console.error("Error loading episodes:", e);
  }
}

// === SHOW CARD ===
function createShowCard(show) {
  const template = document
    .getElementById("show-template")
    .content.cloneNode(true);

  const card = template.querySelector(".show-card");

  card.querySelector("h2").textContent = show.name;
  card.querySelector("img").src =
    show.image?.medium || "https://placehold.co/400x225";

  // rating + genres
  const ratingGenre = document.createElement("p");
  ratingGenre.classList.add("card-meta");
  ratingGenre.textContent = `⭐ ${show.rating?.average || "N/A"} | 🎭 ${show.genres?.join(", ") || "N/A"}`;

  // short summary
  const temp = document.createElement("div");
  temp.innerHTML = show.summary || "";

  const cleanText = temp.textContent || temp.innerText || "";

  const shortSummary =
    cleanText.length > 90 ? cleanText.slice(0, 90) + "..." : cleanText;

  const summary = document.createElement("p");
  summary.classList.add("card-summary");
  summary.textContent = shortSummary;

  card.appendChild(ratingGenre);
  card.appendChild(summary);

  // READ MORE BUTTON
  const readMoreBtn = document.createElement("button");
  readMoreBtn.textContent = "Read more";
  readMoreBtn.classList.add("read-more-btn");

  readMoreBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation(); // 🔥 important fix

    document
      .querySelectorAll(".show-card.active")
      .forEach((c) => c.classList.remove("active"));

    card.classList.add("active");

    openSidePanel(show);
  });

  card.appendChild(readMoreBtn);

  // CLICK CARD → EPISODES
  card.addEventListener("click", () => {
    // 🧠 IF PANEL IS OPEN → CLOSE ONLY
    if (sidePanel.classList.contains("active")) {
      closePanelFully();
      return;
    }

    // ✅ NORMAL BEHAVIOR
    state.showId = show.id;
    state.view = "episodes";

    state.searchTerm = "";
    search.value = "";

    updateView();
    fetchEpisodes(show.id);
  });

  return card;
}

// === EPISODE CARD ===
function createEpisodeCard(ep) {
  const template = document
    .getElementById("episode-template")
    .content.cloneNode(true);

  const card = template.querySelector(".episode-card");

  const img = card.querySelector("img");
  img.src = ep.image?.medium || "https://placehold.co/400x225";

  const code = `S${String(ep.season).padStart(2, "0")}E${String(
    ep.number,
  ).padStart(2, "0")}`;

  const episodeCode = card.querySelector("p");
  episodeCode.textContent = code;

  const episodeTitle = card.querySelector("h3");
  episodeTitle.textContent = ep.name;

  const summary = document.createElement("div");
  summary.classList.add("episode-summary");
  summary.innerHTML = ep.summary || "No summary";

  card.appendChild(summary);

  return card;
}

// === FILTER ===
function getFilteredEpisodes() {
  return state.episodes.filter((ep) => {
    const searchMatch =
      ep.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      (ep.summary &&
        ep.summary.toLowerCase().includes(state.searchTerm.toLowerCase()));

    const code = `S${String(ep.season).padStart(2, "0")}E${String(
      ep.number,
    ).padStart(2, "0")}-${ep.name}`;

    const selectMatch =
      state.selectedEpisode === "" || state.selectedEpisode === code;

    return searchMatch && selectMatch;
  });
}

// === RENDER ===
function render() {
  if (state.view === "shows") renderShows();
  else renderEpisodes();
}

function renderShows() {
  showContainer.innerHTML = "";

  const term = state.searchTerm.toLowerCase();

  const filtered = state.shows.filter((show) => {
    const nameMatch = show.name.toLowerCase().includes(term);

    const summaryMatch =
      show.summary && show.summary.toLowerCase().includes(term);

    const genreMatch =
      show.genres && show.genres.join(" ").toLowerCase().includes(term);

    return nameMatch || summaryMatch || genreMatch;
  });

  const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

  // ✅ NO RESULTS CASE
  if (sorted.length === 0) {
    showContainer.innerHTML = `<p>No shows found 😕</p>`;
    displayCount(0, state.shows.length);
    return;
  }

  sorted.forEach((show) => {
    showContainer.appendChild(createShowCard(show));
  });

  displayCount(sorted.length, state.shows.length);
}

function renderEpisodes() {
  episodeContainer.innerHTML = "";

  const filtered = getFilteredEpisodes();

  filtered.forEach((ep) => {
    episodeContainer.appendChild(createEpisodeCard(ep));
  });

  displayCount(filtered.length, state.episodes.length);
}

// === DROPDOWNS ===
function populateShowList() {
  showSelect.innerHTML = `<option value="">All Show</option>`;

  const sorted = [...state.shows].sort((a, b) => a.name.localeCompare(b.name));

  sorted.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.name;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });
}

function populateEpisodeList() {
  episodeSelect.innerHTML = `<option value="">All episodes</option>`;

  state.episodes.forEach((ep) => {
    const code = `S${String(ep.season).padStart(2, "0")}E${String(
      ep.number,
    ).padStart(2, "0")}-${ep.name}`;

    const option = document.createElement("option");
    option.value = code;
    option.textContent = code;
    episodeSelect.appendChild(option);
  });
}

// === COUNT ===
function displayCount(filtered, total) {
  const type = state.view === "shows" ? "shows" : "episodes";
  display.textContent = `Displaying ${filtered} / ${total} ${type}`;
}

// === VIEW ===
function updateView() {
  if (state.view === "shows") {
    showContainer.style.display = "grid";
    episodeContainer.style.display = "none";

    showSelect.style.display = "inline-block";
    episodeSelect.style.display = "none";

    search.placeholder = "Search shows...";
    backBtn.style.display = "none";
  } else {
    showContainer.style.display = "none";
    episodeContainer.style.display = "grid";

    showSelect.style.display = "none";
    episodeSelect.style.display = "inline-block";

    search.placeholder = "Search episodes...";
    backBtn.style.display = "inline-block";
  }

  document.body.classList.toggle("episodes-view", state.view === "episodes");
  document.body.classList.toggle("shows-view", state.view === "shows");
}

// === PANEL ===
function openSidePanel(show) {
  panelImage.src = show.image?.medium || "https://placehold.co/400x225";
  panelTitle.textContent = show.name;

  panelRating.textContent = `⭐ Rating: ${show.rating?.average || "N/A"}`;
  panelGenres.textContent = `🎭 Genres: ${show.genres.join(", ")}`;
  panelRuntime.textContent = `⏱ Runtime: ${show.runtime || "N/A"} min`;
  panelStatus.textContent = `📡 Status: ${show.status}`;

  panelSummaryText.innerHTML = show.summary || "No summary";

  sidePanel.classList.add("active");
  document.body.classList.add("panel-open");
}

// === CLOSE PANEL ===
function closeSidePanel() {
  sidePanel.classList.remove("active");
  document.body.classList.remove("panel-open");
}

function closePanelFully() {
  closeSidePanel();

  document
    .querySelectorAll(".show-card.active")
    .forEach((c) => c.classList.remove("active"));
}

// === EVENTS ===
closePanelBtn.addEventListener("click", closePanelFully);
