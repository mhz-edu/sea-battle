class networkPlayer {
  constructor(playerName, comm) {
    this.playerName = playerName;
    this.comm = comm;
  }

  turn() {}

  notify({ type, detail }) {
    if (type !== 'start' && detail.playerName !== this.playerName) {
      this.comm.send({ type, detail });
    }
  }
}
