// High-score board: loads and shows the top 10, and the name form shown when the game ends.
// Talks to GET/POST /api/scores. updateScorePanel() is called every frame from game.js.

const scorePanel = {
  form: document.getElementById("score-form"),
  final: document.getElementById("score-final"),
  name: document.getElementById("score-name"),
  message: document.getElementById("score-message"),
  list: document.getElementById("score-list"),
  button: document.querySelector("#score-form button"),
  submitted: false, // this finished game's score has already been saved
  lastStatus: null,
  pendingScore: 0,
};

function renderScoreBoard(entries) {
  scorePanel.list.replaceChildren();
  if (entries.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No scores yet";
    scorePanel.list.appendChild(item);
    return;
  }
  for (const entry of entries) {
    const item = document.createElement("li");
    item.textContent = `${entry.name}: ${entry.score}`; // textContent, so names can't inject HTML
    scorePanel.list.appendChild(item);
  }
}

async function loadScoreBoard() {
  try {
    const response = await fetch("/api/scores");
    if (!response.ok) throw new Error(`Score request failed: ${response.status}`);
    renderScoreBoard(await response.json());
  } catch (error) {
    console.error(error);
    scorePanel.list.textContent = "Could not load scores";
  }
}

// Show the form when a game ends (game over or win); hide it again once play restarts.
function updateScorePanel(status, score) {
  if (status === scorePanel.lastStatus) return;
  scorePanel.lastStatus = status;
  if (status === STATUS_GAME_OVER || status === STATUS_WON) {
    scorePanel.pendingScore = score;
    scorePanel.submitted = false;
    scorePanel.final.textContent = `Final score: ${score}`;
    scorePanel.message.textContent = "";
    scorePanel.button.disabled = false;
    scorePanel.form.hidden = false;
  } else {
    scorePanel.form.hidden = true;
  }
}

scorePanel.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (scorePanel.submitted) return;
  scorePanel.button.disabled = true;
  try {
    const response = await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: scorePanel.name.value, score: scorePanel.pendingScore }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
    scorePanel.submitted = true;
    scorePanel.message.textContent = "Score saved! Press R to play again.";
    renderScoreBoard(data); // the POST reply is the updated top 10
    scorePanel.name.blur(); // give the keyboard back to the game so R works
  } catch (error) {
    scorePanel.message.textContent = `Could not save score: ${error.message}`;
    scorePanel.button.disabled = false;
  }
});
