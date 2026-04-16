// ===> Touch your html elements <===//
const searchInput = document.getElementById("input-box");
const episodeList = document.getElementById("episodes-list");
const select = document.getElementById("select");
const count = document.getElementById("count");

// ===> make accessible variable for all episodes;
let allEpisodes = [];

// ===> STATE
const state = {
  searchTerm: "",
  selectTerm: "",
};

// ===> function for rendering episodes; (UNCHANGED)
function renderEpisode(episode) {
  const episodeContainer = document
    .getElementById("episode-container")
    .content.cloneNode(true);

  const card = episodeContainer.querySelector(".episode-card");

  card.querySelector(".episode-image img").src =
    episode.image?.medium ||
    "https://placehold.co/400x225/1f2937/ffffff?text=No+Image";

  card.querySelector(".season-episode").textContent =
    `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number,
    ).padStart(2, "0")}`;

  card.querySelector(".episode-title").textContent = episode.name;

  const summary = card.querySelector(".episode-info");
  summary.innerHTML = episode.summary || "No summary available";
  summary.classList.add("hidden");

  const readMore = card.querySelector(".read-more");

  readMore.addEventListener("click", (e) => {
    e.preventDefault();

    summary.classList.toggle("hidden");
    readMore.textContent = summary.classList.contains("hidden")
      ? "Read more"
      : "Show less";
  });

  episodeList.appendChild(episodeContainer);
}

// ===> FILTER FUNCTION
function getFilteredEpisodes() {
  return allEpisodes.filter((episode) => {
    const code = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number,
    ).padStart(2, "0")}-${episode.name}`;

    const searchMatch =
      episode.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      (episode.summary &&
        episode.summary.toLowerCase().includes(state.searchTerm.toLowerCase()));

    const selectMatch = state.selectTerm === "" || state.selectTerm === code;

    return searchMatch && selectMatch;
  });
}

// ===> RENDER FUNCTION
function render() {
  episodeList.innerHTML = "";

  const filteredEpisodes = getFilteredEpisodes();

  filteredEpisodes.forEach(renderEpisode);

  // ✅ DISPLAY COUNT
  count.textContent = `Displaying ${filteredEpisodes.length} / ${allEpisodes.length} episodes`;
}

// ===> POPULATE DROPDOWN
function populateSelect() {
  select.innerHTML = `<option value="">All Episodes</option>`;

  allEpisodes.forEach((episode) => {
    const code = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number,
    ).padStart(2, "0")}-${episode.name}`;

    const option = document.createElement("option");
    option.value = code;
    option.textContent = code;

    select.appendChild(option);
  });
}

// ===> Setup Function;
function setup() {
  allEpisodes = getAllEpisodes();

  populateSelect(); // dropdown
  render(); // initial render
}

window.onload = setup;

// ===> SEARCH EVENT
searchInput.addEventListener("input", () => {
  state.searchTerm = searchInput.value;
  render();
});

// ===> SELECT EVENT
select.addEventListener("change", () => {
  state.selectTerm = select.value;
  render();
});
