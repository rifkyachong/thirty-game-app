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

    this.gameTimeOrigin = performance.now();
    this.intervalID = window.requestAnimationFrame(reRenderGameArea);
    this.newRowTimeoutId = setTimeout(insertNewTileRow, 12000);
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
      (row + 0.5) * tileGridOptions.rowHeight - this.gridOffsetY,
    ];
  },
  getRowColumnPosition: function () {
    let column = Math.min(
      Math.floor(gameArea.x / tileGridOptions.columnWidth),
      tileGridOptions.nCol - 1
    );
    let row = Math.min(
      Math.floor((gameArea.y + this.gridOffsetY) / tileGridOptions.rowHeight),
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
      this.fallingTiles.push(groupTile);
      groupTile.forEach((tile) => {
        tile.isFalling = true;
        tile.speedY = 0;
      });
    });
    // addedGroupTiles.forEach((groupTile) => {
    //   if (!this.fallingTilesContains(groupTile)) {
    //     this.fallingTiles.push(groupTile);
    //   }
    // });
  },
  fallingTilesContains: function (testedGroupTile) {
    let isContains = this.fallingTiles.some((groupTile) => {
      return groupTile.every((tile) => testedGroupTile.includes(tile));
    });

    return isContains;
  },
  removeFallingTiles: function (...removedGroupTile) {
    removedGroupTile.forEach((groupTile) => {
      const removedIndex = gameArea.fallingTiles.findIndex((gTile) =>
        gTile.every((tile) => groupTile.includes(tile))
      );
      if (removedIndex !== -1) {
        gameArea.fallingTiles.splice(removedIndex, 1);
        groupTile[0].snapToGrid();

        groupTile.forEach((tile) => {
          tile.isFalling = false;
          tile.speedY = null;
        });
      }
    });
  },
  detectFallingTiles: function () {
    gameArea.tileGrid
      .flat()
      .filter((tile) => tile instanceof Tile)
      .forEach((checkedTile) => {
        if (!checkedTile.isFalling) {
          if (
            this.activeTile &&
            this.activeTile.getAllGroupMembers().includes(checkedTile)
          ) {
            return;
          }
          let { bottomFree } = checkedTile.checkGroupMoveability();
          if (bottomFree) {
            let tiles = checkedTile.getAllGroupMembers();
            let stackedTiles = checkedTile.getAllTilesStackedAbove();
            stackedTiles = stackedTiles.filter(
              (groupTile) => !groupTile[0].isFalling
            );
            this.addFallingTiles(tiles, ...stackedTiles);
          }
        }
      });
  },
  score: null,
  gameTimeOrigin: null,
  gameTimeElapsed: null,
  lastTileInsertionTime: null,
  newRowTimeoutId: null,
  updateScore: function () {
    let arrayOfTileNumber = gameArea.tileGrid
      .flat()
      .filter((tile) => tile instanceof Tile)
      .map((tile) => tile.number);
    this.score = Math.max(...arrayOfTileNumber);
  },
  onNewRowTransition: false,
  gridOffsetY: 0,
};

function reRenderGameArea() {
  gameArea.clear();

  gameArea.updateScore();

  checkForNoMatchAvailable();

  if (gameArea.onNewRowTransition) {
    newRowTransition();
  }

  if (gameArea.activeTile) {
    handleActiveTile(gameArea.activeTile);
  }

  if (gameArea.fallingTiles.length > 0) {
    handleFallingTiles(gameArea.fallingTiles);
  }

  gameArea.tileGrid
    .flat()
    .filter((item) => item instanceof Tile)
    .forEach((tile) => tile.renderTies());

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

function insertNewTileRow() {
  let newTiles = Array(tileGridOptions.nCol)
    .fill()
    .map(
      (el, idx) =>
        new Tile(
          tileGridOptions.nRow,
          idx,
          Math.floor(Math.random() * (gameArea.score - 1)) + 1,
          getRandomLightColor()
        )
    );

  gameArea.tileGrid.push(newTiles);

  tileGridOptions.nRow += 1;

  gameArea.onNewRowTransition = true;
  gameArea.lastTileInsertionTime = performance.now();
  gameArea.newRowTimeoutId = setTimeout(insertNewTileRow, 12000);
}

function checkForNoMatchAvailable() {
  let arrayOfNumber = gameArea.tileGrid
    .flat()
    .filter((tile) => tile instanceof Tile)
    .map((tile) => tile.number);
  let noAvailableMove = new Set(arrayOfNumber).size === arrayOfNumber.length;
  if (noAvailableMove) {
    console.log("test");
    resetInsertNewTileRowTimeout();
  }
}

function resetInsertNewTileRowTimeout() {
  clearTimeout(gameArea.newRowTimeoutId);
  insertNewTileRow();
}

function newRowTransition() {
  let elapsed = performance.now() - gameArea.lastTileInsertionTime;
  if (elapsed > 1000) {
    // end transition
    gameArea.gridOffsetY = 0;
    gameArea.onNewRowTransition = false;
    gameArea.tileGrid
      .flat()
      .filter((tile) => tile instanceof Tile)
      .forEach((tile) => {
        tile.row -= 1;
        if (!tile.isFalling) {
          if (
            gameArea.activeTile &&
            gameArea.activeTile.getAllGroupMembers().includes(tile)
          ) {
            return;
          }
          tile.snapToGrid();
        }
      });
    tileGridOptions.nRow -= 1;
    let topRowTiles = gameArea.tileGrid.shift();
    if (topRowTiles.some((tile) => tile instanceof Tile)) {
      console.log("youLOSE!!");
    }
    return;
  }
  gameArea.gridOffsetY = (elapsed / 1000) * tileGridOptions.rowHeight;

  gameArea.tileGrid
    .flat()
    .filter((tile) => tile instanceof Tile)
    .forEach((tile) => {
      if (!tile.isFalling) {
        if (
          gameArea.activeTile &&
          gameArea.activeTile.getAllGroupMembers().includes(tile)
        ) {
          return;
        }
        tile.snapToGrid();
      }
    });
}

gameArea.start();
