const startGame = () => {
  gameArea.start();
  gameArea.addTimes();
};

const gameArea = {
  canvas: document.createElement("canvas"),
  start: function () {
    // this.canvas.style["border-radius"] = "5px";
    document.body.prepend(this.canvas);
  },
  addPlayerBox: function () {
    const ctx = this.canvas.getContext("2d");
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, 100, 100);
  },
  addTimes: function () {
    const img = new Image();
    img.src = "./times.svg";
    img.onload = () => {
      const ctx = this.canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, 150, 150);
    };
  },
};

startGame();
