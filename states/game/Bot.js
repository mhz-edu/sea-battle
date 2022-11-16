class Bot {
  constructor() {
    this.botModel = new Model();

    // Place bot ships
    this.botModel.randomShipsFill({ 1: 4, 2: 3, 3: 2, 4: 1 });

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
    const processEnemyField = (model) => {
      return [...model.rows('enemy')].flat().reduce((acc, cur, index) => {
        if (!acc.hasOwnProperty(cur)) {
          acc[cur] = [];
        }
        acc[cur].push([index % size, Math.floor(index / size)]);
        return acc;
      }, {});
    };
    const enemyField = processEnemyField(model);
    const potentialTargets = enemyField['?'];
    return potentialTargets[
      Math.floor(Math.random() * potentialTargets.length)
    ];
  }
}
