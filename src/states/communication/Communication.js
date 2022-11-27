import Peer from 'peerjs';

export default class Communication {
  constructor(connectionCallback) {
    this.peer = null;
    this.connection = null;
    this.connectionCallback = connectionCallback;
  }

  async inititialize() {
    const peerId = new Promise((resolve) => {
      this.peer = new Peer(null, { debug: 2 });
      this.peer.on('open', (id) => {
        console.log('my id ', id);
        resolve(id);
      });
    });
    this.peer.on('connection', (newConnection) => {
      if (this.connection) {
        newConnection.on('open', () => {
          newConnection.send('Game is already in progress');
          newConnection.close();
        });
        return;
      }
      this.connection = newConnection;
      this.connection.on('data', this.dataHandler);
      this.connectionCallback();
    });
    this.peer.on('disconnected', () => {
      console.log('disconnected');
    });
    this.peer.on('close', () => {
      console.log('peer destoryed');
      this.connection = null;
    });
    this.peer.on('error', (err) => {
      console.log(err);
    });
    return peerId;
  }

  connect(id) {
    if (!this.connection) {
      console.log('connect handler');
      this.connection = this.peer.connect(id, { serialization: 'json' });
      this.connection.on('open', () => {
        console.log('connected');
        //Wait if connection going to be closed
        setTimeout(() => {
          this.connectionCallback();
        }, 500);
      });
      this.connection.on('data', this.dataHandler);
      this.connection.on('close', () => {
        this.connection = null;
        console.log('connection was closed');
      });
    }
  }

  cancelConnection() {
    if (this.connection) {
      this.connection.close();
    }
  }

  send(data) {
    if (this.connection) {
      this.connection.send(data);
    }
  }

  dataHandler(data) {
    console.log('Received data ', data);
    const { type, detail } = data;
    const event = new CustomEvent(type, { detail });
    document.dispatchEvent(event);
  }
}
