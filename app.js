// Paste your Google Apps Script Web App URL here
const API_URL = "https://script.google.com/macros/s/AKfycby0lCjEwHt-EsDA6oO_YtYaSV5kqUDMeAbDHwKnRBXJFzP3dI-zWB6qJWA5sEfFoYVq8Q/exec";

let players = [];

function jsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = "leaderboardCallback_" + Date.now();
    const script = document.createElement("script");

    window[callbackName] = data => {
      resolve(data);
      delete window[callbackName];
      script.remove();
    };

    script.onerror = () => {
      delete window[callbackName];
      script.remove();
      reject(new Error("Cannot load leaderboard data"));
    };

    script.src = url + (url.includes("?") ? "&" : "?") + "callback=" + callbackName;
    document.body.appendChild(script);
  });
}

async function loadLeaderboard() {
  const tbody = document.getElementById("leaderboardBody");
  tbody.innerHTML = `<tr><td colspan="3" class="loading">Loading leaderboard...</td></tr>`;

  try {
    if (!API_URL || API_URL.includes("PASTE_APPS_SCRIPT_URL_HERE")) {
      throw new Error("Add your Apps Script URL inside app.js");
    }

    players = await jsonp(API_URL);
    renderLeaderboard(players);
    renderStats(players);
    document.getElementById("updatedAt").textContent =
      "Last updated: " + new Date().toLocaleTimeString();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="3" class="error">${err.message}</td></tr>`;
  }
}

function renderStats(data) {
  document.getElementById("totalPlayers").textContent = data.length;
  document.getElementById("topScore").textContent = data.length ? data[0].points : 0;
  document.getElementById("leaderName").textContent = data.length ? data[0].name : "-";
}

function medal(rank) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return rank;
}

function renderLeaderboard(data) {
  const tbody = document.getElementById("leaderboardBody");
  tbody.innerHTML = "";

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="3" class="loading">No participants found</td></tr>`;
    return;
  }

  data.forEach((p, index) => {
    const rank = index + 1;
    const tr = document.createElement("tr");
    if (rank <= 3) tr.classList.add("top-row");
    tr.innerHTML = `
      <td class="rank">${medal(rank)}</td>
      <td class="name">${escapeHtml(p.name)}</td>
      <td class="points">${p.points}</td>
    `;
    tbody.appendChild(tr);
  });
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.getElementById("searchInput").addEventListener("input", e => {
  const q = e.target.value.toLowerCase().trim();
  const filtered = players.filter(p => p.name.toLowerCase().includes(q));
  renderLeaderboard(filtered);
});

document.getElementById("refreshBtn").addEventListener("click", loadLeaderboard);

loadLeaderboard();
setInterval(loadLeaderboard, 60000);
