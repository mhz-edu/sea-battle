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
    this.app.appendChild(playerNameDiv);

    let firstPlayer, secondPlayer;
    if (this.lastStateParams.gameType === 'single') {
      const playerName = 'player';
      firstPlayer = new Controller(
        playerName,
        this.playerModel,
        this.playerSelectCell.bind(this)
      );
      const bot = new Bot();
      secondPlayer = bot.botController;
    } else if (this.lastStateParams.gameType === 'multi') {
      if (this.lastStateParams.userRole === 'main') {
        const playerName = 'player';
        const netPlayerName = 'player2';
        firstPlayer = new Controller(
          playerName,
          this.playerModel,
          this.playerSelectCell.bind(this)
        );
        secondPlayer = new networkPlayer(netPlayerName, this.comm);
      } else {
        const playerName = 'player2';
        const netPlayerName = 'player';
        firstPlayer = new networkPlayer(netPlayerName, this.comm);
        secondPlayer = new Controller(
          playerName,
          this.playerModel,
          this.playerSelectCell.bind(this)
        );
      }
    }

    const logic = new GameLogic(firstPlayer, secondPlayer);

    this.eventMgr.addListener(firstPlayer);
    this.eventMgr.addListener(secondPlayer);
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

  playerSelectCell() {
    console.log('inside player select cell func', this);
    return new Promise((resolve) => {
      console.log(this);
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
}
