import BaseState from '../BaseState.js';
import STATE_MACHINE from '../../index.js';

export default class GameOverState extends BaseState {
  init(params) {
    const resultText = params === 'tie' ? 'Tie' : `${params} Loses!`;
    this.stateContainer = this.templateParser(`
      <div>
        <div class="hero is-link">
          <div class="hero-body title">
            <my-text  text="Game Over"></my-text>
          </div>
        </div>
        <div class="container section">
          <div class="hero is-primary block">
            <div class="hero-body title">
              <my-text text="${resultText}"></my-text>
            </div>
          </div>
          <div class="block">
            <my-list click="processUserSelect">
              <li slot="item"><my-button title="Return to Main Menu"></my-button></li>
            </my-list>
          </div>
        </div>
      <div>
      `);
  }

  // eslint-disable-next-line class-methods-use-this
  processUserSelect() {
    STATE_MACHINE.change('menu');
  }
}
