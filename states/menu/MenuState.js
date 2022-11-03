class MenuState extends BaseState {
  init() {
    this.stateContainer = this.templateParser(`
      <div>
        <div>
          <my-text text="Main menu"></my-text>
        </div>
        <my-list click="processUserSelect">
          <li slot="item"><my-button title="Start Game with Bot" data-value="newGame"></my-button></li>
          <li slot="item"><my-button title="Multiplayer - Start" data-value="multiStart"></my-button></li>
          <li slot="item"><my-button title="Multiplayer - Connect" data-value="multiConn"></my-button></li>
        </my-list>
      <div>
      `);
  }

  processUserSelect(clickEvent) {
    const options = {
      newGame: { userRole: 'main', gameType: 'single' },
      multiStart: { userRole: 'main', gameType: 'multi' },
      multiConn: { userRole: 'second', gameType: 'multi' },
    };
    const userSelect = clickEvent.target.dataset.value;
    stateMachine.change('ships', options[userSelect]);
  }
}
