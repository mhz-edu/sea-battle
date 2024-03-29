import BaseState from '../BaseState.js';
import EventManager from './EventManager.js';
import GameLogic from './GameLogic.js';
import Controller from './Controller.js';
import Bot from './Bot.js';
import NetworkPlayer from './NetworkPlayer.js';
import STATE_MACHINE from '../../index.js';

export default class GameState extends BaseState {
  init(params) {
    this.eventMgr = new EventManager();
    this.lastStateParams = params;
    this.playerModel = this.lastStateParams.playerModel;
    this.comm = this.lastStateParams.commObj;
    this.gStatus = 'Starting the game...';
    this.createProp('gStatus', 'gameStatus');

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
      this.lastStateParams.userRole,
    );

    const logic = new GameLogic(game.firstPlayer, game.secondPlayer, {
      context: this,
      ref: 'gameStatus',
    });

    this.eventMgr.addListeners(game.firstPlayer, game.secondPlayer, logic);
    this.eventMgr.initialize();

    document.addEventListener('gameover', this.gameoverHandler);
  }

  display() {
    super.display();
    document.dispatchEvent(new Event('start'));
  }

  createGame(gameType, userRole) {
    const newPlayer = (playerName) =>
      new Controller(playerName, this.playerModel);

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
          secondPlayer: new NetworkPlayer('Player 2', this.comm),
        },
        second: {
          firstPlayer: new NetworkPlayer('Player 1', this.comm),
          secondPlayer: newPlayer('Player 2'),
        },
      },
    };

    return game[gameType][userRole];
  }

  // eslint-disable-next-line class-methods-use-this
  gameoverHandler({ detail: { outcome } }) {
    STATE_MACHINE.change('gameover', outcome);
  }

  exit() {
    document.removeEventListener('gameover', this.gameoverHandler);
    this.eventMgr.destroy();
    super.exit();
  }

  clickHandler(event) {
    const [x, y] = event.target.dataset.value.split('');
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
