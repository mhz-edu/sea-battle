class CommunicationScreenState {
  constructor(app) {
    this.app = app;
    this.mainElement = null;
    this.comm = new Communication(this.connectionCallBack.bind(this));
    this.lastStateParams = null;
  }

  async enter(params) {
    this.lastStateParams = params;
    const wrapper = document.createElement('div');
    const peerIdElement = document.createElement('div');
    const peerText = document.createElement('div');
    await this.comm.inititialize();
    if (this.lastStateParams.userRole === 'main') {
      peerIdElement.innerText = this.comm.peerId;
      peerText.innerText = 'Comunicate this id to another player';
      wrapper.appendChild(peerIdElement);
      wrapper.appendChild(peerText);
    } else {
      const inputId = document.createElement('input');
      const connBtn = document.createElement('button');
      connBtn.innerText = 'Connect';
      connBtn.addEventListener('click', () => {
        this.comm.connect(inputId.value);
      });
      wrapper.appendChild(inputId);
      wrapper.appendChild(connBtn);
    }
    this.mainElement = wrapper;
    this.app.appendChild(this.mainElement);
  }

  exit() {
    this.app.removeChild(this.mainElement);
  }

  display() {}

  connectionCallBack() {
    const connDiv = document.createElement('div');
    connDiv.innerText = 'connection established';
    this.mainElement.appendChild(connDiv);
    setTimeout(() => {
      const messageDiv = document.createElement('div');
      messageDiv.innerText = 'Staring the game...';
      this.mainElement.appendChild(messageDiv);
      setTimeout(() => {
        stateMachine.change('game', {
          commObj: this.comm,
          ...this.lastStateParams,
        });
      }, 3000);
    }, 1000);
  }
}
