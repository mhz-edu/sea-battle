const size = 3;

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
  return potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
};

const app = document.querySelector('#app');
let state = 'menu';
let loser;

const game = () => {
  if (state === 'menu') {
    const menu = document.createElement('div');
    menu.innerHTML = `
    <button id="start">Start game</button>
    `;
    app.appendChild(menu);
    const startButton = document.querySelector('#start');
    startButton.addEventListener('click', (event) => {
      while (app.firstChild) {
        app.removeChild(app.firstChild);
      }
      const gameField = document.createElement('div');
      gameField.setAttribute('id', 'game-field');
      gameField.innerHTML = `
        <div>Player field</div>
        <div id="player1-container"></div>
        <br>
        <div>Bot field</div>
        <div id="player2-container"></div>
      `;
      app.appendChild(gameField);
      state = 'game';
      event.stopImmediatePropagation();
      game();
    });
  } else if (state === 'game') {
    const gameField = document.querySelector('#game-field');

    const playerModel = new Model();
    const playerController = new Controller('player', playerModel, () => {
      console.log('inside player select cell func');
      return new Promise((resolve) => {
        document.addEventListener('click', (ev) => {
          console.log(ev);
          resolve(ev.target.dataset.value.split(''));
        });
      });
    });
    const view = new View(playerModel, gameField);

    const botModel = new Model();
    const botController = new Controller('bot', botModel, () => {
      console.log('inside bot select cell');
      return Promise.resolve(botShoot(botModel));
    });

    const logic = new GameLogic(botController, playerController);

    // Place ships

    playerModel.ownField[1][1] = 'S';
    playerModel.ownField[0][0] = 'S';
    botModel.ownField[2][2] = 'S';
    botModel.ownField[0][2] = 'S';

    const eventMgr = new EventManager();
    eventMgr.addListener(playerController);
    eventMgr.addListener(botController);
    eventMgr.addListener(view);
    eventMgr.addListener(logic);
    eventMgr.initialize();

    view.displayAll();

    document.dispatchEvent(new Event('start'));
    document.addEventListener('gameover', () => {
      state = 'gameover';
      game();
    });
  } else if (state === 'gameover') {
    while (app.firstChild) {
      app.removeChild(app.firstChild);
    }
    const victoryContainer = document.createElement('div');
    victoryContainer.setAttribute('id', 'victory');
    victoryContainer.innerText = `Game Over! ${loser} Loses!`;
    app.appendChild(victoryContainer);
  }
};

game();
