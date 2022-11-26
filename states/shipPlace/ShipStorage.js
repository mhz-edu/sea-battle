class ShipStorage extends Subscribable {
  constructor(ships, dragStartHandler, dragEndHandler) {
    super();
    this.initialShips = { ...INITIAL_SHIPS };
    this._orientation = 'h';
    this.dragStartHandler = dragStartHandler;
    this.dragEndHandler = dragEndHandler;
    this._ships = [0];
    for (let key in ships) {
      this._ships.push(ships[key]);
    }
    this.createArrayProp('_ships', 'ships');
    this.createProp('_orientation', 'orientation');
  }

  isStorageEmpty() {
    return this._ships.every((shipQuantity) => shipQuantity === 0);
  }

  decrementShipQuantity(shipSize) {
    this.ships[shipSize] = this.ships[shipSize] - 1;
  }

  clearStorage() {
    console.log('clearing');
    this._ships.forEach((val, index) => {
      if (index !== 0) {
        this.ships[index] = 0;
      }
    });
  }

  resetStorage() {
    for (let key in this.initialShips) {
      this.ships[key] = this.initialShips[key];
    }
    this.orientation = 'h';
  }

  toggleOrientation() {
    this.orientation === 'h'
      ? (this.orientation = 'v')
      : (this.orientation = 'h');
  }
}
