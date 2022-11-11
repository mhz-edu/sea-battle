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

    const playerNameDiv = document.createElement('div');
    playerNameDiv.innerText = `You are ${
      this.lastStateParams.userRole === 'main' ? 'Player 1' : 'Player 2'
    }`;
    this.gameField.appendChild(playerNameDiv);

    this.gameField.setAttribute('id', 'game-field');
    this.gameField.innerHTML =
      this.gameField.innerHTML +
      `
        <div>Your field</div>
        <div id="player1-container"></div>
        <br>
        <div>Enemy field</div>
        <div id="player2-container"></div>
      `;
    this.app.appendChild(this.gameField);

    let firstPlayer, secondPlayer;
    if (this.lastStateParams.gameType === 'single') {
      const playerName = 'Player 1';
      firstPlayer = new Controller(playerName, this.playerModel);
      const bot = new Bot();
      secondPlayer = bot.botController;
    } else if (this.lastStateParams.gameType === 'multi') {
      if (this.lastStateParams.userRole === 'main') {
        const playerName = 'Player 1';
        const netPlayerName = 'Player 2';
        firstPlayer = new Controller(playerName, this.playerModel);
        secondPlayer = new networkPlayer(netPlayerName, this.comm);
      } else {
        const playerName = 'Player 2';
        const netPlayerName = 'Player 1';
        firstPlayer = new networkPlayer(netPlayerName, this.comm);
        secondPlayer = new Controller(playerName, this.playerModel);
      }
    }

    const logic = new GameLogic(firstPlayer, secondPlayer);

    this.eventMgr.addListener(firstPlayer);
    this.eventMgr.addListener(secondPlayer);
    this.eventMgr.addListener(this.view);
    this.eventMgr.addListener(logic);
    this.eventMgr.initialize();

    this.view.displayAll();
    this.enemyField = this.gameField.querySelector('#player2-container');
    this.enemyField.addEventListener('click', this.clickHandler.bind(this));

    document.dispatchEvent(new Event('start'));
    document.addEventListener('gameover', this.gameoverHandler);
  }

  gameoverHandler({ detail: { outcome } }) {
    stateMachine.change('gameover', outcome);
  }

  exit() {
    document.removeEventListener('gameover', this.gameoverHandler);
    this.eventMgr.destroy();
    this.app.removeChild(this.gameField);
  }

  clickHandler(event) {
    const [x, y] = event.target.dataset.value.split('');
    const clickEvent = new CustomEvent('playerCellSelect', {
      detail: {
        playerName:
          this.lastStateParams.userRole === 'main' ? 'Player 1' : 'Player 2',
        coords: { x, y },
      },
    });
    this.eventMgr.eventNotifier(clickEvent);
  }
}
