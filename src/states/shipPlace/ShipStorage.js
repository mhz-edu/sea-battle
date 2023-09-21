/* eslint-disable no-underscore-dangle */
import Subscribable from '../../Subscribable.js';
import { INITIAL_SHIPS } from '../../config.js';

export default class ShipStorage extends Subscribable {
  constructor(ships, dragStartHandler, dragEndHandler) {
    super();
    this.initialShips = { ...INITIAL_SHIPS };
    this._orientation = 'h';
    this.dragStartHandler = dragStartHandler;
    this.dragEndHandler = dragEndHandler;
    this._ships = [0];
    for (const key in ships) {
      if (ships[key]) {
        this._ships.push(ships[key]);
      }
    }
    this.createArrayProp('_ships', 'ships');
    this.createProp('_orientation', 'orientation');
  }

  isStorageEmpty() {
    return this._ships.every((shipQuantity) => shipQuantity === 0);
  }

  decrementShipQuantity(shipSize) {
    this.ships[shipSize] -= 1;
  }

  clearStorage() {
    this._ships.forEach((val, index) => {
      if (index !== 0) {
        this.ships[index] = 0;
      }
    });
  }

  resetStorage() {
    for (const key in this.initialShips) {
      if (this.initialShips[key]) {
        this.ships[key] = this.initialShips[key];
      }
    }
    this.orientation = 'h';
  }

  toggleOrientation() {
    // eslint-disable-next-line no-unused-expressions
    this.orientation === 'h'
      ? (this.orientation = 'v')
      : (this.orientation = 'h');
  }
}
