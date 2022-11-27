class Model extends Subscribable {
  constructor() {
    super();
    this._own = Array(GAMEFIELD_SIZE)
      .fill(null)
      .map(() => Array(GAMEFIELD_SIZE).fill('E'));
    this._enemy = Array(GAMEFIELD_SIZE)
      .fill(null)
      .map(() => Array(GAMEFIELD_SIZE).fill('?'));

    this.createMatrixProp('_own', 'own');
    this.createMatrixProp('_enemy', 'enemy');

    this.ownField = this.own;
    this.enemyField = this.enemy;

    this.rows = function* (fieldMark) {
      yield* this[fieldMark];
    };

    this.cols = function* (fieldMark) {
      for (let colIndex = 0; colIndex < GAMEFIELD_SIZE; colIndex++) {
        const col = [];
        for (let rowIndex = 0; rowIndex < GAMEFIELD_SIZE; rowIndex++) {
          col.push(this[fieldMark][rowIndex][colIndex]);
        }
        yield col;
      }
    };

    this._mask = Array(GAMEFIELD_SIZE)
      .fill(null)
      .map(() => Array(GAMEFIELD_SIZE).fill(true));
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
    // console.log(...arguments);
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
    this._mask = Array(GAMEFIELD_SIZE)
      .fill(null)
      .map(() => Array(GAMEFIELD_SIZE).fill(true));
  }

  getPossibleplacements(shipSize) {
    const orientations = [
      { orientation: 'h', rowCol: 'rows' },
      { orientation: 'v', rowCol: 'cols' },
    ];
    const result = [];

    orientations.forEach(({ orientation, rowCol }) => {
      const mask = this.getMask(shipSize, orientation);
      [...this[rowCol]('_mask')].forEach((line, lineIndex) => {
        const emptyCellsMap = utils.getEmptyCellsInRow(line);
        emptyCellsMap.forEach(({ start, end, length }) => {
          for (
            let placeStart = start;
            placeStart <= length - shipSize ||
            (length === shipSize && placeStart === start);
            placeStart++
          ) {
            if (orientation === 'h') {
              result.push([placeStart, lineIndex, shipSize, orientation]);
            } else {
              result.push([lineIndex, placeStart, shipSize, orientation]);
            }
          }
        });
      });
    });
    return result;
  }

  /*  Alghoritm description
   *   Task of ship placement can be represented as tree DFS task, where
   *    - edge is step of particular ship placement,
   *    - node is array of all posible placements of particular ship on current field
   */

  randomShipsFill(ships) {
    const recurse = (ships, steps) => {
      if (Object.values(ships).every((val) => val === 0)) {
        return steps;
      } else {
        const biggestShipSize = Math.max(
          ...Object.entries(ships)
            .filter(([size, qty]) => qty !== 0)
            .map(([size, qty]) => size)
        );

        const places = this.getPossibleplacements(biggestShipSize);

        while (places.length > 0) {
          const randomPlacementIndex = Math.floor(
            Math.random() * places.length
          );
          const [randomPlacement] = places.splice(randomPlacementIndex, 1);
          this.placeShip(...randomPlacement);

          const result = recurse(
            { ...ships, [biggestShipSize]: ships[biggestShipSize] - 1 },
            [...steps, randomPlacement]
          );
          if (result.length >= steps.length + 1) {
            return result;
          }
        }

        steps.pop();
        this.resetField();
        steps.forEach((step) => this.placeShip(...step));
        return steps;
      }
    };

    return recurse(ships, []);
  }
}
