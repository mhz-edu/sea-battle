class GameOverState {
  constructor(app) {
    this.app = app;
    this.mainElement = null;
  }

  enter(params) {
    this.mainElement = document.createElement('div');
    this.mainElement.setAttribute('id', 'victory');
    const text = params === 'tie' ? 'Tie' : `${params} Loses!`;
    this.mainElement.innerText = `Game Over! ${text} `;

    const returnBtn = document.createElement('button');
    returnBtn.innerText = 'Return to Main Menu';
    returnBtn.addEventListener('click', () => {
      stateMachine.change('menu');
    });
    this.mainElement.appendChild(returnBtn);
  }

  exit() {
    this.app.removeChild(this.mainElement);
  }

  display() {
    this.app.appendChild(this.mainElement);
  }
}
