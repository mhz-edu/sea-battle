class GameState {
  constructor(app) {
    this.app = app;
    this.playerModel = null;
    this.eventMgr = new EventManager();
    this.gameField = document.createElement('div');
    this.view = null;
    this.comm = null;
    this.lastStateParams = null;
  }

  enter(params) {
    this.lastStateParams = params;
    this.playerModel = this.lastStateParams.playerModel;
    this.comm = this.lastStateParams.commObj;
    this.view = new View(this.playerModel, this.gameField);
    const playerName =
      this.lastStateParams.userRole === 'main' ? 'player' : 'player2';
    const playerNameDiv = document.createElement('div');
    playerNameDiv.innerText = `You are ${
      this.lastStateParams.userRole === 'main' ? 'Player 1' : 'Player 2'
    }`;
    this.app.appendChild(playerNameDiv);
    const playerController = new Controller(
      playerName,
      this.playerModel,
      () => {
        console.log('inside player select cell func');
        return new Promise((resolve) => {
          this.gameField.addEventListener(
            'click',
            (ev) => {
              console.log(ev);
              resolve(ev.target.dataset.value.split(''));
            },
            { once: true }
          );
        });
      }
    );

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

    const netPlayerName =
      this.lastStateParams.userRole === 'main' ? 'player2' : 'player';
    const networkPlayerController = new networkPlayer(netPlayerName, this.comm);
    let logic;
    if (this.lastStateParams.userRole === 'main') {
      logic = new GameLogic(playerController, networkPlayerController);
    } else {
      logic = new GameLogic(networkPlayerController, playerController);
    }

    // Place ships

    botModel.ownField[2][2] = 'S';
    botModel.ownField[0][2] = 'S';

    this.eventMgr.addListener(playerController);
    this.eventMgr.addListener(networkPlayerController);
    this.eventMgr.addListener(this.view);
    this.eventMgr.addListener(logic);
    this.eventMgr.initialize();
    document.dispatchEvent(new Event('start'));
    document.addEventListener('gameover', this.gameoverHandler);
  }

  gameoverHandler(gameoverEvent) {
    const { outcome } = gameoverEvent.detail;
    stateMachine.change('gameover', outcome);
  }

  exit() {
    document.removeEventListener('gameover', this.gameoverHandler);
    this.eventMgr.destroy();
    this.app.removeChild(this.gameField);
  }

  display() {
    this.gameField.setAttribute('id', 'game-field');
    this.gameField.innerHTML = `
        <div>Your field</div>
        <div id="player1-container"></div>
        <br>
        <div>Enemy field</div>
        <div id="player2-container"></div>
      `;
    this.app.appendChild(this.gameField);

    this.view.displayAll();
  }
}
