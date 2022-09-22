const size = 10;

const app = document.querySelector('#app');

const stateMachine = new StateMachine({
  menu: () => new MenuState(app),
  ships: () => new ShipPlaceState(app),
  comms: () => new CommunicationScreenState(app),
  game: () => new GameState(app),
  gameover: () => new GameOverState(app),
});

stateMachine.change('menu');
