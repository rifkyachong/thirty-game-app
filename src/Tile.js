function Tile(initialRow, initialColumn, initialNumber, color) {
  this.row = initialRow;
  this.column = initialColumn;
  this.x = initialColumn * tileGridOptions.columnWidth;
  this.y = initialRow * tileGridOptions.rowHeight;
  this.width = tileGridOptions.columnWidth;
  this.height = tileGridOptions.rowHeight;
  this.speedY = null;
  this.isFalling = null;
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
      let newTiles = tile
        .getAdjacentGroupMembers()
        .filter((item) => !item.isVisited);
      newTiles.forEach((item) => (item.isVisited = true));
      members.push(...newTiles);
      queue.push(...newTiles);
    }
    members.forEach((item) => delete item.isVisited);
    return members;
  };
  this.getAdjacentGroupMembers = function () {
    return [
      this.ties.top,
      this.ties.bottom,
      this.ties.left,
      this.ties.right,
    ].filter((tile) => tile instanceof Tile);
  };
  this.getAdjacentTile = function () {
    let topTile = gameArea.getTileInGrid(this.row - 1, this.column);
    let bottomTile = gameArea.getTileInGrid(this.row + 1, this.column);
    let leftTile = gameArea.getTileInGrid(this.row, this.column - 1);
    let rightTile = gameArea.getTileInGrid(this.row, this.column + 1);
    return {
      topTile,
      bottomTile,
      leftTile,
      rightTile,
    };
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
    }
    return hasCursorInside;
  };
  this.isSameGroupWith = function (tile) {
    return this.getAllGroupMembers().includes(tile);
  };
  this.isSameNumberWith = function (tile) {
    return this.number === tile.number;
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
  this.checkTileMoveability = function () {
    const { topTile, bottomTile, leftTile, rightTile } = this.getAdjacentTile();
    let tileMoveability = {
      topFree: true,
      bottomFree: true,
      leftFree: true,
      rightFree: true,
    };
    if (
      (topTile &&
        !this.isSameGroupWith(topTile) &&
        !this.isSameNumberWith(topTile)) ||
      this.row === 0
    ) {
      tileMoveability.topFree = false;
    }
    if (
      (bottomTile &&
        !this.isSameGroupWith(bottomTile) &&
        !this.isSameNumberWith(bottomTile)) ||
      this.row === tileGridOptions.nRow - 1
    ) {
      tileMoveability.bottomFree = false;
    }
    if (
      (leftTile &&
        !this.isSameGroupWith(leftTile) &&
        !this.isSameNumberWith(leftTile)) ||
      this.column === 0
    ) {
      tileMoveability.leftFree = false;
    }
    if (
      (rightTile &&
        !this.isSameGroupWith(rightTile) &&
        !this.isSameNumberWith(rightTile)) ||
      this.column === tileGridOptions.nCol - 1
    ) {
      tileMoveability.rightFree = false;
    }

    return tileMoveability;
  };
  this.checkGroupMoveability = function () {
    let tilesMoveability = this.getAllGroupMembers().map((tile) =>
      tile.checkTileMoveability()
    );
    let groupMoveability = tilesMoveability.reduce((prev, current) => {
      return {
        topFree: prev.topFree && current.topFree,
        bottomFree: prev.bottomFree && current.bottomFree,
        leftFree: prev.leftFree && current.leftFree,
        rightFree: prev.rightFree && current.rightFree,
      };
    });
    return groupMoveability;
  };
  /////////////////////////////////////////////////////////////
  this.isGrabable = function () {
    return true;
  };
  this.attachToGrid = function (newRow, newColumn) {
    const tiles = this.getAllGroupMembers();
    let rowChange = newRow - this.row;
    let columnChange = newColumn - this.column;
    tiles.forEach((tile) => {
      let replacedTile = gameArea.getTileInGrid(
        tile.row + rowChange,
        tile.column + columnChange
      );
      if (
        replacedTile &&
        replacedTile instanceof Tile &&
        tile.isSameNumberWith(replacedTile)
      ) {
        if (gameArea.activeTile && tiles.includes(gameArea.activeTile)) {
          replacedTile.incrementTileNumberFrom(tile);
        } else {
          tile.row = tile.row + rowChange;
          tile.column = tile.column + columnChange;
        }
      } else {
        gameArea.tileGrid[tile.row + rowChange][tile.column + columnChange] =
          tile;
        tile.row = tile.row + rowChange;
        tile.column = tile.column + columnChange;
      }
      // if there is a same tile, perform tile increment
    });
  };
  this.detachFromGrid = function () {
    const tiles = this.getAllGroupMembers();
    tiles.forEach((tile) => {
      const detachedTile = gameArea.tileGrid[tile.row][tile.column];
      if (tiles.includes(detachedTile)) {
        gameArea.tileGrid[tile.row][tile.column] = null;
      }
    });
  };
  this.moveToGrid = function (newRow, newColumn) {
    if (
      gameArea.tileGrid[newRow] &&
      newCol < tileGridOptions.nCol &&
      newCol >= 0
    ) {
      const replacedTile = gameArea.tileGrid[newRow][newColumn];
      gameArea.tileGrid[(this.row, this.column)] = null;
      if (replacedTile && replacedTile.isSameNumberWith(this)) {
        // combine tile
        return;
      }
      gameArea.tileGrid[newRow][newCol] = this;
    }
  };
  this.moveToCoordinate = function (newX, newY) {
    const tiles = this.getAllGroupMembers();
    let xChange = newX - this.x;
    let yChange = newY - this.y;
    tiles.forEach((tile) => {
      tile.x += xChange;
      tile.y += yChange;
    });
  };
  this.moveToCursor = function () {
    // customize
    const restrictedMoveSensitivity = 0.1;
    const maxOffset = 10; //px
    const { topFree, bottomFree, leftFree, rightFree } =
      this.checkGroupMoveability();
    let [gridCenterX, gridCenterY] = gameArea.getCenterPointOfGrid(
      this.row,
      this.column
    );
    let [cursorX, cursorY] = gameArea.getXYPosition();
    let [tileCenterX, tileCenterY] = [cursorX, cursorY];
    if (!rightFree && cursorX > gridCenterX) {
      tileCenterX =
        gridCenterX +
        Math.min(
          (cursorX - gridCenterX) * restrictedMoveSensitivity,
          maxOffset
        );
    }
    if (!leftFree && cursorX < gridCenterX) {
      tileCenterX =
        gridCenterX +
        Math.max(
          (cursorX - gridCenterX) * restrictedMoveSensitivity,
          -maxOffset
        );
    }
    if (!bottomFree && cursorY > gridCenterY) {
      tileCenterY =
        gridCenterY +
        Math.min(
          (cursorY - gridCenterY) * restrictedMoveSensitivity,
          maxOffset
        );
    }
    if (!topFree && cursorY < gridCenterY) {
      tileCenterY =
        gridCenterY +
        Math.max(
          (cursorY - gridCenterY) * restrictedMoveSensitivity,
          -maxOffset
        );
    }
    this.moveToCoordinate(
      tileCenterX - this.width * 0.5,
      tileCenterY - this.height * 0.5
    );
  };
  this.snapToGrid = function () {
    this.moveToCoordinate(
      this.column * tileGridOptions.columnWidth,
      this.row * tileGridOptions.rowHeight
    );
  };
  this.determineNewPosition = function () {
    const [hoveredRow, hoveredColumn] = gameArea.getRowColumnPosition();
    const [prevRow, prevColumn] = [this.row, this.column];

    let pathGrid = Array(Math.abs(hoveredRow - prevRow) + 1)
      .fill()
      .map(() =>
        [new Array(Math.abs(hoveredColumn - prevColumn) + 1)][0].fill()
      );

    const referencePoint = {
      row: Math.min(prevRow, hoveredRow),
      column: Math.min(prevColumn, hoveredColumn),
    };

    const destinationPoint = {
      row: hoveredRow - referencePoint.row,
      column: hoveredColumn - referencePoint.column,
    };

    const startingPoint = {
      row: prevRow - referencePoint.row,
      column: prevColumn - referencePoint.column,
    };

    pathGrid = pathGrid.map((arr, rowIndex) => {
      return arr.map((el, colIndex) => {
        return this.hasSpaceInGrid(
          referencePoint.row + rowIndex,
          referencePoint.column + colIndex
        );
      });
    });

    const rowStep = hoveredRow > prevRow ? 1 : -1;
    const columnStep = hoveredColumn > prevColumn ? 1 : -1;

    let pathStack = [{ ...startingPoint }];
    let listOfPath = [];
    let pointer;

    while (pathStack.length > 0) {
      pointer = { ...pathStack[pathStack.length - 1] };
      if (
        pathGrid[pointer.row + rowStep] &&
        pathGrid[pointer.row + rowStep][pointer.column]
      ) {
        pointer.row += rowStep;
        pathStack.push({ ...pointer });
        continue;
      }

      if (
        pathGrid[pointer.row] &&
        pathGrid[pointer.row][pointer.column + columnStep]
      ) {
        pointer.column += columnStep;
        pathStack.push({ ...pointer });
        continue;
      }

      listOfPath.push([...pathStack]);

      if (
        pointer.row === destinationPoint.row &&
        pointer.column === destinationPoint.column
      ) {
        return [hoveredRow, hoveredColumn];
      }

      do {
        pathGrid[pointer.row][pointer.column] = false;
        pointer = pathStack.pop();
        if (pathStack.length === 0) {
          break;
        }
      } while (!pathGrid[pointer.row][pointer.column]);
    }
    listOfPath.sort((a, b) => b.length - a.length);
    const { row, column } = { ...listOfPath[0].pop() };
    return [referencePoint.row + row, referencePoint.column + column];
  };
  this.hasSpaceInGrid = function (testRow, testCol) {
    let isAvailable = true;
    const tiles = this.getAllGroupMembers();
    const offsetRow = testRow - this.row;
    const offsetColumn = testCol - this.column;
    tiles.forEach((tile) => {
      let tileInPosition = gameArea.getTileInGrid(
        tile.row + offsetRow,
        tile.column + offsetColumn
      );
      if (
        (tileInPosition &&
          !tile.isSameGroupWith(tileInPosition) &&
          !tile.isSameNumberWith(tileInPosition)) ||
        !gameArea.isValidGrid(tile.row + offsetRow, tile.column + offsetColumn)
      ) {
        isAvailable = false;
      }
    });
    return isAvailable;
  };
  /////////////////////////////////////////////////////////////
  this.incrementTileNumberFrom = function (sacrificedTile) {
    let seperatedTiles;

    this.number += 1;
    seperatedTiles = this.seperateFromGroup();
    gameArea.fallingTiles.push(...seperatedTiles, [this]);

    seperatedTiles = sacrificedTile.seperateFromGroup();
    gameArea.fallingTiles.push(...seperatedTiles);
    if (gameArea.activeTile === sacrificedTile) {
      gameArea.activeTile = null;
    }
  };
  this.seperateFromGroup = function () {
    let seperatedTiles = [];
    if (this.ties.top instanceof Tile) {
      let otherTile = this.ties.top;
      otherTile.ties.bottom = null;
      this.ties.top = null;
      seperatedTiles.push(otherTile);
    }
    if (this.ties.bottom instanceof Tile) {
      let otherTile = this.ties.bottom;
      otherTile.ties.top = null;
      this.ties.bottom = null;
      seperatedTiles.push(otherTile);
    }
    if (this.ties.left instanceof Tile) {
      let otherTile = this.ties.left;
      otherTile.ties.right = null;
      this.ties.left = null;
      seperatedTiles.push(otherTile);
    }
    if (this.ties.right instanceof Tile) {
      let otherTile = this.ties.right;
      otherTile.ties.left = null;
      this.ties.right = null;
      seperatedTiles.push(otherTile);
    }
    return seperatedTiles.map((tile) => tile.getAllGroupMembers());
  };

  /////////////////////////////////////////////////////////////
  this.initializeFall = function () {
    const tiles = this.getAllGroupMembers();
    tiles.forEach((tile) => {
      tile.speedY = 0;
      tile.isFalling = 0;
    });
  };
  this.setNewYPosition = function () {
    let acceleration = 0.5;
    let terminalVelocity = 5;
    let tiles = this.getAllGroupMembers();
    tiles.forEach((tile) => {
      tile.speedY = Math.min(tile.speedY + acceleration, terminalVelocity);
      tile.y += tile.speedY;
    });
  };
  this.snapToYaxis = function () {
    this.moveToCoordinate(this.column * tileGridOptions.columnWidth, this.y);
  };
  this.stopFalling = function () {
    const tiles = this.getAllGroupMembers();
    tiles.forEach((tile) => {
      tile.speedY = null;
      tile.isFalling = false;
    });
    this.snapToGrid();
  };
  this.isAbleToFall = function () {
    const { bottomFree } = this.checkGroupMoveability();
    let bottomTiles = [];
    const tiles = this.getAllGroupMembers();
    tiles.forEach((tile) => {
      let { bottomTile } = tile.getAdjacentTile();
      if (bottomTile && !tiles.includes(bottomTile)) {
        bottomTiles.push(bottomTile);
      }
    });
    const bottomTilesIsFalling = bottomTiles.reduce(
      (currentStatus, bottomTile) => {
        return currentStatus && bottomTile.isFalling;
      },
      true
    );

    const bottomIsReached = tiles.reduce((currentStatus, tile) => {
      return currentStatus || tile.row === tileGridOptions.nRow - 1;
    }, false);

    return bottomFree || (!bottomIsReached && bottomTilesIsFalling);
  };
  this.checkForMatchingTile = function (testRow, testColumn) {
    const tiles = this.getAllGroupMembers();
    let rowChange = testRow - this.row;
    let columnChange = testColumn - this.column;
    const matchedTile = [];
    tiles.forEach((tile) => {
      const tileInGrid = gameArea.getTileInGrid(
        tile.row + rowChange,
        tile.column + columnChange
      );
      if (
        tileInGrid &&
        tileInGrid !== tile &&
        tileInGrid.isSameNumberWith(tile)
      ) {
        tileInGrid.incrementTileNumberFrom(tile);
        matchedTile.push(tileInGrid);
      }
    });
    return matchedTile.length;
  };
}

