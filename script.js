// === STATE ===
const state = {
  shows: [],
  episodes: [],
  searchTerm: "",
  selectTerm: "",
  showId: "",
};

// === SETUP ===
window.onload = setup;

async function setup() {
  document.getElementById("root").style.display = "none";

  try {
    const res = await fetch("https://api.tvmaze.com/shows");
    const data = await res.json();

    state.shows = data;

    populateShowList();
    showRender();
  } catch (e) {
    console.error("Error loading shows:", e);
  }

  // === EVENTS ===
  document.getElementById("search").addEventListener("input", (e) => {
    state.searchTerm = e.target.value;
    render();
  });

  document.getElementById("select").addEventListener("change", (e) => {
    state.selectTerm = e.target.value;
    render();
  });

  document.getElementById("show-list").addEventListener("change", (e) => {
    const value = e.target.value;

    if (value === "") {
      showRender();
      return;
    }

    const filtered = state.shows.filter((s) =>
      s.name.toLowerCase().includes(value.toLowerCase()),
    );

    renderFilteredShows(filtered);
  });
}

// === FETCH EPISODES ===
async function fetchEpisodes(showId) {
  try {
    const res = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
    const data = await res.json();

    state.episodes = data;
    state.searchTerm = "";
    state.selectTerm = "";

    populateEpisodeList();
    render();
  } catch (e) {
    console.error("Error loading episodes:", e);
  }
}

// === SHOW CARD ===
function createShowCard(show) {
  const template = document.getElementById("film-card").content.cloneNode(true);

  const card = template.querySelector(".card");

  card.querySelector("h3").textContent = show.name;
  card.querySelector("img").src =
    show.image?.medium || "https://placehold.co/400x225";
  card.querySelector("p").innerHTML = show.summary || "No summary";

  card.addEventListener("click", () => {
    state.showId = show.id;

    document.getElementById("show-container").style.display = "none";
    document.getElementById("root").style.display = "grid";

    fetchEpisodes(show.id);
  });

  return card;
}

// === EPISODE CARD ===
function createEpisodeCard(ep) {
  const template = document.getElementById("film-card").content.cloneNode(true);

  template.querySelector("h3").textContent =
    `${ep.name} - S${String(ep.season).padStart(2, "0")}E${String(
      ep.number,
    ).padStart(2, "0")}`;

  template.querySelector("img").src =
    ep.image?.medium || "https://placehold.co/400x225";

  template.querySelector("p").innerHTML = ep.summary || "No summary";

  return template;
}

// === FILTER ===
function getFilteredEpisodes() {
  return state.episodes.filter((ep) => {
    const code = `S${String(ep.season).padStart(2, "0")}E${String(
      ep.number,
    ).padStart(2, "0")}-${ep.name}`;

    const searchMatch =
      ep.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      (ep.summary &&
        ep.summary.toLowerCase().includes(state.searchTerm.toLowerCase()));

    const selectMatch = state.selectTerm === "" || state.selectTerm === code;

    return searchMatch && selectMatch;
  });
}

// === RENDER EPISODES ===
function render() {
  const root = document.getElementById("root");
  root.innerHTML = "";

  const filtered = getFilteredEpisodes();

  filtered.forEach((ep) => {
    root.appendChild(createEpisodeCard(ep));
  });

  displayCount(filtered.length, state.episodes.length);
}

// === RENDER SHOWS ===
function showRender() {
  const container = document.getElementById("show-container");
  container.innerHTML = "";

  const sorted = [...state.shows].sort((a, b) => a.name.localeCompare(b.name));

  sorted.forEach((show) => {
    container.appendChild(createShowCard(show));
  });
}

// === FILTERED SHOW RENDER ===
function renderFilteredShows(shows) {
  const container = document.getElementById("show-container");
  container.innerHTML = "";

  shows.forEach((show) => {
    container.appendChild(createShowCard(show));
  });
}

// === DROPDOWNS ===
function populateShowList() {
  const select = document.getElementById("show-list");

  select.innerHTML = `<option value="">All Show</option>`;

  const sorted = [...state.shows].sort((a, b) => a.name.localeCompare(b.name));

  sorted.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.name;
    option.textContent = show.name;
    select.appendChild(option);
  });
}

function populateEpisodeList() {
  const select = document.getElementById("select");

  select.innerHTML = `<option value="">All episodes</option>`;

  state.episodes.forEach((ep) => {
    const code = `S${String(ep.season).padStart(2, "0")}E${String(
      ep.number,
    ).padStart(2, "0")}-${ep.name}`;

    const option = document.createElement("option");
    option.value = code;
    option.textContent = code;
    select.appendChild(option);
  });
}

// === COUNT ===
function displayCount(filtered, total) {
  document.getElementById("display").textContent =
    `Displaying ${filtered} / ${total} episodes`;
}
