const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const fieldHeight = 56;

ctx.fillStyle = "#87CEEB";
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.fillStyle = "#2E8B57";
ctx.fillRect(0, canvas.height - fieldHeight, canvas.width, fieldHeight);
