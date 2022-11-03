class GameOverState extends BaseState {
  init(params) {
    const resultText = params === 'tie' ? 'Tie' : `${params} Loses!`;
    this.stateContainer = this.templateParser(`
      <div>
        <div>
          <my-text text="Game Over"></my-text>
        </div>
        <div>
          <my-text text="${resultText}"></my-text>
        </div>
        <my-list click="processUserSelect">
          <li slot="item"><my-button title="Return to Main Menu"></my-button></li>
        </my-list>
      <div>
      `);
  }

  processUserSelect() {
    stateMachine.change('menu');
  }
}
