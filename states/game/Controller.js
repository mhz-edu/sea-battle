class Controller {
  constructor(playerName, model, selectCell) {
    this.model = model;
    this.playerName = playerName;
    this.selectCell = selectCell;
  }

  shoot(x, y) {
    const event = new CustomEvent('shot', {
      detail: {
        playerName: this.playerName,
        coords: { x, y },
      },
    });
    document.dispatchEvent(event);
  }

  receiveShoot(x, y) {
    const result = this.model.checkCell(x, y);
    this.model.updateCell(x, y, result, 'own');
    const event = new CustomEvent('shotResult', {
      detail: {
        playerName: this.playerName,
        coords: { x, y },
        result,
        noShips: !this.model.checkField(),
      },
    });
    document.dispatchEvent(event);
  }

  processShotFeedback(x, y, result, noShips) {
    this.model.updateCell(x, y, result, 'enemy');
    const event = new CustomEvent('turnEnd', {
      detail: {
        playerName: this.playerName,
        noShips,
      },
    });
    document.dispatchEvent(event);
  }

  async turn() {
    const [x, y] = await this.selectCell();
    console.log('selected', x, y);
    this.shoot(x, y);
  }

  notify(incomingEvent) {
    if (
      incomingEvent.type === 'shot' &&
      incomingEvent.detail.playerName !== this.playerName
    ) {
      const {
        coords: { x, y },
      } = incomingEvent.detail;
      this.receiveShoot(x, y);
    } else if (
      incomingEvent.type === 'shotResult' &&
      incomingEvent.detail.playerName !== this.playerName
    ) {
      const {
        coords: { x, y },
        result,
        noShips,
      } = incomingEvent.detail;
      this.processShotFeedback(x, y, result, noShips);
    }
  }
}
