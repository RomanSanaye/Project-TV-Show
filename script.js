// ===> Touch your html elements <===//
const searchInput = document.getElementById("input-box");
const searchBtn = document.querySelector(".search-icon");
const episodeList = document.getElementById("episodes-list");

// ===> make accessible variable for all episodes;
let allEpisodes = [];

// ===> function for rendering episodes;
function renderEpisode(episode) {
  const episodeContainer = document
    .getElementById("episode-container")
    .content.cloneNode(true);

  const card = episodeContainer.querySelector(".episode-card");

  card.querySelector(".episode-image img").src = episode.image.medium;
  card.querySelector(".season-episode").textContent =
    `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;

  card.querySelector(".episode-title").textContent = episode.name;

  const summary = card.querySelector(".episode-info");
  summary.innerHTML = episode.summary;
  summary.classList.add("hidden");

  const readMore = card.querySelector(".read-more");

  // ---> adding eventlistener to the ReadMore <---
  readMore.addEventListener("click", (e) => {
    e.preventDefault();

    summary.classList.toggle("hidden");
    if (summary.classList.contains("hidden")) {
      readMore.textContent = "Read more";
    } else {
      readMore.textContent = "Show less";
    }
  });

  episodeList.appendChild(episodeContainer);
}

// ===> Setup Function;
function setup() {
  allEpisodes = getAllEpisodes();
  allEpisodes.forEach(renderEpisode);
}
window.onload = setup;
