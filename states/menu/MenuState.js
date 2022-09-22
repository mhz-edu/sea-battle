class MenuState {
  constructor(app) {
    this.app = app;
    this.menu = {
      screen: {
        title: 'Main menu',
        options: [
          { title: 'Start Game with Bot', id: 'newGame' },
          { title: 'Multiplayer - Start', id: 'multiStart' },
          { title: 'Multiplayer - Connect', id: 'multiConn' },
        ],
      },
    };
    this.menuElement = null;
  }

  enter() {
    if (!this.menuElement) {
      this.menuElement = this.generateMenu(this.menu);
    }
    this.app.appendChild(this.menuElement);
  }

  exit() {
    this.app.removeChild(this.menuElement);
  }

  generateMenu() {
    const menuElement = document.createElement('div');
    for (let screen in this.menu) {
      const menuScreen = document.createElement('div');
      menuScreen.innerText = this.menu[screen].title;
      for (let option of this.menu[screen].options) {
        const optionBtn = document.createElement('button');
        optionBtn.innerText = option.title;
        optionBtn.setAttribute('data-value', option.id);
        optionBtn.addEventListener('click', this.processUserSelect);
        menuScreen.appendChild(optionBtn);
      }
      menuElement.appendChild(menuScreen);
    }
    return menuElement;
  }

  processUserSelect(clickEvent) {
    clickEvent.stopImmediatePropagation();
    const userSelect = clickEvent.target.dataset.value;
    if (userSelect === 'newGame') {
      stateMachine.change('ships', { userRole: 'main', gameType: 'single' });
    } else if (userSelect === 'multiStart') {
      stateMachine.change('ships', { userRole: 'main', gameType: 'multi' });
    } else if (userSelect === 'multiConn') {
      stateMachine.change('ships', { userRole: 'second', gameType: 'multi' });
    }
  }
}
