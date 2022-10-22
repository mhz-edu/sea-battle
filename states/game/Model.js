class Model {
  constructor() {
    this.own = Array(size)
      .fill(null)
      .map(() => Array(size).fill('E'));
    this.enemy = Array(size)
      .fill(null)
      .map(() => Array(size).fill('?'));

    this.ownField = this.own;
    this.enemyField = this.enemy;

    this.rows = function* (fieldMark) {
      yield* this[fieldMark];
    };

    this.cols = function* (fieldMark) {
      for (let colIndex = 0; colIndex < size; colIndex++) {
        const col = [];
        for (let rowIndex = 0; rowIndex < size; rowIndex++) {
          col.push(this[fieldMark][rowIndex][colIndex]);
        }
        yield col;
      }
    };

    this._mask = Array(size)
      .fill(null)
      .map(() => Array(size).fill(true));
  }

  checkCell(x, y) {
    if (this.own[y][x] === 'S') {
      return 'H';
    } else {
      return 'M';
    }
  }

  checkField() {
    return this.own.flat().some((cell) => cell === 'S');
  }

  updateCell(x, y, value, fieldMark) {
    this[fieldMark][y][x] = value;
  }

  placeShip(x, y, shipSize, shipOrient) {
    let delta = shipSize;
    while (delta > 0) {
      this.updateCell(x, y, 'S', 'own');
      delta = delta - 1;
      if (shipOrient === 'h') {
        x = x + 1;
      } else {
        y = y + 1;
      }
    }
  }

  getMask(shipSize, shipOrient) {
    utils.updateFieldMask(this.own, this._mask);

    const rowCol = shipOrient === 'h' ? 'rows' : 'cols';
    let lineIndex = 0;
    for (let line of this[rowCol]('_mask')) {
      const emptyCellsMap = utils.getEmptyCellsInRow(line);
      emptyCellsMap.forEach(({ start, end, length }) => {
        if (length < shipSize) {
          for (let i = start; i <= end; i++) {
            const xyPair = rowCol === 'rows' ? [i, lineIndex] : [lineIndex, i];
            this.updateCell(...xyPair, false, '_mask');
          }
        }
      });
      lineIndex++;
    }

    return this._mask;
  }
}
