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
        cell.addEventListener('click', (event) => {
          console.log(event.target.dataset.value);
          const [x, y] = event.target.dataset.value.split('');
          this.controller.shoot(parseInt(x), parseInt(y));
        });
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
  constructor(playerName, model, view) {
    this.model = model;
    this.playerName = playerName;
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
  }

  processShotFeedback(x, y, result) {
    this.model.updateCell(x, y, result, 'enemy');
    if (this.view) {
      //   this.view.updateEnemyField();
    }
    if (!this.model.checkField()) {
      const event = new CustomEvent('gameComplete', {
        detail: {
          playerName: this.playerName,
        },
      });
      document.dispatchEvent(event);
    }
  }
}

const botShoot = (model) => {
  const processEnemyField = (field) => {
    return field.flat().reduce((acc, cur, index) => {
      if (!acc.hasOwnProperty(cur)) {
        acc[cur] = [];
      }
      acc[cur].push({ x: index % size, y: Math.floor(index / size) });
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
    startButton.addEventListener('click', () => {
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
      game();
    });
  } else if (state === 'game') {
    const gameField = document.querySelector('#game-field');

    const playerModel = new Model();
    const playerController = new Controller('player', playerModel);
    const view = new View(playerModel, gameField, playerController);

    const botModel = new Model();
    const botController = new Controller('bot', botModel);

    // Place ships

    playerModel.ownField[1][1] = 'S';
    playerModel.ownField[0][0] = 'S';
    botModel.ownField[2][2] = 'S';
    botModel.ownField[0][2] = 'S';

    view.displayAll();
    document.addEventListener('shot', (event) => {
      const { playerName, coords } = event.detail;
      const { x, y } = coords;
      if (playerName === 'bot') {
        playerController.receiveShoot(x, y);
      } else {
        botController.receiveShoot(x, y);
      }
    });
    document.addEventListener('shotResult', (event) => {
      const { playerName, coords, result } = event.detail;
      const { x, y } = coords;
      if (playerName === 'bot') {
        playerController.processShotFeedback(x, y, result);
        const { x: botShotGuessX, y: botShotGuessY } = botShoot(botModel);
        console.log('bot shot x', botShotGuessX, 'y', botShotGuessY);
        botController.shoot(botShotGuessX, botShotGuessY);
        view.updateOwnField();
        view.updateEnemyField();
      } else {
        botController.processShotFeedback(x, y, result);
        view.updateOwnField();
        view.updateEnemyField();
      }
    });
    document.addEventListener('gameComplete', (event) => {
      const { playerName } = event.detail;
      loser = playerName;
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
