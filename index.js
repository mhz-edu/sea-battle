const size = 3;

class View {
  constructor(model, rootElement, controller) {
    this.model = model;
    this.root = rootElement;
    this.controller = controller;
  }

  displayOwnField() {
    const container1 = this.root.querySelector('#player1-container');
    const table = document.createElement('table');
    for (let i = 0; i < size; i++) {
      const row = document.createElement('tr');
      for (let j = 0; j < size; j++) {
        const cell = document.createElement('td');
        cell.innerText = this.model.ownField[i][j];
        row.appendChild(cell);
      }
      table.appendChild(row);
    }
    container1.appendChild(table);
  }

  displayEnemyField() {
    const container2 = this.root.querySelector('#player2-container');
    const table1 = document.createElement('table');
    for (let i = 0; i < size; i++) {
      const row = document.createElement('tr');
      for (let j = 0; j < size; j++) {
        const cell = document.createElement('td');
        cell.innerText = this.model.enemyField[i][j];
        cell.classList.add('player');
        cell.setAttribute('data-value', `${j}${i}`);
        row.appendChild(cell);
      }
      table1.appendChild(row);
    }
    container2.appendChild(table1);
  }

  displayAll() {
    this.displayOwnField();
    this.displayEnemyField();
  }

  updateOwnField() {
    const field = this.root.querySelector('#player1-container table');
    field.remove();
    this.displayOwnField();
  }

  updateEnemyField() {
    const field = this.root.querySelector('#player2-container table');
    field.remove();
    this.displayEnemyField();
  }

  notify(event) {
    if (event.type === 'turnEnd') {
      this.updateOwnField();
      this.updateEnemyField();
    }
  }
}

class Model {
  constructor() {
    this.ownField = Array(size)
      .fill(null)
      .map(() => Array(size).fill('E'));
    this.enemyField = Array(size)
      .fill(null)
      .map(() => Array(size).fill('?'));
  }

  checkCell(x, y) {
    if (this.ownField[y][x] === 'S') {
      return 'H';
    } else {
      return 'M';
    }
  }

  checkField() {
    return this.ownField.flat().some((cell) => cell === 'S');
  }

  updateCell(x, y, value, fieldMark) {
    if (fieldMark === 'own') {
      this.ownField[y][x] = value;
    } else if (fieldMark === 'enemy') {
      this.enemyField[y][x] = value;
    }
  }
}

class Controller {
  constructor(playerName, model, selectCell, view) {
    this.model = model;
    this.playerName = playerName;
    this.selectCell = selectCell;
    if (view) {
      this.view = view;
    }
  }

  shoot(x, y) {
    const event = new CustomEvent('shot', {
      detail: {
        playerName: this.playerName,
        coords: { x, y },
      },
    });
    document.dispatchEvent(event);
  }

  receiveShoot(x, y) {
    const result = this.model.checkCell(x, y);
    this.model.updateCell(x, y, result, 'own');
    if (this.view) {
      //   this.view.updateOwnField();
    }
    const event = new CustomEvent('shotResult', {
      detail: {
        playerName: this.playerName,
        coords: { x, y },
        result,
      },
    });
    document.dispatchEvent(event);

    if (!this.model.checkField()) {
      const event = new CustomEvent('noShips', {
        detail: {
          playerName: this.playerName,
        },
      });
      document.dispatchEvent(event);
    }
  }

  processShotFeedback(x, y, result) {
    this.model.updateCell(x, y, result, 'enemy');
    if (this.view) {
      //   this.view.updateEnemyField();
    }
    const event = new CustomEvent('turnEnd', {
      detail: {
        playerName: this.playerName,
      },
    });
    document.dispatchEvent(event);
  }

  async turn() {
    const [x, y] = await this.selectCell();
    console.log('selected', x, y);
    this.shoot(x, y);
  }

  notify(incomingEvent) {
    if (
      incomingEvent.type === 'shot' &&
      incomingEvent.detail.playerName !== this.playerName
    ) {
      const { playerName, coords } = incomingEvent.detail;
      const { x, y } = coords;
      this.receiveShoot(x, y);
    } else if (
      incomingEvent.type === 'shotResult' &&
      incomingEvent.detail.playerName !== this.playerName
    ) {
      const { playerName, coords, result } = incomingEvent.detail;
      const { x, y } = coords;
      this.processShotFeedback(x, y, result);
    }
  }
}

class EventManager {
  constructor() {
    this.listeners = [];
    this.events = ['start', 'shot', 'shotResult', 'turnEnd', 'noShips'];
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  removeListener(listener) {
    this.listeners = this.listeners.filter((item) => item !== listener);
  }

  initialize() {
    console.log('initialize event mgr');
    console.log('Listeners', this.listeners);
    for (let event of this.events) {
      document.addEventListener(event, (ev) => {
        console.log(ev);
        this.listeners.forEach((listener) => listener.notify(ev));
      });
    }
  }
}

class GameLogic {
  constructor(firstPlayer, secondPlayer) {
    this.firstPlayer = firstPlayer;
    this.secondPlayer = secondPlayer;
    this.lastTurn = false;
  }

  notify(event) {
    if (event.type === 'start') {
      this.firstPlayer.turn();
    } else if (event.type === 'turnEnd' && !this.lastTurn) {
      if (event.detail.playerName === this.firstPlayer.playerName) {
        this.secondPlayer.turn();
      } else {
        this.firstPlayer.turn();
      }
    } else if (event.type === 'noShips' && !this.lastTurn) {
      this.lastTurn = true;
      if (event.detail.playerName === this.firstPlayer.playerName) {
        loser = this.firstPlayer.playerName;
        this.secondPlayer.turn();
      } else {
        loser = this.secondPlayer.playerName;
        this.firstPlayer.turn();
      }
    } else if (event.type === 'noShips' && this.lastTurn) {
      loser = 'tie';
    } else if (event.type === 'turnEnd' && this.lastTurn) {
      document.dispatchEvent(new Event('gameover'));
    }
  }
}

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
    const view = new View(playerModel, gameField, playerController);

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
