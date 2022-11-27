import BaseState from '../BaseState';

export default class MenuState extends BaseState {
  init() {
    this.stateContainer = this.templateParser(`
      <div>
        <div class="hero is-link">
          <div class="hero-body title">
            <my-text  text="Main menu"></my-text>
          </div>
        </div>
        <div class="container section">
          <my-list click="processUserSelect">
            <li slot="item"><my-button title="Start Game with Bot" data-value="newGame"></my-button></li>
            <li slot="item"><my-button title="Multiplayer - Start" data-value="multiStart"></my-button></li>
            <li slot="item"><my-button title="Multiplayer - Connect" data-value="multiConn"></my-button></li>
          </my-list>
        </div>
      <div>
      `);
  }

  processUserSelect(clickEvent) {
    if (clickEvent.path[0].localName === 'button') {
      const options = {
        newGame: { userRole: 'main', gameType: 'single' },
        multiStart: { userRole: 'main', gameType: 'multi' },
        multiConn: { userRole: 'second', gameType: 'multi' },
      };
      const userSelect = clickEvent.target.dataset.value;
      STATE_MACHINE.change('ships', options[userSelect]);
    }
  }
}
