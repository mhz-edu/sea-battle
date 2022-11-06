class CommunicationScreenState extends BaseState {
  init(params) {
    this.comm = new Communication(this.connectionCallBack.bind(this));
    this.stateChangeTimer = null;
    this.lastStateParams = params;
    this.peerId = this.comm.inititialize();
    this._cs = ' ';
    this.subs = { connectionStatus: [] };
    this.subscribable = ['connectionStatus'];
    const userRoleTemplate = {
      main: `<loader-container>
              <my-text slot="content" text="Comunicate this id to another player"></my-text>
              <my-text slot="content" text="peerId"></my-text>
            </loader-container>`,
      second: `<div>
                  <my-text text="Enter another player id"></my-text>
                  <input-and-button click="connectHandler" title="Connect"></input-and-button>
              </div>`,
    };

    this.stateContainer = this.templateParser(`
    <div>
          <div>
            <my-text text="Multiplayer game"></my-text>
          </div>
          ${userRoleTemplate[this.lastStateParams.userRole]}
          <my-text text="connectionStatus"></my-text>
          <my-list click="processUserSelect">
            <li slot="item"><my-button title="Cancel and return to Main Menu"></my-button></li>
          </my-list>
        <div>
      `);
  }

  get connectionStatus() {
    return this._cs;
  }

  set connectionStatus(status) {
    this._cs = status;
    this.subs['connectionStatus'].forEach((sub) => sub.notify(status));
  }

  connectHandler(event) {
    if (event.path[0].localName === 'button') {
      this.comm.connect(this.input);
    }
  }

  processUserSelect() {
    clearTimeout(this.stateChangeTimer);
    this.comm.cancelConnection();
    stateMachine.change('menu');
  }

  connectionCallBack() {
    if (this.comm.connection) {
      this.connectionStatus = 'connection established';
      this.stateChangeTimer = setTimeout(() => {
        this.connectionStatus = 'Staring the game...';
        this.stateChangeTimer = setTimeout(() => {
          stateMachine.change('game', {
            commObj: this.comm,
            ...this.lastStateParams,
          });
        }, 3000);
      }, 1000);
    } else {
      this.connectionStatus = `Something went wrong. Please restart`;
    }
  }
}
