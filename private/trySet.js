tileGridOptions = {
  nRow: 8,
  nCol: 7,
  rowHeight: 80, // in pixel
  columnWidth: 70,
};

const Tile = require("./Tile");

let tile1 = new Tile(1, 1, 1, "red");
let tile2 = tile1;

console.log(tile1 === tile2);
