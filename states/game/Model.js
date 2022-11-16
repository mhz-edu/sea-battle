class Model extends Subscribable {
  constructor() {
    super();
    this._own = Array(size)
      .fill(null)
      .map(() => Array(size).fill('E'));
    this._enemy = Array(size)
      .fill(null)
      .map(() => Array(size).fill('?'));

    this.createMatrixProp('_own', 'own');
    this.createMatrixProp('_enemy', 'enemy');

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
    return this._own.flat().some((cell) => cell === 'S');
  }

  updateCell(x, y, value, fieldMark) {
    this[fieldMark][y][x] = value;
  }

  resetField() {
    [...this.rows('own')].forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        this.updateCell(colIndex, rowIndex, 'E', 'own');
      });
    });
    this.resetMask();
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
    this.resetMask();
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

  resetMask() {
    this._mask = Array(size)
      .fill(null)
      .map(() => Array(size).fill(true));
  }

  placeShipRandom(shipSize) {
    const orientation = Math.random() >= 0.5 ? 'h' : 'v';

    const mask = this.getMask(shipSize, orientation);

    let tries = size;
    let trySuccessful = false;
    let result = [];
    while (!trySuccessful && tries > 0) {
      const randomRowColumn = Math.floor(Math.random() * (size - shipSize));

      const emptyCellsMap = utils.getEmptyCellsInRow(mask[randomRowColumn]);

      for (let { start, end, length } of emptyCellsMap) {
        if (shipSize <= length) {
          // select random placement inside free space
          const randomStart = Math.floor(
            Math.random() * (length - shipSize + 1)
          );
          // place ship
          this.placeShip(
            start + randomStart,
            randomRowColumn,
            shipSize,
            orientation
          );
          trySuccessful = true;
          result.push(
            start + randomStart,
            randomRowColumn,
            shipSize,
            orientation
          );
          break;
        }
      }
      tries = tries - 1;
    }
    if (trySuccessful) {
      return result;
    } else {
      throw new Error(`Cannot place ship ${shipSize}`);
    }
  }

  randomShipsFill(ships) {
    while (!Object.values(ships).every((val) => val === 0)) {
      const biggestShipSize = Math.max(
        ...Object.entries(ships)
          .filter(([size, qty]) => qty !== 0)
          .map(([size, qty]) => size)
      );

      this.placeShipRandom(biggestShipSize);
      ships[biggestShipSize] = ships[biggestShipSize] - 1;
    }
  }
}
