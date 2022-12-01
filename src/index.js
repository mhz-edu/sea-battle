import StateMachine from './StateMachine.js';
import MenuState from './states/menu/MenuState.js';
import ShipPlaceState from './states/shipPlace/ShipPlaceState.js';
import CommunicationScreenState from './states/communication/CommunicationScreenState.js';
import GameState from './states/game/GameState.js';
import GameOverState from './states/gameOver/GameOverState.js';

const app = document.querySelector('#app');

export const STATE_MACHINE = new StateMachine({
  menu: () => new MenuState(app),
  ships: () => new ShipPlaceState(app),
  comms: () => new CommunicationScreenState(app),
  game: () => new GameState(app),
  gameover: () => new GameOverState(app),
});

STATE_MACHINE.change('menu');
