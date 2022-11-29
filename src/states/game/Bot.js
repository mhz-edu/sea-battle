import Model from './Model.js';
import Controller from './Controller.js';
import { GAMEFIELD_SIZE, INITIAL_SHIPS } from '../../config.js';

export default class Bot {
  constructor() {
    const BOT_TURN_DURATION = 1000;
    this.botModel = new Model(GAMEFIELD_SIZE);

    // Place bot ships
    this.botModel.randomShipsFill({ ...INITIAL_SHIPS });

    this.botController = new Controller('Bot', this.botModel, () => {
      console.log('inside bot select cell');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.botShoot(this.botModel));
        }, BOT_TURN_DURATION);
      });
    });
  }

  botShoot(model) {
    const processEnemyField = (model) => {
      return [...model.rows('enemy')].flat().reduce((acc, cur, index) => {
        if (!acc.hasOwnProperty(cur)) {
          acc[cur] = [];
        }
        acc[cur].push([
          index % GAMEFIELD_SIZE,
          Math.floor(index / GAMEFIELD_SIZE),
        ]);
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
