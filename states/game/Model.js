class Subscribable {
  constructor() {
    this.subs = {};
  }

  subscribe(sub, prop) {
    this.subs[prop].push(sub);
  }

  createProp(sourcePropName, newPropName) {
    this[newPropName] = {};
    this.subs[newPropName] = [];
    Object.defineProperty(this, newPropName, {
      get: () => {
        console.log(`getter${sourcePropName}`);
        return this[sourcePropName];
      },
      set: (val) => {
        console.log(`setter${sourcePropName}`);
        this[sourcePropName] = val;
        this.subs[newPropName].forEach((sub) => sub.notify(val));
      },
    });
  }

  createArrayProp(sourcePropName, newPropName) {
    this[newPropName] = {};
    this.subs[newPropName] = [];
    this[sourcePropName].forEach((element, index) => {
      Object.defineProperty(this[newPropName], `${index}`, {
        get: () => {
          console.log(`getter${element}`);
          return this[sourcePropName][index];
        },
        set: (val) => {
          console.log(`setter${element}`);
          this[sourcePropName][index] = val;
          this.subs[newPropName].forEach((sub) => sub.notify([val, index]));
        },
      });
    });
    Object.defineProperty(this[newPropName], Symbol.iterator, {
      value: () => this[sourcePropName][Symbol.iterator](),
    });
  }

  createMatrixProp(sourcePropName, newPropName) {
    this[newPropName] = {};
    this.subs[newPropName] = [];
    this[sourcePropName].forEach((row, rowIndex) => {
      Object.defineProperty(this[newPropName], `${rowIndex}`, {
        value: Object.defineProperties(
          {},
          row.reduce(
            (acc, col, colIndex) => {
              acc[colIndex] = {
                get: () => {
                  // console.log(`getter ${colIndex}${rowIndex}`);
                  return this[sourcePropName][rowIndex][colIndex];
                },
                set: (val) => {
                  // console.log(`setter ${colIndex}${rowIndex}`);
                  this[sourcePropName][rowIndex][colIndex] = val;
                  this.subs[newPropName].forEach((sub) =>
                    sub.notify([val, colIndex, rowIndex])
                  );
                },
              };
              return acc;
            },
            {
              [Symbol.iterator]: {
                value: () => this[sourcePropName][rowIndex][Symbol.iterator](),
              },
            }
          )
        ),
      });
    });
    Object.defineProperty(this[newPropName], Symbol.iterator, {
      value: () => this[sourcePropName][Symbol.iterator](),
    });
  }
}

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