const handleActiveTile = (activeTile) => {
  const [prevRow, prevColumn] = activeTile.getRowColumnPosition();
  let [newRow, newColumn] = gameArea.getRowColumnPosition();
  const numberOfGridStep =
    Math.abs(newRow - prevRow) + Math.abs(newColumn - prevColumn);
  if (numberOfGridStep > 0) {
    let [newRow, newColumn] = activeTile.determineNewPosition();
    activeTile.detachFromGrid();
    activeTile.attachToGrid(newRow, newColumn);
  }
  activeTile.moveToCursor();
};

const handleFallingTiles = (fallingTiles) => {
  gameArea.fallingTiles = [];
  let newFallingTiles = [];
  fallingTiles.forEach((groupTile) => {
    const representativeTile = groupTile[0];
    if (representativeTile.speedY === null) {
      representativeTile.initializeFall();
    }
    representativeTile.setNewYPosition();
    let prevRow = representativeTile.row;
    let prevColumn = representativeTile.column;
    let newRow = Math.floor(
      (representativeTile.y + representativeTile.height) /
        tileGridOptions.rowHeight
    );

    if (prevRow !== newRow) {
      if (representativeTile.checkForMatchingTile(prevRow, prevColumn)) {
        return;
      }
      if (representativeTile.isAbleToFall()) {
        representativeTile.detachFromGrid();
        representativeTile.attachToGrid(newRow, prevColumn);
      } else {
        representativeTile.stopFalling();
        return;
      }
    }
    newFallingTiles.push(groupTile);
  });
  gameArea.fallingTiles.push(...newFallingTiles);
};

