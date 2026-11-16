// Which movement keys are currently held down.
const input = {
  left: false,
  right: false,
};

const LEFT_KEYS = ["ArrowLeft", "a", "A"];
const RIGHT_KEYS = ["ArrowRight", "d", "D"];

function setKey(event, isDown) {
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
});
