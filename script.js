// === GRAB HTML ===
const showContainer = document.getElementById("show-container");
const episodeContainer = document.getElementById("episode-container");

const showSelect = document.getElementById("show-list");
const episodeSelect = document.getElementById("episode-list");

const search = document.getElementById("search");
const display = document.getElementById("count-result");
const backBtn = document.getElementById("back-btn");

// === STATE ===
const state = {
  shows: [],
  episodes: [],
  searchTerm: "",
  selectedEpisode: "",
  showId: null,
  view: "shows",
};

// === SETUP FUNCTION ===
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

  // === EVENTS ===
  search.addEventListener("input", (e) => {
    state.searchTerm = e.target.value;
    render();
  });

  episodeSelect.addEventListener("change", (e) => {
    state.selectedEpisode = e.target.value;
    render();
  });

  showSelect.addEventListener("change", (e) => {
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
}

// === FETCHING EPISODES ===
async function fetchEpisodes(showId) {
  try {
    const res = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
    const data = await res.json();

    state.episodes = data;
    state.searchTerm = "";
    state.selectedEpisode = "";

    populateEpisodeList();
    render();
  } catch (e) {
    console.error("Error loading episodes:", e);
  }
}

// === CREATING SHOW CARD ===
function createShowCard(show) {
  const template = document
    .getElementById("show-template")
    .content.cloneNode(true);

  const card = template.querySelector(".show-card");

  card.querySelector("h2").textContent = show.name;
  card.querySelector("img").src =
    show.image?.medium || "https://placehold.co/400x225";
  card.querySelector("p").innerHTML = show.summary || "No summary";

  card.addEventListener("click", () => {
    state.showId = show.id;
    state.view = "episodes";

    state.searchTerm = "";
    search.value = "";

    updateView();
    fetchEpisodes(show.id);
  });

  return card;
}

// === CREATING EPISODE CARD ===
function createEpisodeCard(ep) {
  const template = document
    .getElementById("episode-template")
    .content.cloneNode(true);

  const card = template.querySelector(".episode-card");

  card.querySelector("h3").textContent =
    `${ep.name} - S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")}`;

  card.querySelector("img").src =
    ep.image?.medium || "https://placehold.co/400x225";

  card.querySelector("p").innerHTML = ep.summary || "No summary";

  return card;
}

// === FILTER EPISODES ===
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

// === RENDER CONTROLLER ===
function render() {
  if (state.view === "shows") {
    renderShows();
  } else {
    renderEpisodes();
  }
}

// === RENDER SHOWS ===
function renderShows() {
  showContainer.innerHTML = "";

  const filtered = state.shows.filter((show) =>
    show.name.toLowerCase().includes(state.searchTerm.toLowerCase()),
  );

  const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

  sorted.forEach((show) => {
    showContainer.appendChild(createShowCard(show));
  });

  displayCount(filtered.length, state.shows.length);
}

// === RENDER EPISODES ===
function renderEpisodes() {
  episodeContainer.innerHTML = "";

  const filtered = getFilteredEpisodes();

  filtered.forEach((ep) => {
    episodeContainer.appendChild(createEpisodeCard(ep));
  });

  displayCount(filtered.length, state.episodes.length);
}

// === SHOWS DROPDOWN ===
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

// === EPISODES DROPDOWN ===
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

// === COUNT MESSAGE ===
function displayCount(filtered, total) {
  const type = state.view === "shows" ? "shows" : "episodes";
  display.textContent = `Displaying ${filtered} / ${total} ${type}`;
}

// === VIEW SWITCH ===
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
