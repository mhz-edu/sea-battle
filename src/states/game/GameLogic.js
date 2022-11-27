export default class GameLogic {
  constructor(firstPlayer, secondPlayer, statusMessageRef) {
    this.firstPlayer = firstPlayer;
    this.secondPlayer = secondPlayer;
    this.lastTurn = false;
    this.outcome = null;
    this.firstPlayerNoShips = false;
    this.secondPlayerNoShips = false;
    this.statusMessageRef = statusMessageRef;
  }

  updatedStatusMessage(message) {
    this.statusMessageRef.context[this.statusMessageRef.ref] = message;
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
      console.log(this.statusMessageRef);
      this.updatedStatusMessage(`${this.firstPlayer.playerName} turn...`);
      this.firstPlayer.turn();
    } else if (this.isRegularTurn(event)) {
      if (event.detail.playerName === this.firstPlayer.playerName) {
        this.updatedStatusMessage(`${this.secondPlayer.playerName} turn...`);
        this.secondPlayer.turn();
      } else {
        this.updatedStatusMessage(`${this.firstPlayer.playerName} turn...`);
        this.firstPlayer.turn();
      }
    } else if (this.isLastTurnByFirstPlayer(event)) {
      this.lastTurn = true;
      this.secondPlayerNoShips = event.detail.noShips;
      this.outcome = this.secondPlayer.playerName;
      this.updatedStatusMessage(`${this.secondPlayer.playerName} last turn...`);
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
