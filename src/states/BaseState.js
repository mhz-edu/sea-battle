import Subscribable from '../Subscribable';
import { templateParser } from '../utils';

export default class BaseState extends Subscribable {
  constructor(app) {
    super();
    this.appContainer = app;
    this.stateContainer = null;
    this.templateParser = templateParser.bind(this);
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
