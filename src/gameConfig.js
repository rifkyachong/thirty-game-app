tileGridOptions = {
  nRow: 8,
  nCol: 7,
  rowHeight: 80, // in pixel
  columnWidth: 70,
};

tileNumberDistributionOptions = [
  // score 0 ~ 4
  { min: 0, max: 0 },
  { min: 0, max: 0 },
  { min: 1, max: 1 },
  { min: 1, max: 2 },
  { min: 1, max: 3 },
  // score 5 ~ 9
  { min: 1, max: 4 },
  { min: 1, max: 5 },
  { min: 1, max: 6 },
  { min: 1, max: 7 },
  { min: 1, max: 8 },
  // score 10 ~ 14
  { min: 2, max: 9 },
  { min: 2, max: 10 },
  { min: 2, max: 11 },
  { min: 3, max: 12 },
  { min: 3, max: 13 },
  // score 15 ~ 19
  { min: 3, max: 14 },
  { min: 4, max: 15 },
  { min: 4, max: 16 },
  { min: 4, max: 17 },
  { min: 5, max: 18 },
  // score 20 ~ 24
  { min: 5, max: 19 },
  { min: 5, max: 20 },
  { min: 6, max: 21 },
  { min: 6, max: 22 },
  { min: 7, max: 23 },
  // score 25 ~ 30
  { min: 7, max: 24 },
  { min: 8, max: 25 },
  { min: 8, max: 26 },
  { min: 9, max: 27 },
  { min: 9, max: 28 },
  { min: 10, max: 29 },
];

timePerNewRowPerDifficulty = {
  1: 15000,
  2: 15000,
  3: 15000,
  4: 15000,
  5: 15000,
  6: 15000,
  7: 15000,
};
