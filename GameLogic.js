class GameLogic {
  constructor(firstPlayer, secondPlayer) {
    this.firstPlayer = firstPlayer;
    this.secondPlayer = secondPlayer;
    this.lastTurn = false;
    this.outcome = null;
  }

  notify(event) {
    if (event.type === 'start') {
      this.firstPlayer.turn();
    } else if (event.type === 'turnEnd' && !this.lastTurn) {
      if (event.detail.playerName === this.firstPlayer.playerName) {
        this.secondPlayer.turn();
      } else {
        this.firstPlayer.turn();
      }
    } else if (event.type === 'noShips' && !this.lastTurn) {
      this.lastTurn = true;
      if (event.detail.playerName === this.firstPlayer.playerName) {
        this.outcome = this.firstPlayer.playerName;
        this.secondPlayer.turn();
      } else {
        this.outcome = this.secondPlayer.playerName;
        this.firstPlayer.turn();
      }
    } else if (event.type === 'noShips' && this.lastTurn) {
      this.outcome = 'tie';
    } else if (event.type === 'turnEnd' && this.lastTurn) {
      document.dispatchEvent(
        new CustomEvent('gameover', { detail: { outcome: this.outcome } })
      );
    }
  }
}
