class Model {
  constructor() {
    this.ownField = Array(size)
      .fill(null)
      .map(() => Array(size).fill('E'));
    this.enemyField = Array(size)
      .fill(null)
      .map(() => Array(size).fill('?'));
  }

  checkCell(x, y) {
    if (this.ownField[y][x] === 'S') {
      return 'H';
    } else {
      return 'M';
    }
  }

  checkField() {
    return this.ownField.flat().some((cell) => cell === 'S');
  }

  updateCell(x, y, value, fieldMark) {
    if (fieldMark === 'own') {
      this.ownField[y][x] = value;
    } else if (fieldMark === 'enemy') {
      this.enemyField[y][x] = value;
    }
  }
}
