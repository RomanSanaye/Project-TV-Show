// =================> DOM ELEMENTS
const searchInput = document.getElementById("input-box");
const episodeList = document.getElementById("episodes-list");
const select = document.getElementById("select");
const showList = document.getElementById("show-list");
const backBtn = document.getElementById("back-btn");

const showCount = document.getElementById("show-count");
const episodeCount = document.getElementById("episode-count");

const showTemplate = document.getElementById("show-template");
const episodeTemplate = document.getElementById("episode-template");

// =================> STATE
let allShows = [];
let allEpisodes = [];
const episodeCache = {};

const state = {
  view: "shows", // "shows" | "episodes"
  searchTerm: "",
  showId: "",
};

// =================> LOADING
function showLoading() {
  const loading = document.createElement("h2");
  loading.id = "loading";
  loading.textContent = "Loading...";
  document.getElementById("root").appendChild(loading);
}

// =================> ERROR
function showError() {
  document.getElementById("root").innerHTML = "<h2>❌ Failed to load data</h2>";
}

// =================> FETCH SHOWS
async function fetchShows() {
  try {
    showLoading();

    const res = await fetch("https://api.tvmaze.com/shows");
    allShows = await res.json();

    document.getElementById("loading")?.remove();

    populateShowsDropdown();

    state.view = "shows";
    renderShows();
  } catch (err) {
    console.error(err);
    showError();
  }
}

// =================> CACHE EPISODES
async function getEpisodes(showId) {
  if (episodeCache[showId]) return episodeCache[showId];

  const res = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
  const data = await res.json();

  episodeCache[showId] = data;
  return data;
}

// =================> SHOW DROPDOWN
function populateShowsDropdown() {
  select.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.textContent = "Select a show...";
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);

  const sorted = [...allShows].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
  );

  sorted.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    select.appendChild(option);
  });

  select.selectedIndex = 0;
}

// =================> CREATE SHOW CARD
function createShowCard(show) {
  const card = showTemplate.content.cloneNode(true).querySelector(".show-card");

  card.querySelector(".episode-title").textContent = show.name;

  // 👉 REMOVE HTML TAGS FROM SUMMARY
  const rawSummary = show.summary || "No summary available";
  const cleanSummary = rawSummary.replace(/<[^>]*>/g, "");
  card.querySelector(".show-summary").textContent = cleanSummary;

  card.querySelector("img").src =
    show.image?.medium ||
    "https://placehold.co/400x225/1f2937/ffffff?text=No+Image";

  // 👉 CLICK → LOAD EPISODES
  card.addEventListener("click", async () => {
    state.view = "episodes";
    state.showId = show.id;

    showList.style.display = "none";
    episodeList.style.display = "grid";
    backBtn.style.display = "block";

    allEpisodes = await getEpisodes(show.id);

    searchInput.value = "";
    state.searchTerm = "";

    renderEpisodes(allEpisodes);
  });

  return card;
}

// =================> CREATE EPISODE CARD
function createEpisodeCard(ep) {
  const card = episodeTemplate.content
    .cloneNode(true)
    .querySelector(".episode-card");

  card.querySelector(".episode-title").textContent = ep.name;

  card.querySelector(".season-episode").textContent =
    `S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(
      2,
      "0",
    )}`;

  card.querySelector("img").src =
    ep.image?.medium ||
    "https://placehold.co/400x225/1f2937/ffffff?text=No+Image";

  const summaryEl = card.querySelector(".episode-summary");
  if (!summaryEl) return card;

  summaryEl.innerHTML = ep.summary || "No summary available";
  summaryEl.classList.add("hidden");

  const readMore = card.querySelector(".read-more");

  readMore.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const hidden = summaryEl.classList.toggle("hidden");
    readMore.textContent = hidden ? "Read more" : "Show less";
  });

  return card;
}

// =================> RENDER SHOWS
function renderShows(list = allShows) {
  state.view = "shows";

  episodeList.innerHTML = "";
  showList.innerHTML = "";

  showList.style.display = "grid";
  episodeList.style.display = "none";
  backBtn.style.display = "none";

  const filtered = list.filter((s) =>
    s.name.toLowerCase().includes(state.searchTerm.toLowerCase()),
  );

  filtered.forEach((show) => {
    showList.appendChild(createShowCard(show));
  });

  showCount.textContent = `Showing ${filtered.length} shows`;
  showCount.style.display = "block";
  episodeCount.style.display = "none";
}

// =================> RENDER EPISODES
function renderEpisodes(list = allEpisodes) {
  state.view = "episodes";

  episodeList.innerHTML = "";

  const filtered = list.filter(
    (ep) =>
      ep.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      (ep.summary &&
        ep.summary.toLowerCase().includes(state.searchTerm.toLowerCase())),
  );

  filtered.forEach((ep) => {
    episodeList.appendChild(createEpisodeCard(ep));
  });

  episodeCount.textContent = `Showing ${filtered.length} episodes`;
  episodeCount.style.display = "block";
  showCount.style.display = "none";
}

// =================> SEARCH
function handleSearch() {
  state.searchTerm = searchInput.value;

  if (state.view === "shows") {
    renderShows(allShows);
  } else {
    renderEpisodes(allEpisodes);
  }
}

// =================> SHOW CHANGE
async function handleShowChange() {
  const showId = select.value;
  if (!showId) return;

  state.showId = showId;

  searchInput.value = "";
  state.searchTerm = "";

  allEpisodes = await getEpisodes(showId);

  state.view = "episodes";

  showList.style.display = "none";
  episodeList.style.display = "grid";
  backBtn.style.display = "block";

  renderEpisodes(allEpisodes);
}

// =================> EVENTS
searchInput.addEventListener("input", handleSearch);
select.addEventListener("change", handleShowChange);

backBtn.addEventListener("click", () => {
  state.view = "shows";
  state.searchTerm = "";

  searchInput.value = "";
  select.selectedIndex = 0;

  renderShows(allShows);
});

// =================> START
window.onload = fetchShows;
