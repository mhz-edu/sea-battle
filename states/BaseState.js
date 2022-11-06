class BaseState {
  constructor(app) {
    this.appContainer = app;
    this.stateContainer = null;
    this.templateParser = utils.templateParser.bind(this);
  }

  init() {}

  enter(params) {
    this.init(params);
    this.display();
  }

  display() {
    if (this.stateContainer) {
      this.appContainer.appendChild(this.stateContainer);
    }
  }

  exit() {
    if (this.stateContainer) {
      this.appContainer.replaceChildren([]);
    }
  }
}
