const TICK_SVG = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12.5 L10 17.5 L19 7.5"></path>
  </svg>
`;

const state = {
  me: null,
  walks: [],
  votes: [],
};

function $(id) {
  return document.getElementById(id);
}

async function api(path, options) {
  const res = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(options && options.headers) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

function ticksFor(walkId) {
  return state.votes.filter((vote) => vote.walkId === walkId);
}

function renderIdentity() {
  const blob = $("my-blob");
  const label = $("my-colour-label");
  if (!state.me) return;
  blob.hidden = false;
  blob.style.background = state.me.colour;
  blob.style.color = state.me.colour;
  label.textContent = `You are ${state.me.colourName}!`;
}

function renderWalks() {
  const grid = $("walks-grid");
  const myWalk = state.me && state.me.walkId;
  grid.style.setProperty("--kid-colour", state.me ? state.me.colour : "#ff7a1a");
  grid.innerHTML = state.walks
    .map((walk) => {
      const ticks = ticksFor(walk.id);
      const mine = myWalk === walk.id;
      const tickHtml = ticks
        .map((vote) => {
          const isMine = state.me && vote.id === state.me.id;
          return `<span class="tick${isMine ? " mine" : ""}" style="--tick:${vote.colour}" title="${vote.colourName}">${TICK_SVG}</span>`;
        })
        .join("");
      const words = (walk.words || [])
        .map((word) => `<span class="word">${escapeHtml(word)}</span>`)
        .join("");
      return `
        <article class="walk-card${mine ? " is-mine" : ""}" data-walk-id="${walk.id}">
          <div class="photo-wrap">
            <img src="${walk.image}" alt="${escapeHtml(walk.name)}">
            <div class="tick-stack">${tickHtml}</div>
          </div>
          <div class="card-body">
            <h2 class="place-name">${escapeHtml(walk.name)}</h2>
            <div class="word-row">${words}</div>
            <button class="choose${mine ? " is-picked" : ""}" type="button" data-choose="${walk.id}">
              ${mine ? "Your pick!" : "CHOOSE"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function setStatus(message, show) {
  const el = $("status");
  el.hidden = !show;
  el.textContent = message || "";
}

async function chooseWalk(walkId) {
  if (!state.me) return;
  if (state.me.walkId === walkId) {
    setStatus("This is your walk! Tap a different place to switch.", true);
    return;
  }
  setStatus("Saving your pick…", true);
  const result = await api("/api/choose", {
    method: "POST",
    body: JSON.stringify({ walkId }),
  });
  state.me = result.me;
  state.votes = result.votes;
  renderIdentity();
  renderWalks();
  const walk = state.walks.find((item) => item.id === walkId);
  setStatus(walk ? `You picked ${walk.name}!` : "You picked a walk!", true);
}

async function refreshVotes() {
  try {
    const data = await api("/api/votes");
    state.votes = data.votes;
    if (data.me) state.me = data.me;
    renderIdentity();
    renderWalks();
  } catch {
    /* keep last good grid */
  }
}

async function boot() {
  try {
    const [session, walks] = await Promise.all([api("/api/session"), api("/api/walks")]);
    state.me = session.me;
    state.votes = session.votes;
    state.walks = walks.walks;
    renderIdentity();
    renderWalks();
    setStatus("", false);
  } catch (err) {
    setStatus("Could not load walks. Try again.", true);
    console.error(err);
    return;
  }

  $("walks-grid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-choose]");
    if (!button) return;
    chooseWalk(button.getAttribute("data-choose")).catch((err) => {
      setStatus("Could not save that pick. Try again.", true);
      console.error(err);
    });
  });

  setInterval(refreshVotes, 2500);
}

boot();
