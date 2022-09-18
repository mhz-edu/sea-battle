class Communication {
  constructor(connectionCallback) {
    this.peer = new Peer(null, { debug: 3 });
    this.connection = null;
    this.peerId = null;
    this.connectionCallback = connectionCallback;
  }

  async inititialize() {
    const open = new Promise((resolve, reject) => {
      this.peer.on('open', (id) => {
        console.log('my id ', id);
        resolve(id);
      });
    });
    this.peerId = await open;
    this.peer.on('connection', (c) => {
      this.connection = c;
      this.connection.on('data', this.dataHandler);
      this.connectionCallback();
    });
    this.peer.on('disconnected', () => {
      console.log('disconnected');
    });
    this.peer.on('close', () => {
      console.log('connection closed');
      this.connection = null;
    });
    this.peer.on('error', (err) => {
      console.log(err);
    });
  }

  connect(id) {
    this.connection = this.peer.connect(id, { serialization: 'json' });
    this.connection.on('open', this.connectionCallback);
    this.connection.on('data', this.dataHandler);
  }

  send(data) {
    this.connection.send(data);
  }

  dataHandler(data) {
    console.log('Received data ', data);
    const { type, detail } = data;
    const event = new CustomEvent(type, { detail });
    document.dispatchEvent(event);
  }
}
