function Tile(initialRow, initialColumn, initialNumber) {
  this.row = initialRow;
  this.column = initialColumn;
  this.x = initialColumn * tileGridOptions.columnWidth;
  this.y = initialRow * tileGridOptions.rowHeight;
  this.width = tileGridOptions.columnWidth;
  this.height = tileGridOptions.rowHeight;
  this.speedY = null;
  this.isFalling = null;
  this.onDelayedCombine = false;
  this.number = initialNumber;
  this.numberIsChanged = false;
  this.tileImg = new Image();
  this.tileImg.src = `./tiles/tile${this.number}.png`;
  this.ties = {
    top: null,
    bottom: null,
    left: null,
    right: null,
  };
  this.render = function () {
    if (this.numberIsChanged) {
      this.tileImg.src = `./tiles/tile${this.number}.png`;
      this.numberIsChanged = false;
    }
    gameArea.context.drawImage(
      this.tileImg,
      Math.floor(this.x),
      Math.floor(this.y),
      this.width,
      this.height
    );
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
  this.getAllGroupMembers = function () {
    let members = [this];
    let queue = [this];
    this.beenIncluded = true;
    while (queue.length > 0) {
      const currentTile = queue.shift();
      const { top, bottom, left, right } = currentTile.ties;
      const newTiles = [top, bottom, left, right]
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
    const topTile = gameArea.getTileInGrid(this.row - 1, this.column);
    const bottomTile = gameArea.getTileInGrid(this.row + 1, this.column);
    const leftTile = gameArea.getTileInGrid(this.row, this.column - 1);
    const rightTile = gameArea.getTileInGrid(this.row, this.column + 1);
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
  this.tieWithTopTile = function () {
    const tile =
      gameArea.tileGrid[this.row - 1] &&
      gameArea.tileGrid[this.row - 1][this.column];
    if (tile) {
      this.ties.top = tile;
      tile.ties.bottom = this;
    }
  };
  this.tieWithBottomTile = function () {
    const tile =
      gameArea.tileGrid[this.row + 1] &&
      gameArea.tileGrid[this.row + 1][this.column];
    if (tile) {
      this.ties.bottom = tile;
      tile.ties.top = this;
    }
  };
  this.tieWithLeftTile = function () {
    const tile =
      gameArea.tileGrid[this.row] &&
      gameArea.tileGrid[this.row][this.column - 1];
    if (tile) {
      this.ties.left = tile;
      tile.ties.right = this;
    }
  };
  this.tieWithRightTile = function () {
    const tile =
      gameArea.tileGrid[this.row] &&
      gameArea.tileGrid[this.row][this.column + 1];
    if (tile) {
      this.ties.right = tile;
      tile.ties.left = this;
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

    let [cursorX, cursorY] = gameArea.getCursorXYPosition();
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
  this.hasCursorInside = function () {
    let [cursorX, cursorY] = gameArea.getCursorXYPosition();
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
  this.snapToGrid = function () {
    this.moveToCoordinate(
      this.column * tileGridOptions.columnWidth,
      this.row * tileGridOptions.rowHeight - gameArea.gridOffsetY
    );
  };
  this.getGroupOfTilesAboveThis = function () {
    const thisGroupTile = this.getAllGroupMembers();
    let stackedTile = [];
    thisGroupTile.forEach((tile) => {
      let { topTile } = tile.getAdjacentTile();
      if (topTile && !thisGroupTile.includes(topTile)) {
        if (
          !this.tileIsAlreadyIncluded(stackedTile, topTile.getAllGroupMembers())
        )
          stackedTile.push(topTile.getAllGroupMembers());
      }
    });
    return stackedTile;
  };
  this.getAllTilesStackedAbove = function () {
    let allStackedTile = [];
    let tileQueue = [this];
    while (tileQueue.length > 0) {
      let tile = tileQueue.shift();
      let stackedTile = tile.getGroupOfTilesAboveThis();
      stackedTile.forEach((groupTile) => {
        if (!groupTile[0].isVisited) {
          allStackedTile.push(groupTile);
          tileQueue.push(groupTile[0]);
          groupTile[0].markAsVisited();
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

  this.markAsVisited = function () {
    let tiles = this.getAllGroupMembers();
    tiles.forEach((tile) => {
      tile.isVisited = true;
    });
  };

  this.detachFromGrid = function () {
    const tiles = this.getAllGroupMembers();
    tiles.forEach((tile) => {
      // there is a bug that forced me to write the following code, honestly, it doesn't make sense
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
      const stackedTile = this.getAllTilesStackedAbove();
      if (stackedTile.length > 0) {
        return false;
      }
    }
    if (this.onDelayedCombine) {
      return false;
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
        replacedTile !== tile &&
        tile.isSameNumberWith(replacedTile)
      ) {
        replacedTile.incrementTileNumberFrom(tile);
      } else {
        gameArea.tileGrid[tile.row + rowChange][tile.column + columnChange] =
          tile;
        tile.row = tile.row + rowChange;
        tile.column = tile.column + columnChange;
      }
      // if there is a same tile, perform tile increment
    });
  };
  this.fallToGrid = function (newRow, newColumn) {
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
        replacedTile !== tile &&
        tile.isSameNumberWith(replacedTile)
      ) {
        replacedTile.onDelayedCombine = true;
        tile.row = tile.row + rowChange;
        tile.column = tile.column + columnChange;
        return;
      } else {
        gameArea.tileGrid[tile.row + rowChange][tile.column + columnChange] =
          tile;
        tile.row = tile.row + rowChange;
        tile.column = tile.column + columnChange;
      }

      // if there is a same tile, perform tile increment
    });
  };

  this.determineNewValidPosition = function () {
    const [hoveredRow, hoveredColumn] = gameArea.getCursorRowColumnPosition();
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

  this.incrementTileNumberFrom = function (sacrificedTile) {
    this.number += 1;
    this.numberIsChanged = true;

    this.onDelayedCombine = false;

    // needed?
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

  this.setNewYPosition = function () {
    let acceleration = 2;
    let terminalVelocity = 30;
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
    gameArea.removeFallingTiles(tiles);
  };
  this.isAbleToFall = function () {
    const { bottomFree } = this.checkGroupMoveability();

    let isAbleToFall = bottomFree ? true : false;

    const groupTilesBelow = this.getTilesStackedBelow();

    // sebenernya ini perlu gak sih?
    if (
      groupTilesBelow.length === 1 &&
      gameArea.activeTile &&
      groupTilesBelow[0].includes(gameArea.activeTile)
    ) {
      const { bottomFree: activeTileBelowIsBottomFree } =
        gameArea.activeTile.checkGroupMoveability();
      if (activeTileBelowIsBottomFree) {
        isAbleToFall = true;
      }
    }

    // const activeTileBelowThis = this.getTilesStackedBelow().filter(
    //   (groupTile) =>
    //     gameArea.activeTile && groupTile.includes(gameArea.activeTile)
    // );

    // if (activeTileBelowThis.length > 0) {
    //   let { bottomFree: activeTileIsBottomFree } =
    //     activeTileBelowThis[0][0].checkGroupMoveability();

    //   isAbleToFall = activeTileIsBottomFree ? true : isAbleToFall;
    // }

    return isAbleToFall;
  };
  this.checkForMatchingTile = function (testRow, testColumn) {
    const tiles = this.getAllGroupMembers();
    let rowChange = testRow - this.row;
    let columnChange = testColumn - this.column;
    let matchingTileExist = false;
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
        matchingTileExist = true;
      }
    });
    return matchingTileExist;
  };
  this.pushActiveTileBelow = function () {
    const activeTile = gameArea.activeTile;
    const activeGroupTile = activeTile.getAllGroupMembers();
    gameArea.fallingTiles.unshift(activeGroupTile);
    activeGroupTile.forEach((tile) => {
      tile.speedY = this.speedY;
      tile.isFalling = true;
    });
    activeTile.moveToCoordinate(
      activeTile.column * tileGridOptions.columnWidth,
      this.y -
        this.row * tileGridOptions.rowHeight +
        activeTile.row * tileGridOptions.rowHeight
    );
    gameArea.activeTile = null;
  };

  this.tileIsAlreadyIncluded = function (groupTileArr, newGroupTile) {
    let isAlreadyIncluded = groupTileArr.some((groupTile) => {
      return (
        groupTile.every((tile) => newGroupTile.includes(tile)) &&
        newGroupTile.every((tile) => groupTile.includes(tile))
      );
    });
    return isAlreadyIncluded;
  };
}

const handleActiveTile = (activeTile) => {
  const activeTileGroup = activeTile.getAllGroupMembers();
  let activeTileGroupIsModified = false;
  const [prevRow, prevColumn] = activeTile.getRowColumnPosition();
  const [newRow, newColumn] = gameArea.getCursorRowColumnPosition();
  const numberOfGridStep =
    Math.abs(newRow - prevRow) + Math.abs(newColumn - prevColumn);
  if (numberOfGridStep > 0) {
    const [newRow, newColumn] = activeTile.determineNewValidPosition();

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
      const matchingTileExist = representativeTile.checkForMatchingTile(
        prevRow,
        prevColumn
      );
      if (matchingTileExist) {
        // check attachTogrid
        representativeTile.attachToGrid(prevRow, prevColumn);
        gameArea.detectFallingTiles();
        return;
      }

      if (representativeTile.isFalling && representativeTile.isAbleToFall()) {
        const [groupTileBelow] = representativeTile.getTilesStackedBelow();
        if (
          groupTileBelow &&
          gameArea.activeTile &&
          groupTileBelow.includes(gameArea.activeTile)
        ) {
          representativeTile.pushActiveTileBelow();
        } else {
          representativeTile.detachFromGrid();
          representativeTile.fallToGrid(newRow, prevColumn);
        }
      } else {
        let stackedTiles = representativeTile.getAllTilesStackedAbove();
        gameArea.removeFallingTiles(groupTile, ...stackedTiles);
        gameArea.detectFallingTiles();
      }
    }
  });
};

const grabTile = () => {
  const [clickedRow, clickedColumn] = gameArea.getCursorRowColumnPosition();

  const tile = gameArea.getTileInGrid(clickedRow, clickedColumn);
  const tileAbove = gameArea.getTileInGrid(clickedRow - 1, clickedColumn);
  const tileBelow = gameArea.getTileInGrid(clickedRow + 1, clickedColumn);

  const grabbedTile = [tile, tileAbove, tileBelow]
    .filter((item) => item instanceof Tile)
    .filter((tile) => tile.hasCursorInside());

  if (grabbedTile.length > 0 && grabbedTile[0].isGrabable()) {
    gameArea.activeTile = grabbedTile[0];
  }
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
    gameArea.tileGrid[7][i] = new Tile(7, i, Math.floor(Math.random() * 5) + 1);
    i++;
  }
  i = 0;
  while (i < 7) {
    gameArea.tileGrid[6][i] = new Tile(6, i, Math.floor(Math.random() * 5) + 1);
    i++;
  }
  gameArea.fallingTiles = [];
  gameArea.detectFallingTiles();
};

const initializeSampleTies = () => {
  gameArea.tileGrid[6][2].tieWithLeftTile();
  gameArea.tileGrid[6][2].tieWithRightTile();
  gameArea.tileGrid[6][1].tieWithBottomTile();
  gameArea.tileGrid[7][1].tieWithLeftTile();

  gameArea.tileGrid[7][5].tieWithRightTile();
};
