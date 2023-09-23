import Model from './Model.js';
import Controller from './Controller.js';
import { GAMEFIELD_SIZE, INITIAL_SHIPS } from '../../config.js';

export default class Bot {
  constructor() {
    const BOT_TURN_DURATION = 1000;
    this.botModel = new Model(GAMEFIELD_SIZE);

    // Place bot ships
    this.botModel.randomShipsFill({ ...INITIAL_SHIPS });

    this.botController = new Controller(
      'Bot',
      this.botModel,
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(Bot.botShoot(this.botModel));
          }, BOT_TURN_DURATION);
        }),
    );
  }

  static botShoot(field) {
    const processEnemyField = (model) =>
      [...model.rows('enemy')].flat().reduce((acc, cur, index) => {
        if (!acc[cur]) {
          acc[cur] = [];
        }
        acc[cur].push([
          index % GAMEFIELD_SIZE,
          Math.floor(index / GAMEFIELD_SIZE),
        ]);
        return acc;
      }, {});
    const enemyField = processEnemyField(field);
    const potentialTargets = enemyField['?'];
    return potentialTargets[
      Math.floor(Math.random() * potentialTargets.length)
    ];
  }
}
