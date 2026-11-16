// Which movement keys are currently held down.
const input = {
  left: false,
  right: false,
};

const LEFT_KEYS = ["ArrowLeft", "a", "A"];
const RIGHT_KEYS = ["ArrowRight", "d", "D"];
const JUMP_KEYS = [" ", "ArrowUp", "w", "W"];

// True for one frame after a fresh jump key press. player.js clears it after reading.
input.jumpPressed = false;

// True for one frame after a fresh R key press. game.js clears it after reading.
input.restartPressed = false;

// True for one frame after a fresh Enter key press. game.js clears it after reading.
input.nextPressed = false;

function setKey(event, isDown) {
  if (JUMP_KEYS.includes(event.key)) {
    // event.repeat is true while the key is held, so only a new press counts.
    if (isDown && !event.repeat) input.jumpPressed = true;
    event.preventDefault(); // stop Space / Up Arrow from scrolling the page
    return;
  }

  if (event.key === "r" || event.key === "R") {
    // Ignore key repeat so holding R restarts only once.
    if (isDown && !event.repeat) input.restartPressed = true;
    return;
  }

  if (event.key === "Enter") {
    // Ignore key repeat so holding Enter advances only once.
    if (isDown && !event.repeat) input.nextPressed = true;
    return;
  }

  if (LEFT_KEYS.includes(event.key)) {
    input.left = isDown;
    event.preventDefault(); // stop arrow keys from scrolling the page
  } else if (RIGHT_KEYS.includes(event.key)) {
    input.right = isDown;
    event.preventDefault();
  }
}

window.addEventListener("keydown", (event) => setKey(event, true));
window.addEventListener("keyup", (event) => setKey(event, false));

// If the window loses focus, keyup never fires, so release everything.
window.addEventListener("blur", () => {
  input.left = false;
  input.right = false;
  input.jumpPressed = false;
  input.restartPressed = false;
  input.nextPressed = false;
});
