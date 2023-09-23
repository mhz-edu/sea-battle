/* eslint-disable no-underscore-dangle */
import Subscribable from '../../Subscribable.js';
import { getEmptyCellsInRow, markAroundShipCell } from '../../utils.js';

export default class Model extends Subscribable {
  constructor(gameFieldSize) {
    super();
    this.gameFieldSize = gameFieldSize;
    this._own = Array(this.gameFieldSize)
      .fill(null)
      .map(() => Array(this.gameFieldSize).fill('E'));
    this._enemy = Array(this.gameFieldSize)
      .fill(null)
      .map(() => Array(this.gameFieldSize).fill('?'));

    this.createMatrixProp('_own', 'own');
    this.createMatrixProp('_enemy', 'enemy');

    this.rows = function* (fieldMark) {
      yield* this[fieldMark];
    };

    this.cols = function* (fieldMark) {
      for (let colIndex = 0; colIndex < this.gameFieldSize; colIndex += 1) {
        const col = [];
        for (let rowIndex = 0; rowIndex < this.gameFieldSize; rowIndex += 1) {
          col.push(this[fieldMark][rowIndex][colIndex]);
        }
        yield col;
      }
    };

    this._mask = Array(this.gameFieldSize)
      .fill(null)
      .map(() => Array(this.gameFieldSize).fill(true));
  }

  checkCell(x, y) {
    if (this.own[y][x] === 'S') {
      return 'H';
    }
    return 'M';
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
    let cellX = x;
    let cellY = y;
    while (delta > 0) {
      this.updateCell(cellX, cellY, 'S', 'own');
      delta -= 1;
      if (shipOrient === 'h') {
        cellX += 1;
      } else {
        cellY += 1;
      }
    }
    this.resetMask();
  }

  updateFieldMask() {
    for (let row = 0; row < this.gameFieldSize; row += 1) {
      for (let col = 0; col < this.gameFieldSize; col += 1) {
        if (this.own[row][col] === 'S') {
          markAroundShipCell(row, col, this._mask);
        }
      }
    }
  }

  getMask(shipSize, shipOrient) {
    this.updateFieldMask();

    const rowCol = shipOrient === 'h' ? 'rows' : 'cols';
    let lineIndex = 0;
    for (const line of this[rowCol]('_mask')) {
      const emptyCellsMap = getEmptyCellsInRow(line);
      emptyCellsMap.forEach(({ start, end, length }) => {
        if (length < shipSize) {
          for (let i = start; i <= end; i += 1) {
            const xyPair = rowCol === 'rows' ? [i, lineIndex] : [lineIndex, i];
            this.updateCell(...xyPair, false, '_mask');
          }
        }
      });
      lineIndex += 1;
    }

    return this._mask;
  }

  resetMask() {
    this._mask = Array(this.gameFieldSize)
      .fill(null)
      .map(() => Array(this.gameFieldSize).fill(true));
  }

  getPossibleplacements(shipSize) {
    const orientations = [
      { orientation: 'h', rowCol: 'rows' },
      { orientation: 'v', rowCol: 'cols' },
    ];
    const result = [];

    orientations.forEach(({ orientation, rowCol }) => {
      this.getMask(shipSize, orientation);
      [...this[rowCol]('_mask')].forEach((line, lineIndex) => {
        const emptyCellsMap = getEmptyCellsInRow(line);
        emptyCellsMap.forEach(({ start, length }) => {
          for (
            let placeStart = start;
            placeStart <= length - shipSize ||
            (length === shipSize && placeStart === start);
            placeStart += 1
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

  randomShipsFill(inputShips) {
    const recurse = (ships, steps) => {
      if (Object.values(ships).every((val) => val === 0)) {
        return steps;
      }

      const biggestShipSize = Math.max(
        ...Object.entries(ships)
          .filter(([, qty]) => qty !== 0)
          .map(([size]) => size),
      );

      const places = this.getPossibleplacements(biggestShipSize);

      while (places.length > 0) {
        const randomPlacementIndex = Math.floor(Math.random() * places.length);
        const [randomPlacement] = places.splice(randomPlacementIndex, 1);
        this.placeShip(...randomPlacement);

        const result = recurse(
          { ...ships, [biggestShipSize]: ships[biggestShipSize] - 1 },
          [...steps, randomPlacement],
        );
        if (result.length >= steps.length + 1) {
          return result;
        }
      }

      steps.pop();
      this.resetField();
      steps.forEach((step) => this.placeShip(...step));
      return steps;
    };

    return recurse(inputShips, []);
  }
}
