class EventManager {
  constructor() {
    this.listeners = [];
    this.events = ['start', 'shot', 'shotResult', 'turnEnd', 'noShips'];
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  removeListener(listener) {
    this.listeners = this.listeners.filter((item) => item !== listener);
  }

  initialize() {
    console.log('initialize event mgr');
    console.log('Listeners', this.listeners);
    for (let event of this.events) {
      document.addEventListener(event, (ev) => {
        console.log(ev);
        this.listeners.forEach((listener) => listener.notify(ev));
      });
    }
  }
}
