// =================> DOM ELEMENTS
const searchInput = document.getElementById("input-box");
const episodeList = document.getElementById("episodes-list");
const select = document.getElementById("select");
const count = document.getElementById("count");
const root = document.getElementById("root");
const container = document.getElementById("container");

// =================> STATE
let allEpisodes = [];

const state = {
  searchTerm: "",
  selectTerm: "",
};

// =================> UI: LOADING
function showLoading() {
  const loading = document.createElement("h2");
  loading.id = "loading";
  loading.textContent = "Loading...";
  root.appendChild(loading);
}

// =================> UI: ERROR
function showError() {
  root.innerHTML = "<h2>❌ Failed to load episodes. Please try again.</h2>";
}

// =================> FETCH API (ONLY ONCE)
async function fetchEpisodes() {
  try {
    showLoading();

    const response = await fetch("https://api.tvmaze.com/shows/82/episodes");

    if (!response.ok) throw new Error("Network error");

    const data = await response.json();

    allEpisodes = data;

    const loading = document.getElementById("loading");
    if (loading) loading.remove();

    setupAfterFetch();
  } catch (error) {
    console.error(error);
    showError();
  }
}

// =================> FORMAT CODE
function formatEpisodeCode(episode) {
  return `S${String(episode.season).padStart(2, "0")}E${String(
    episode.number,
  ).padStart(2, "0")}-${episode.name}`;
}

// =================> RENDER ONE EPISODE
function renderEpisode(episode) {
  const template = document.getElementById("episode-container");
  if (!template) return;

  const card = template.content.cloneNode(true).querySelector(".episode-card");

  const img = card.querySelector(".episode-image img");
  const title = card.querySelector(".episode-title");
  const code = card.querySelector(".season-episode");
  const summary = card.querySelector(".episode-info");
  const readMore = card.querySelector(".read-more");

  const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(
    episode.number,
  ).padStart(2, "0")}`;

  img.src =
    episode.image?.medium ||
    "https://placehold.co/400x225/1f2937/ffffff?text=No+Image";

  title.textContent = episode.name;
  code.textContent = episodeCode;

  summary.innerHTML = episode.summary || "No summary available";
  summary.classList.add("hidden");

  readMore.addEventListener("click", (e) => {
    e.preventDefault();

    const hidden = summary.classList.toggle("hidden");
    readMore.textContent = hidden ? "Read more" : "Show less";
  });

  episodeList.appendChild(card);
}
// =================> FILTER
function getFilteredEpisodes() {
  return allEpisodes.filter((episode) => {
    const code = formatEpisodeCode(episode);

    const searchMatch =
      episode.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      (episode.summary &&
        episode.summary.toLowerCase().includes(state.searchTerm.toLowerCase()));

    const selectMatch = state.selectTerm === "" || state.selectTerm === code;

    return searchMatch && selectMatch;
  });
}

// =================> RENDER ALL
function render() {
  episodeList.innerHTML = "";

  const filtered = getFilteredEpisodes();

  filtered.forEach(renderEpisode);

  count.textContent = `Displaying ${filtered.length} / ${allEpisodes.length} episodes`;
}

// =================> DROPDOWN
function populateSelect() {
  select.innerHTML = `<option value="">All Episodes</option>`;

  allEpisodes.forEach((episode) => {
    const code = formatEpisodeCode(episode);

    const option = document.createElement("option");
    option.value = code;
    option.textContent = code;

    select.appendChild(option);
  });
}

// =================> INIT AFTER FETCH
function setupAfterFetch() {
  populateSelect();
  render();
  container.style.display = "block";
}

// =================> EVENTS
searchInput.addEventListener("input", () => {
  state.searchTerm = searchInput.value;
  render();
});

select.addEventListener("change", () => {
  state.selectTerm = select.value;
  render();
});

// =================> START APP
window.onload = fetchEpisodes;
