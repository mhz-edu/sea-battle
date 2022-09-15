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
      },
    });
    document.dispatchEvent(event);

    if (!this.model.checkField()) {
      const event = new CustomEvent('noShips', {
        detail: {
          playerName: this.playerName,
        },
      });
      document.dispatchEvent(event);
    }
  }

  processShotFeedback(x, y, result) {
    this.model.updateCell(x, y, result, 'enemy');
    const event = new CustomEvent('turnEnd', {
      detail: {
        playerName: this.playerName,
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
      const { playerName, coords } = incomingEvent.detail;
      const { x, y } = coords;
      this.receiveShoot(x, y);
    } else if (
      incomingEvent.type === 'shotResult' &&
      incomingEvent.detail.playerName !== this.playerName
    ) {
      const { playerName, coords, result } = incomingEvent.detail;
      const { x, y } = coords;
      this.processShotFeedback(x, y, result);
    }
  }
}
