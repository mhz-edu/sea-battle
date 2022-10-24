class MenuState extends BaseState {
  init() {
    const menu = {
      screen: {
        title: 'Main menu',
        options: [
          { title: 'Start Game with Bot', id: 'newGame' },
          { title: 'Multiplayer - Start', id: 'multiStart' },
          { title: 'Multiplayer - Connect', id: 'multiConn' },
        ],
      },
    };
    this.template = (props) => ({
      templ: `
      <div>${props.title}</div>
      <ul>
        <li><div><button id="${props.options[0].id}" data-value="${props.options[0].id}">${props.options[0].title}</button></div></li>
        <li><div><button id="${props.options[1].id}" data-value="${props.options[1].id}">${props.options[1].title}</button></div></li>
        <li><div><button id="${props.options[2].id}" data-value="${props.options[2].id}">${props.options[2].title}</button></div></li>
      </ul>
      `,
      refs: {},
    });
    this.stateContainer = this.generateMenu(menu);
  }

  generateMenu(menu) {
    const menuElement = document.createElement('div');
    const menuTemplate = this.template(menu.screen);
    menuElement.innerHTML = menuTemplate.templ;
    for (let option of menu.screen.options) {
      menuTemplate.refs[option.id] = menuElement.querySelector(`#${option.id}`);
      menuTemplate.refs[option.id].addEventListener(
        'click',
        this.processUserSelect
      );
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
