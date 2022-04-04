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
  this.numberIsChanged = false;
  this.tileImg = new Image();
  this.tileImg.src = `../tiles/tile${this.number}.png`;
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
    this.beenIncluded = true;
    while (queue.length > 0) {
      let currentTile = queue.shift();
      let newTiles = [
        currentTile.ties.top,
        currentTile.ties.bottom,
        currentTile.ties.left,
        currentTile.ties.right,
      ]
        .filter((tile) => tile instanceof Tile)
        .filter((tile) => !tile.beenIncluded);
      newTiles.forEach((tile) => (tile.beenIncluded = true));
      members.push(...newTiles);
      queue.push(...newTiles);
    }
    members.forEach((tile) => delete tile.beenIncluded);
    return members;
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
  this.getRowColumnPosition = function () {
    return [this.row, this.column];
  };

  this.isSameGroupWith = function (tile) {
    return this.getAllGroupMembers().includes(tile);
  };
  this.isSameNumberWith = function (tile) {
    return this.number === tile.number;
  };

  this.render = function () {
    if (this.numberIsChanged) {
      this.tileImg.src = `../tiles/tile${this.number}.png`;
      this.numberIsChanged = false;
    }
    gameArea.context.drawImage(
      this.tileImg,
      Math.floor(this.x),
      Math.floor(this.y),
      this.width,
      this.height
    );

    // gameArea.context.fillStyle = this.color;
    // gameArea.context.fillRect(this.x, this.y, this.width, this.height);
    // gameArea.context.font = "40px Georgia";
    // gameArea.context.fillStyle = "black";
    // if (this.number > 9) {
    //   gameArea.context.fillText(this.number, this.x + 15, this.y + 45);
    // } else {
    //   gameArea.context.fillText(this.number, this.x + 25, this.y + 45);
    // }
  };

  this.renderTies = function () {
    if (this.ties.right) {
      gameArea.context.fillStyle = "grey";
      gameArea.context.fillRect(
        this.x + 0.75 * tileGridOptions.columnWidth,
        this.y + 0.25 * tileGridOptions.rowHeight,
        0.5 * tileGridOptions.columnWidth,
        0.5 * tileGridOptions.rowHeight
      );
    }

    if (this.ties.bottom) {
      gameArea.context.fillStyle = "grey";
      gameArea.context.fillRect(
        this.x + 0.25 * tileGridOptions.columnWidth,
        this.y + 0.75 * tileGridOptions.rowHeight,
        0.5 * tileGridOptions.columnWidth,
        0.5 * tileGridOptions.rowHeight
      );
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
  this.moveToCoordinate = function (newX, newY) {
    const tiles = this.getAllGroupMembers();
    let xChange = newX - this.x;
    let yChange = newY - this.y;
    tiles.forEach((tile) => {
      tile.x += xChange;
      tile.y += yChange;
    });
  };
  this.moveTowardsCursor = function () {
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
      this.row * tileGridOptions.rowHeight - gameArea.gridOffsetY
    );
  };
  /////////////////////////////////////////////
  this.getTilesStackedAbove = function () {
    const tiles = this.getAllGroupMembers();
    let stackedTile = [];
    tiles.forEach((tile) => {
      let { topTile } = tile.getAdjacentTile();
      if (topTile && !tiles.includes(topTile)) {
        if (
          !this.tileIsAlreadyIncluded(stackedTile, topTile.getAllGroupMembers())
        )
          stackedTile.push(topTile.getAllGroupMembers());
      }
    });
    return stackedTile;
  };
  this.getTilesStackedBelow = function () {
    const tiles = this.getAllGroupMembers();
    let stackedTile = [];
    tiles.forEach((tile) => {
      let { bottomTile } = tile.getAdjacentTile();
      if (bottomTile && !tiles.includes(bottomTile)) {
        if (
          !this.tileIsAlreadyIncluded(
            stackedTile,
            bottomTile.getAllGroupMembers()
          )
        )
          stackedTile.push(bottomTile.getAllGroupMembers());
      }
    });
    return stackedTile;
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

  this.isOnBottom = function () {
    const groupTile = this.getAllGroupMembers();
    return groupTile.some((tile) => tile.row === tileGridOptions.nRow - 1);
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
  this.detachFromGrid = function () {
    const tiles = this.getAllGroupMembers();
    tiles.forEach((tile) => {
      if (!gameArea.tileGrid[tile.row]) {
        tile.row -= 1;
      }
      const detachedTile = gameArea.tileGrid[tile.row][tile.column];
      if (tiles.includes(detachedTile)) {
        gameArea.tileGrid[tile.row][tile.column] = null;
      }
    });
  };

  /////////////////////////////////////////////////////////////
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
        !this.isSameNumberWith(topTile) &&
        !topTile.isFalling) ||
      this.row === 0
    ) {
      tileMoveability.topFree = false;
    }
    if (
      (bottomTile &&
        !this.isSameGroupWith(bottomTile) &&
        !this.isSameNumberWith(bottomTile) &&
        !bottomTile.isFalling) ||
      this.row === tileGridOptions.nRow - 1
    ) {
      tileMoveability.bottomFree = false;
    }
    if (
      (leftTile &&
        !this.isSameGroupWith(leftTile) &&
        !this.isSameNumberWith(leftTile) &&
        !leftTile.isFalling) ||
      this.column === 0
    ) {
      tileMoveability.leftFree = false;
    }
    if (
      (rightTile &&
        !this.isSameGroupWith(rightTile) &&
        !this.isSameNumberWith(rightTile) &&
        !rightTile.isFalling) ||
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
  this.isGrabable = function () {
    if (this.isFalling) {
      let stackedTile = this.getAllTilesStackedAbove();
      if (stackedTile.length > 0) {
        return false;
      }
    }
    return true;
  };
  this.attachToGrid = function (newRow, newColumn) {
    // attach to grid can cause unintended replace of tile
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
        if (!tile.isFalling) {
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
  // this.moveToGrid = function (newRow, newColumn) {
  //   if (
  //     gameArea.tileGrid[newRow] &&
  //     newCol < tileGridOptions.nCol &&
  //     newCol >= 0
  //   ) {
  //     const replacedTile = gameArea.tileGrid[newRow][newColumn];
  //     gameArea.tileGrid[(this.row, this.column)] = null;
  //     if (replacedTile && replacedTile.isSameNumberWith(this)) {
  //       // combine tile
  //       return;
  //     }
  //     gameArea.tileGrid[newRow][newCol] = this;
  //   }
  // };

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
    this.number += 1;
    this.numberIsChanged = true;

    gameArea.removeFallingTiles(
      [this],
      this.getAllGroupMembers(),
      ...this.getAllTilesStackedAbove()
    );
    gameArea.removeFallingTiles(
      sacrificedTile.getAllGroupMembers(),
      ...sacrificedTile.getAllTilesStackedAbove()
    );

    this.seperateFromGroup();
    sacrificedTile.seperateFromGroup();

    if (gameArea.activeTile === sacrificedTile) {
      gameArea.activeTile = null;
    }
  };

  /////////////////////////////////////////////////////////////
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
    gameArea.removeFallingTiles(tiles);
  };
  this.resetFall = function () {
    const tiles = this.getAllGroupMembers();
    tiles.forEach((tile) => {
      tile.speedY = 0;
    });
  };
  this.isAbleToFall = function () {
    if (this.isOnBottom()) {
      return false;
    }

    let bottomTiles = this.getTilesStackedBelow();
    let activeTile = gameArea.activeTile;

    if (bottomTiles.length === 0) {
      return true;
    }

    let isBottomFree = true;

    bottomTiles.forEach((groupTile) => {
      if (!gameArea.fallingTilesContains(groupTile)) {
        if (activeTile && groupTile.includes(activeTile)) {
          let { bottomFree } = activeTile.checkGroupMoveability();
          if (!bottomFree) {
            isBottomFree = false;
          }
        } else {
          let { bottomFree } = this.checkGroupMoveability();
          if (!bottomFree) {
            isBottomFree = false;
          }
        }
      }
    });

    return isBottomFree;
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
  this.tileIsAlreadyIncluded = function (groupTileArr, newGroupTile) {
    let isAlreadyIncluded = groupTileArr.some((groupTile) => {
      return groupTile.every((tile) => newGroupTile.includes(tile));
    });
    return isAlreadyIncluded;
  };

  this.getAllTilesStackedAbove = function () {
    let allStackedTile = [];
    let tileQueue = [this];
    while (tileQueue.length > 0) {
      let tile = tileQueue.shift();
      let stackedTile = tile.getTilesStackedAbove();
      stackedTile.forEach((groupTile) => {
        if (!groupTile[0].isVisited) {
          allStackedTile.push(groupTile);
          tileQueue.push(groupTile[0]);
          groupTile.markAsVisited;
        }
      });
    }

    gameArea.fallingTiles.flat().forEach((tile) => {
      if (tile instanceof Tile) {
        tile.isVisited = false;
      }
    });

    return allStackedTile;
  };

  this.markAsVisited = function () {
    let tiles = this.getAllGroupMembers();
    tiles.forEach((tile) => {
      tile.isVisited = true;
    });
  };

  this.propagateStopFalling = function () {
    let stackedTiles = this.getAllTilesStackedAbove();
    stackedTiles.forEach((groupTile) => {
      groupTile[0].stopFalling();
    });
  };

  this.propageteFall = function () {
    let tileQueue = [this];
    while (tileQueue.length > 0) {
      let tile = tileQueue.shift();
      let stackedTiles = tile.getTilesStackedAbove();
      stackedTiles.forEach((groupTile) => {
        if (!groupTile[0].isVisited) {
          let { bottomFree } = groupTile[0];
          if (bottomFree) {
            gameArea.addFallingTiles(groupTile);
            groupTile[0].markAsVisited();
            tileQueue.push(groupTile);
          }
        }
      });
    }
  };
}

const handleActiveTile = (activeTile) => {
  const activeTileGroup = activeTile.getAllGroupMembers();
  let activeTileGroupIsModified = false;
  const [prevRow, prevColumn] = activeTile.getRowColumnPosition();
  let [newRow, newColumn] = gameArea.getRowColumnPosition();
  const numberOfGridStep =
    Math.abs(newRow - prevRow) + Math.abs(newColumn - prevColumn);
  if (numberOfGridStep > 0) {
    let [newRow, newColumn] = activeTile.determineNewPosition();

    activeTile.detachFromGrid();

    activeTile.attachToGrid(newRow, newColumn);

    if (
      !activeTileGroup.every((tile) =>
        activeTile.getAllGroupMembers().includes(tile)
      )
    ) {
      activeTileGroupIsModified = true;
    }

    if (activeTileGroupIsModified) {
      activeTileGroup.forEach((tile) => {
        tile.snapToGrid();
      });
    }

    gameArea.detectFallingTiles();
  }
  activeTile.moveTowardsCursor();
};

const handleFallingTiles = ([...fallingTiles]) => {
  fallingTiles.forEach((groupTile) => {
    const representativeTile = groupTile[0];

    representativeTile.setNewYPosition();

    let prevRow = representativeTile.row;
    let prevColumn = representativeTile.column;
    let newRow = Math.floor(
      (representativeTile.y +
        representativeTile.height +
        gameArea.gridOffsetY) /
        tileGridOptions.rowHeight
    );

    if (prevRow !== newRow) {
      if (representativeTile.checkForMatchingTile(prevRow, prevColumn)) {
        gameArea.removeFallingTiles(groupTile);
        gameArea.detectFallingTiles();
        return;
      }

      if (gameArea.activeTile) {
        let tilesBelow = representativeTile.getTilesStackedBelow();
        if (tilesBelow.flat().includes(gameArea.activeTile)) {
          let activeTileGroup = gameArea.activeTile.getAllGroupMembers();
          gameArea.fallingTiles.unshift(activeTileGroup);
          activeTileGroup.forEach((tile) => {
            tile.speedY = representativeTile.speedY;
            tile.isFalling = true;
          });
          gameArea.activeTile.moveToCoordinate(
            gameArea.activeTile.column * tileGridOptions.columnWidth,
            representativeTile.y -
              representativeTile.row * tileGridOptions.rowHeight +
              gameArea.activeTile.row * tileGridOptions.rowHeight
          );
          gameArea.activeTile = null;
        }
      }

      let { bottomFree } = representativeTile.checkGroupMoveability();

      if (bottomFree && representativeTile.isFalling) {
        representativeTile.detachFromGrid();
        representativeTile.attachToGrid(newRow, prevColumn);
      } else {
        let stackedTiles = representativeTile.getAllTilesStackedAbove();
        gameArea.removeFallingTiles(groupTile, ...stackedTiles);
      }
    }
  });
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
  } else {
    activeTile.snapToGrid();
  }

  gameArea.activeTile = null;
  gameArea.detectFallingTiles();
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

  gameArea.tileGrid[7][5].tieWithRightTile();
};
