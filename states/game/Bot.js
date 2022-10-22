class Bot {
  constructor() {
    this.botModel = new Model();

    // Place bot ships
    this.randomShips();

    this.botController = new Controller('Bot', this.botModel, () => {
      console.log('inside bot select cell');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.botShoot(this.botModel));
        }, 1000);
      });
    });
  }

  botShoot(model) {
    const processEnemyField = (field) => {
      return field.flat().reduce((acc, cur, index) => {
        if (!acc.hasOwnProperty(cur)) {
          acc[cur] = [];
        }
        acc[cur].push([index % size, Math.floor(index / size)]);
        return acc;
      }, {});
    };
    const enemyField = processEnemyField(model.enemyField);
    const potentialTargets = enemyField['?'];
    return potentialTargets[
      Math.floor(Math.random() * potentialTargets.length)
    ];
  }

  randomShips() {
    /*Alghoritm description
     * While we have ships to place
     *   1. select random orientation
     *   2. get biggest ship needed to place
     *   3. update mask array -> mark ship cells and cells around ship as blocked for placement
     *   4. select random number which will be used as row or column number
     *   5. break selected row or column into parts available for placement
     *   6. iterating over parts, select first which length is less or equal to ship size
     *   7. place ship with random offset inside selcted part, deduct ship from available and break iterating
     *   8. if placement was successful, continue to the next ship, else try to place same ship again
     * If number of tries to place the ship exceeds 10, throw an error
     */
    const ships = { 1: 4, 2: 3, 3: 2, 4: 1 };
    let tries = 0;
    while (!Object.values(ships).every((val) => val === 0)) {
      let trySuccessful = false;
      const orientation = Math.random() >= 0.5 ? 'h' : 'v';
      const biggestShipSize = Math.max(
        ...Object.entries(ships)
          .filter(([size, qty]) => qty !== 0)
          .map(([size, qty]) => size)
      );

      const mask = this.botModel.getMask(biggestShipSize, orientation);

      const randomRowColumn = Math.floor(
        Math.random() * (size - biggestShipSize)
      );

      const emptyCellsMap = utils.getEmptyCellsInRow(mask[randomRowColumn]);
      for (let { start, end, length } of emptyCellsMap) {
        if (biggestShipSize <= length) {
          // select random placement inside free space
          const randomStart = Math.floor(
            Math.random() * (length - biggestShipSize + 1)
          );
          // place ship
          this.botModel.placeShip(
            start + randomStart,
            randomRowColumn,
            biggestShipSize,
            orientation
          );
          ships[biggestShipSize] = ships[biggestShipSize] - 1;
          trySuccessful = true;
          break;
        }
      }
      if (!trySuccessful) {
        tries += 1;
      }
      if (tries > 10) {
        throw new Error('Cannot place ships');
      }
    }

    console.log('Bot placement done');
  }
}
