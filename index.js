const GAMEFIELD_SIZE = 10;
const INITIAL_SHIPS = { 1: 4, 2: 3, 3: 2, 4: 1 };

const app = document.querySelector('#app');

const STATE_MACHINE = new StateMachine({
  menu: () => new MenuState(app),
  ships: () => new ShipPlaceState(app),
  comms: () => new CommunicationScreenState(app),
  game: () => new GameState(app),
  gameover: () => new GameOverState(app),
});

STATE_MACHINE.change('menu');
