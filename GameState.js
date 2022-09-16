class GameState {
  constructor(app) {
    this.app = app;
    this.playerModel = new Model();
    this.eventMgr = new EventManager();
    this.gameField = document.createElement('div');
    this.view = new View(this.playerModel, this.gameField);
  }

  enter() {
    const playerController = new Controller('player', this.playerModel, () => {
      console.log('inside player select cell func');
      return new Promise((resolve) => {
        document.addEventListener('click', (ev) => {
          console.log(ev);
          resolve(ev.target.dataset.value.split(''));
        });
      });
    });

    const botModel = new Model();
    const botShoot = (model) => {
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
    };
    const botController = new Controller('bot', botModel, () => {
      console.log('inside bot select cell');
      return Promise.resolve(botShoot(botModel));
    });

    const logic = new GameLogic(botController, playerController);

    // Place ships

    this.playerModel.ownField[1][1] = 'S';
    this.playerModel.ownField[0][0] = 'S';
    botModel.ownField[2][2] = 'S';
    botModel.ownField[0][2] = 'S';

    this.eventMgr.addListener(playerController);
    this.eventMgr.addListener(botController);
    this.eventMgr.addListener(this.view);
    this.eventMgr.addListener(logic);
    this.eventMgr.initialize();
    document.dispatchEvent(new Event('start'));
    document.addEventListener('gameover', (event) => {
      const { outcome } = event.detail;
      stateMachine.change('gameover', outcome);
    });
  }

  exit() {
    this.app.removeChild(this.gameField);
  }

  display() {
    this.gameField.setAttribute('id', 'game-field');
    this.gameField.innerHTML = `
        <div>Player field</div>
        <div id="player1-container"></div>
        <br>
        <div>Bot field</div>
        <div id="player2-container"></div>
      `;
    this.app.appendChild(this.gameField);

    this.view.displayAll();
  }
}
