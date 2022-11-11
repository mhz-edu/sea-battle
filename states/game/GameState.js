class GameState extends BaseState {
  init(params) {
    this.eventMgr = new EventManager();
    this.lastStateParams = params;
    this.playerModel = this.lastStateParams.playerModel;
    this.comm = this.lastStateParams.commObj;

    const userName =
      this.lastStateParams.userRole === 'main' ? 'Player 1' : 'Player 2';
    this.stateContainer = this.templateParser(`<div>
        <my-text text="You are ${userName}"></my-text>
        <my-text text="Your field"></my-text>
        <div id="player1-container"></div>
        <br>
        <my-text text="Enemy field"></my-text>
        <div id="player2-container"></div>
    </div>`);
    this.view = new View(this.playerModel, this.stateContainer);

    const game = this.createGame(
      this.lastStateParams.gameType,
      this.lastStateParams.userRole
    );

    const logic = new GameLogic(game.firstPlayer, game.secondPlayer);

    this.eventMgr.addListener(game.firstPlayer);
    this.eventMgr.addListener(game.secondPlayer);
    this.eventMgr.addListener(this.view);
    this.eventMgr.addListener(logic);
    this.eventMgr.initialize();

    this.view.displayAll();
    this.enemyField = this.gameField.querySelector('#player2-container');
    this.enemyField.addEventListener('click', this.clickHandler.bind(this));

    document.dispatchEvent(new Event('start'));
    document.addEventListener('gameover', this.gameoverHandler);
  }

  createGame(gameType, userRole) {
    const newPlayer = (playerName) => {
      return new Controller(
        playerName,
        this.playerModel,
        this.playerSelectCell.bind(this)
      );
    };

    const game = {
      single: {
        main: {
          firstPlayer: newPlayer('Player 1'),
          secondPlayer: new Bot().botController,
        },
      },
      multi: {
        main: {
          firstPlayer: newPlayer('Player 1'),
          secondPlayer: new networkPlayer('Player 2', this.comm),
        },
        second: {
          firstPlayer: new networkPlayer('Player 1', this.comm),
          secondPlayer: newPlayer('Player 2'),
        },
      },
    };

    return game[gameType][userRole];
  }

  gameoverHandler({ detail: { outcome } }) {
    stateMachine.change('gameover', outcome);
  }

  exit() {
    document.removeEventListener('gameover', this.gameoverHandler);
    this.eventMgr.destroy();
    super.exit();
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
