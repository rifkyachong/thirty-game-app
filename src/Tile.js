function Tile(initialRow, initialColumn, initialNumber, color) {
  this.row = initialRow;
  this.column = initialColumn;
  this.x = initialColumn * tileGridOptions.columnWidth;
  this.y = initialRow * tileGridOptions.rowHeight;
  this.width = tileGridOptions.columnWidth;
  this.height = tileGridOptions.rowHeight;
  this.speedY = null;
  this.number = initialNumber;
  this.color = color;
  this.ties = {
    top: null,
    bottom: null,
    left: null,
    right: null,
  };
  this.getAllGroupMembers = function () {
    let members = [this];
    let queue = [this];
    this.isVisited = true;
    while (queue.length > 0) {
      let tile = queue.shift();
      let newTiles = tile.getAdjacentTies().filter((item) => !item.isVisited);
      newTiles.forEach((item) => (item.isVisited = true));
      members.push(...newTiles);
      queue.push(...newTiles);
    }
    members.forEach((item) => delete item.isVisited);
    return members;
  };
  this.getAdjacentTies = function () {
    return [
      this.ties.top,
      this.ties.bottom,
      this.ties.left,
      this.ties.right,
    ].filter((tile) => tile instanceof Tile);
  };
  this.getXYPosition = function () {
    return [this.x, this.y];
  };
  this.getRowColumnPosition = function () {
    return [this.row, this.column];
  };
  this.hasCursorInside = function () {
    let [cursorX, cursorY] = gameArea.getXYPosition();
    let hasCursorInside = false;
    if (
      cursorX >= this.x &&
      cursorX < this.x + this.width &&
      cursorY >= this.y &&
      cursorY < this.y + this.height
    ) {
      hasCursorInside = true;
      console.log(hasCursorInside);
    }
    return hasCursorInside;
  };
  this.isGrabable = function () {
    return true;
  };
  this.render = function () {
    gameArea.context.fillStyle = this.color;
    gameArea.context.fillRect(this.x, this.y, this.width, this.height);

    gameArea.context.font = "40px Georgia";
    gameArea.context.fillStyle = "black";
    if (this.number > 9) {
      gameArea.context.fillText(this.number, this.x + 15, this.y + 45);
    } else {
      gameArea.context.fillText(this.number, this.x + 25, this.y + 45);
    }
  };
  this.tieWithTopTile = function () {
    const tile =
      gameArea.tileGrid[this.row - 1] &&
      gameArea.tileGrid[this.row - 1][this.column];
    if (tile) {
      this.ties.top = tile;
      tile.ties.bottom = this;
      tile.color = this.color;
    }
  };
  this.tieWithBottomTile = function () {
    const tile =
      gameArea.tileGrid[this.row + 1] &&
      gameArea.tileGrid[this.row + 1][this.column];
    if (tile) {
      this.ties.bottom = tile;
      tile.ties.top = this;
      tile.color = this.color;
    }
  };
  this.tieWithLeftTile = function () {
    const tile =
      gameArea.tileGrid[this.row] &&
      gameArea.tileGrid[this.row][this.column - 1];
    if (tile) {
      this.ties.left = tile;
      tile.ties.right = this;
      tile.color = this.color;
    }
  };
  this.tieWithRightTile = function () {
    const tile =
      gameArea.tileGrid[this.row] &&
      gameArea.tileGrid[this.row][this.column + 1];
    if (tile) {
      this.ties.right = tile;
      tile.ties.left = this;
      tile.color = this.color;
    }
  };
}

handleActiveTile = (tile) => {
  let tiles = tile.getAllGroupMembers();
};

grabTile = () => {
  let [clickedRow, clickedColumn] = gameArea.getRowColumnPosition();

  let tile = gameArea.getTileInGrid(clickedRow, clickedColumn);
  let tileAbove = gameArea.getTileInGrid(clickedRow - 1, clickedColumn);
  let tileBelow = gameArea.getTileInGrid(clickedRow + 1, clickedColumn);

  let grabbedTile = [tile, tileAbove, tileBelow]
    .filter((item) => item instanceof Tile)
    .filter((tile) => tile.hasCursorInside());
  console.log(grabbedTile);

  if (grabbedTile.length > 0 && grabbedTile[0].isGrabable()) {
    gameArea.activeTile = grabbedTile[0];
  }
  //check for grabability!!!
};

initializeSampleTile = () => {
  gameArea.tileGrid = Array(tileGridOptions.nRow)
    .fill()
    .map(() => new Array(tileGridOptions.nCol));

  let i = 0;
  while (i < 7) {
    gameArea.tileGrid[7][i] = new Tile(
      7,
      i,
      Math.floor(Math.random() * 5) + 1,
      getRandomLightColor()
    );
    i++;
  }
  i = 0;
  while (i < 7) {
    gameArea.tileGrid[6][i] = new Tile(
      6,
      i,
      Math.floor(Math.random() * 5) + 1,
      getRandomLightColor()
    );
    i++;
  }
};

initializeSampleTies = () => {
  gameArea.tileGrid[6][2].tieWithLeftTile();
  gameArea.tileGrid[6][2].tieWithRightTile();
  gameArea.tileGrid[6][1].tieWithBottomTile();
  gameArea.tileGrid[7][1].tieWithLeftTile();
};
