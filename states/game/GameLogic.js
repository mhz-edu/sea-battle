class GameLogic {
  constructor(firstPlayer, secondPlayer) {
    this.firstPlayer = firstPlayer;
    this.secondPlayer = secondPlayer;
    this.lastTurn = false;
    this.outcome = null;
    this.firstPlayerNoShips = false;
    this.secondPlayerNoShips = false;
  }

  isRegularTurn(event) {
    return event.type === 'turnEnd' && !event.detail.noShips && !this.lastTurn;
  }

  isLastTurnByFirstPlayer(event) {
    return (
      event.type === 'turnEnd' &&
      event.detail.noShips &&
      !this.lastTurn &&
      event.detail.playerName === this.firstPlayer.playerName
    );
  }

  isLastTurnBySecondPlayer(event) {
    return (
      event.type === 'turnEnd' &&
      (this.lastTurn || event.detail.noShips) &&
      event.detail.playerName === this.secondPlayer.playerName
    );
  }

  notify(event) {
    if (event.type === 'start') {
      this.firstPlayer.turn();
    } else if (this.isRegularTurn(event)) {
      if (event.detail.playerName === this.firstPlayer.playerName) {
        this.secondPlayer.turn();
      } else {
        this.firstPlayer.turn();
      }
    } else if (this.isLastTurnByFirstPlayer(event)) {
      this.lastTurn = true;
      this.secondPlayerNoShips = event.detail.noShips;
      this.outcome = this.secondPlayer.playerName;
      this.secondPlayer.turn();
    } else if (this.isLastTurnBySecondPlayer(event)) {
      this.firstPlayerNoShips = event.detail.noShips;
      if (this.firstPlayerNoShips && this.secondPlayerNoShips) {
        this.outcome = 'tie';
      }
      if (this.firstPlayerNoShips && !this.secondPlayerNoShips) {
        this.outcome = this.firstPlayer.playerName;
      }
      document.dispatchEvent(
        new CustomEvent('gameover', { detail: { outcome: this.outcome } })
      );
    }
  }
}
