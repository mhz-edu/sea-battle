export default class NetworkPlayer {
  constructor(playerName, comm) {
    this.playerName = playerName;
    this.comm = comm;
  }

  // eslint-disable-next-line class-methods-use-this
  turn() {}

  notify({ type, detail }) {
    if (type !== 'start' && detail.playerName !== this.playerName) {
      this.comm.send({ type, detail });
    }
  }
}
