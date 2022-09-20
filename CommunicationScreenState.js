class CommunicationScreenState {
  constructor(app) {
    this.app = app;
    this.mainElement = null;
    this.comm = new Communication(this.connectionCallBack.bind(this));
    this.lastStateParams = null;
    this.stateChangeTimer = null;
  }

  async enter(params) {
    this.lastStateParams = params;
    const wrapper = document.createElement('div');
    const peerIdElement = document.createElement('div');
    const peerText = document.createElement('div');
    wrapper.appendChild(peerIdElement);
    wrapper.appendChild(peerText);
    try {
      await this.comm.inititialize();
      if (this.lastStateParams.userRole === 'main') {
        peerIdElement.innerText = this.comm.peerId;
        peerText.innerText = 'Comunicate this id to another player';
      } else {
        peerText.innerText = 'Enter another player id';
        const inputId = document.createElement('input');
        const connBtn = document.createElement('button');
        connBtn.innerText = 'Connect';
        connBtn.addEventListener('click', () => {
          this.comm.connect(inputId.value);
        });
        wrapper.appendChild(inputId);
        wrapper.appendChild(connBtn);
      }
    } catch (err) {
      peerText.innerText = `Something went wrong. Please restart
      ${err}`;
    }
    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = 'Cancel and return to Main Menu';
    cancelBtn.addEventListener('click', () => {
      clearTimeout(this.stateChangeTimer);
      this.comm.cancelConnection();
      stateMachine.change('menu');
    });
    wrapper.appendChild(cancelBtn);
    this.mainElement = wrapper;
    this.app.appendChild(this.mainElement);
  }

  exit() {
    this.app.removeChild(this.mainElement);
  }

  display() {}

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
