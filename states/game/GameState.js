class GameState extends BaseState {
  init(params) {
    this.eventMgr = new EventManager();
    this.lastStateParams = params;
    this.playerModel = this.lastStateParams.playerModel;
    this.comm = this.lastStateParams.commObj;
    this._gameStatus = 'Starting the game...';
    this.createProp('_gameStatus', 'gameStatus');

    const userName =
      this.lastStateParams.userRole === 'main' ? 'Player 1' : 'Player 2';
    this.stateContainer = this.templateParser(`
    <div>
      <div class="hero is-link">
        <div class="hero-body title">
          <my-text text="Game"></my-text>
          <div class="subtitle">
            <my-text text="You are ${userName}"></my-text>
          </div>
        </div>
      </div>
      <div class="container is-max-widescreen">
        <div class="section">
          <div class="columns">
            <div class="column">
              <div class="panel">
                <div class="panel-heading">
                  <my-text text="Your field"></my-text>
                </div>
                <div class="panel-block">
                  <game-field size="10" cellContent="def" data="playerModel" type="own"></game-field>
                </div>
              </div>
            </div>
            <div class="column">
              <div class="panel">
                <div class="panel-heading">
                  <my-text text="Enemy field"></my-text>
                </div>
                <div class="panel-block">
                  <game-field size="10" cellContent="def" click="clickHandler" data="playerModel" type="enemy"></game-field>
                </div>
            </div>
          </div>
        </div>
        <div class="panel">
            <div class="panel-heading">
              <my-text text="Game status"></my-text>
            </div>
            <div class="panel-block">
              <my-text text="gameStatus"></my-text>
            </div>
        </div>
      </div>  
    </div>`);

    const game = this.createGame(
      this.lastStateParams.gameType,
      this.lastStateParams.userRole
    );

    const logic = new GameLogic(game.firstPlayer, game.secondPlayer, {
      context: this,
      ref: 'gameStatus',
    });

    this.eventMgr.addListener(game.firstPlayer);
    this.eventMgr.addListener(game.secondPlayer);
    this.eventMgr.addListener(logic);
    this.eventMgr.initialize();

    document.addEventListener('gameover', this.gameoverHandler);
  }

  display() {
    super.display();
    document.dispatchEvent(new Event('start'));
  }

  createGame(gameType, userRole) {
    const newPlayer = (playerName) => {
      return new Controller(playerName, this.playerModel);
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
    console.log(this.playerModel.enemy[x][y]);
    if (this.playerModel.enemy[y][x] === '?') {
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
}