const grabTile = () => {
  let [clickedRow, clickedColumn] = gameArea.getRowColumnPosition();

  let tile = gameArea.getTileInGrid(clickedRow, clickedColumn);
  let tileAbove = gameArea.getTileInGrid(clickedRow - 1, clickedColumn);
  let tileBelow = gameArea.getTileInGrid(clickedRow + 1, clickedColumn);

  let grabbedTile = [tile, tileAbove, tileBelow]
    .filter((item) => item instanceof Tile)
    .filter((tile) => tile.hasCursorInside());

  if (grabbedTile.length > 0 && grabbedTile[0].isGrabable()) {
    gameArea.activeTile = grabbedTile[0];
  }
  //check for grabability!!!
};

const releaseTile = (activeTile) => {
  let { bottomFree } = activeTile.checkGroupMoveability();
  if (bottomFree) {
    activeTile.snapToYaxis();
    const groupTile = activeTile.getAllGroupMembers();
    gameArea.fallingTiles.push(groupTile);
  } else {
    activeTile.snapToGrid();
  }
  gameArea.activeTile = null;
};

const initializeSampleTile = () => {
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

const initializeSampleTies = () => {
  gameArea.tileGrid[6][2].tieWithLeftTile();
  gameArea.tileGrid[6][2].tieWithRightTile();
  gameArea.tileGrid[6][1].tieWithBottomTile();
  gameArea.tileGrid[7][1].tieWithLeftTile();
};
