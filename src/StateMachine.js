export default class StateMachine {
  constructor(states) {
    this.emptyState = { enter() {}, exit() {}, display() {} };
    this.states = states;
    this.current = this.emptyState;
  }

  change(stateName, params) {
    console.log(`changing state to ${stateName}`);
    this.current.exit();
    this.current = this.states[stateName]();
    this.current.enter(params);
  }
}
