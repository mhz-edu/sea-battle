class GameLogic {
  constructor(firstPlayer, secondPlayer) {
    this.firstPlayer = firstPlayer;
    this.secondPlayer = secondPlayer;
    this.lastTurn = false;
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
        loser = this.firstPlayer.playerName;
        this.secondPlayer.turn();
      } else {
        loser = this.secondPlayer.playerName;
        this.firstPlayer.turn();
      }
    } else if (event.type === 'noShips' && this.lastTurn) {
      loser = 'tie';
    } else if (event.type === 'turnEnd' && this.lastTurn) {
      document.dispatchEvent(new Event('gameover'));
    }
  }
}
