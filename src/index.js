import StateMachine from './StateMachine';
import MenuState from './states/menu/MenuState';
import ShipPlaceState from './states/shipPlace/ShipPlaceState';
import CommunicationScreenState from './states/communication/CommunicationScreenState';
import GameState from './states/game/GameState';
import GameOverState from './states/gameOver/GameOverState';

const app = document.querySelector('#app');

const STATE_MACHINE = new StateMachine({
  menu: () => new MenuState(app),
  ships: () => new ShipPlaceState(app),
  comms: () => new CommunicationScreenState(app),
  game: () => new GameState(app),
  gameover: () => new GameOverState(app),
});

STATE_MACHINE.change('menu');
