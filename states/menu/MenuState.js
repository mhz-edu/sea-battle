class MenuState extends BaseState {
  init() {
    this.stateContainer = this.templateParser(`
      <div>
        <div>
          <my-text text="Main menu"></my-text>
        </div>
        <my-list>
          <li slot="item"><my-button title="Start Game with Bot" data-value="newGame" click="processUserSelect"></my-button></li>
          <li slot="item"><my-button title="Multiplayer - Start" data-value="multiStart" click="processUserSelect"></my-button></li>
          <li slot="item"><my-button title="Multiplayer - Connect" data-value="multiConn" click="processUserSelect"></my-button></li>
        </my-list>
      <div>
      `);
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
