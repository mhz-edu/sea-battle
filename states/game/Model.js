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
}
