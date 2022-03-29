const gameArea = {
  canvas: document.createElement("canvas"),
  wrapper: document.getElementById("root"),
  context: null,
  x: 0,
  y: 0,
  paddingTop: null,
  paddingLeft: null,
  borderTop: null,
  borderLeft: null,
  isHovered: false,
  specifyLayoutProperties: function () {
    this.paddingTop = parseInt(
      getComputedStyle(this.canvas, null).getPropertyValue("padding-top")
    );
    this.paddingLeft = parseInt(
      getComputedStyle(this.canvas, null).getPropertyValue("padding-left")
    );
    this.borderTop = this.canvas.clientTop;
    this.borderLeft = this.canvas.clientLeft;
  },
  start: function () {
    const { nRow, nCol, rowHeight, columnWidth } = tileGridOptions;
    this.canvas.height = nRow * rowHeight;
    this.canvas.width = nCol * columnWidth;
    this.context = this.canvas.getContext("2d");

    this.wrapper.append(this.canvas);
    this.specifyLayoutProperties();

    window.addEventListener("mousedown", (e) => {
      if (e.button == 0 && this.isHovered) {
        grabTile();
      }
    });

    window.addEventListener("mousemove", (e) => {
      this.x =
        e.clientX -
        this.paddingLeft -
        this.borderLeft -
        this.canvas.getBoundingClientRect().left;
      this.y =
        e.clientY -
        this.paddingTop -
        this.borderTop -
        this.canvas.getBoundingClientRect().top;

      this.x = Math.min(this.x, this.canvas.width);
      this.x = Math.max(0, this.x);

      this.y = Math.min(this.y, this.canvas.height);
      this.y = Math.max(0, this.y);

      const cursorInfo = document.getElementById("cursor-info");
      cursorInfo.innerHTML = `<p>x: ${this.x}<br>y: ${this.y}`;
    });

    window.addEventListener("mouseup", (e) => {
      if (e.button == 0 && this.activeTile) {
        releaseTile(this.activeTile);
      }
    });

    this.canvas.addEventListener("mouseover", (e) => {
      this.isHovered = true;
    });

    this.canvas.addEventListener("mouseout", (e) => {
      this.isHovered = false;
    });

    initializeSampleTile();
    initializeSampleTies();

    this.intervalID = window.requestAnimationFrame(reRenderGameArea);
  },
  intervalID: null,
  clear: function () {
    const [canvasWidth, canvasHeight] = [this.canvas.width, this.canvas.height];
    this.context.clearRect(0, 0, canvasWidth, canvasHeight);
  },
  tileGrid: [[]],
  fallingTiles: [],
  activeTile: null,
  getXYPosition: function () {
    return [gameArea.x, gameArea.y];
  },
  getCenterPointOfGrid: function (row, column) {
    return [
      (column + 0.5) * tileGridOptions.columnWidth,
      (row + 0.5) * tileGridOptions.rowHeight,
    ];
  },
  getRowColumnPosition: function () {
    let column = Math.min(
      Math.floor(gameArea.x / tileGridOptions.columnWidth),
      tileGridOptions.nCol - 1
    );
    let row = Math.min(
      Math.floor(gameArea.y / tileGridOptions.rowHeight),
      tileGridOptions.nRow - 1
    );
    return [row, column];
  },
  getTileInGrid: function (row, col) {
    return gameArea.tileGrid[row] && gameArea.tileGrid[row][col];
  },
  isValidGrid: function (row, col) {
    return (
      0 <= row &&
      row < tileGridOptions.nRow &&
      0 <= col &&
      col < tileGridOptions.nCol
    );
  },
  addFallingTiles: function (...addedGroupTiles) {
    addedGroupTiles.forEach((groupTile) => {
      if (!this.fallingTilesContains(groupTile)) {
        this.fallingTiles.push(groupTile);
      }
    });
  },
  fallingTilesContains: function (addedGroupTile) {
    let isContains = this.fallingTiles.some((groupTile) => {
      return groupTile.every((tile) => addedGroupTile.includes(tile));
    });

    return isContains;
  },
};

function reRenderGameArea() {
  gameArea.clear();

  if (gameArea.activeTile) {
    handleActiveTile(gameArea.activeTile);
  }

  if (gameArea.fallingTiles.length > 0) {
    handleFallingTiles(gameArea.fallingTiles);
  }

  gameArea.tileGrid
    .flat()
    .filter((item) => item instanceof Tile)
    .forEach((tile) => tile.render());

  gameArea.fallingTiles
    .flat()
    .filter((item) => item instanceof Tile)
    .forEach((tile) => tile.render());
  gameArea.intervalId = window.requestAnimationFrame(reRenderGameArea);
}

gameArea.start();
