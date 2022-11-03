class CommunicationScreenState extends BaseState {
  init(params) {
    this.comm = new Communication(this.connectionCallBack.bind(this));
    this.stateChangeTimer = null;
    this.lastStateParams = params;
    try {
      this.comm.inititialize();
    } catch (err) {
      console.log(err);
    }

    if (this.lastStateParams.userRole === 'main') {
      this.stateContainer = this.templateParser(`
      <div>
          <div>
            <my-text text="Multiplayer game"></my-text>
          </div>
          <div>
          <my-text text="Comunicate this id to another player"></my-text>
            <my-text text="${this.comm.peerId}"></my-text>
          </div>
          <my-list click="processUserSelect">
            <li slot="item"><my-button title="Cancel and return to Main Menu"></my-button></li>
          </my-list>
        <div>
      `);
    } else {
      this.stateContainer = this.templateParser(`
      <div>
          <div>
            <my-text text="Multiplayer game"></my-text>
          </div>
          <div>
            <my-text text="Enter another player id"></my-text>
            <input></input>
            <my-button title="Connect" click="connectHandler"></my-button>
          </div>
          <my-list click="processUserSelect">
            <li slot="item"><my-button title="Cancel and return to Main Menu"></my-button></li>
          </my-list>
        <div>
      `);
    }
  }

  connectHandler() {
    this.comm.connect(inputId.value);
  }

  processUserSelect() {
    clearTimeout(this.stateChangeTimer);
    this.comm.cancelConnection();
    stateMachine.change('menu');
  }

  connectionCallBack() {
    const connDiv = document.createElement('div');
    const messageDiv = document.createElement('div');
    this.mainElement.appendChild(connDiv);
    this.mainElement.appendChild(messageDiv);
    if (this.comm.connection) {
      connDiv.innerText = 'connection established';
      this.stateChangeTimer = setTimeout(() => {
        messageDiv.innerText = 'Staring the game...';
        this.stateChangeTimer = setTimeout(() => {
          stateMachine.change('game', {
            commObj: this.comm,
            ...this.lastStateParams,
          });
        }, 3000);
      }, 1000);
    } else {
      messageDiv.innerText = `Something went wrong. Please restart`;
    }
  }
}
