class Bot {
  constructor() {
    this.botModel = new Model();

    // Place bot ships

    this.botModel.ownField[2][2] = 'S';
    this.botModel.ownField[0][2] = 'S';

    this.botController = new Controller('bot', this.botModel, () => {
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
}
