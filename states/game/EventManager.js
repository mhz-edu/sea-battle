class EventManager {
  constructor() {
    this.listeners = [];
    this.events = ['start', 'shot', 'shotResult', 'turnEnd'];
    this.handler = this.eventNotifier.bind(this);
  }

  addListeners(...listeners) {
    this.listeners.push(...listeners);
  }

  removeListener(listener) {
    this.listeners = this.listeners.filter((item) => item !== listener);
  }

  initialize() {
    console.log('initialize event mgr');
    for (let event of this.events) {
      document.addEventListener(event, this.handler);
    }
  }

  eventNotifier(event) {
    console.log(event);
    this.listeners.forEach((listener) => listener.notify(event));
  }

  destroy() {
    console.log('removing event listeners');
    for (let event of this.events) {
      document.removeEventListener(event, this.handler);
    }
  }
}
