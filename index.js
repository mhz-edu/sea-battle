const size = 3;

const app = document.querySelector('#app');

const stateMachine = new StateMachine({
  menu: () => new MenuState(app),
  game: () => new GameState(app),
  gameover: () => new GameOverState(app),
});

stateMachine.change('menu');
