class ShipPlaceState extends BaseState {
  init(params) {
    this.lastStateParams = params;
    this.playerModel = new Model();
    this.initialShips = { 1: 4, 2: 3, 3: 2, 4: 1 };
    this.dropHandlerRef = null;
    this.stateContainer = this.templateParser(`
      <div>
        <my-text text="Player field"></my-text>
        <game-field size="10" cellContent="def" data="playerModel" type="own"></game-field>
        <my-list click="processUserSelect">
          <li slot="item"><my-button title="Reset field" data-value="reset"></my-button></li>
          <li slot="item"><my-button title="Placement complete" data-value="complete"></my-button></li>
        </my-list>
      </div>
    `);

    this.shipStorage = new ShipStorage(
      Object.assign({}, this.initialShips),
      this.dragStartHandler.bind(this),
      this.dragEndHandler.bind(this)
    );

    this.shipStorage.display(this.stateContainer);
  }

  processUserSelect(clickEvent) {
    const options = {
      reset: this.fieldResetHandler,
      complete: this.placementCompleteHandler,
    };
    const userSelect = clickEvent.target.dataset.value;
    options[userSelect].call(this);
  }

  placementCompleteHandler() {
    if (this.shipStorage.isStorageEmpty()) {
      if (this.lastStateParams.gameType === 'single') {
        stateMachine.change('game', {
          playerModel: this.playerModel,
          ...this.lastStateParams,
        });
      } else if (this.lastStateParams.gameType === 'multi') {
        stateMachine.change('comms', {
          playerModel: this.playerModel,
          ...this.lastStateParams,
        });
      }
    } else {
      alert('Some ships are still need to be placed');
    }
  }

  fieldResetHandler() {
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        this.playerModel.updateCell(x, y, 'E', 'own');
      }
    }
    this.shipStorage.ships = Object.assign({}, this.initialShips);
    this.shipStorage.orientation = 'h';
    this.shipStorage.rootElement.querySelector('#ship-storage').remove();
    this.shipStorage.display(this.stateContainer);
  }

  dragStartHandler(event) {
    console.log(event);
    this.shipInDrag = parseInt(event.target.dataset.value);
    event.dataTransfer.setDragImage(event.target, 13, 13);
    const mask = this.playerModel.getMask(
      this.shipInDrag,
      this.shipStorage.orientation
    );
    const cells = document.querySelectorAll('game-field my-cell');
    cells.forEach((cell) => {
      cell.removeEventListener('drop', this.dropHandlerRef);
    });
    this.paintCells(cells, mask);
  }

  dragEndHandler(event) {
    const cells = document.querySelectorAll('game-field my-cell');
    cells.forEach((cell) => {
      cell.classList.remove('placement-allowed');
      cell.classList.remove('placement-forbidden');
    });
  }

  dropHandler(event) {
    event.preventDefault();
    const [x, y] = event.target.dataset.value.split('').map((n) => parseInt(n));
    this.playerModel.placeShip(
      x,
      y,
      this.shipInDrag,
      this.shipStorage.orientation
    );
    this.shipStorage.decrementShipQuantity(this.shipInDrag);
    this.shipStorage.updateDisplay();
  }

  getNextSiblingsH(element, n) {
    if (n === 0) {
      return [element];
    } else {
      if (element.nextSibling) {
        return [element, ...this.getNextSiblingsH(element.nextSibling, n - 1)];
      } else {
        throw new Error('Not enought siblings');
      }
    }
  }

  //Implementation for table
  getNextSiblingsV(element, n) {
    if (n === 0) {
      return [element];
    } else {
      const [x, y] = element.dataset.value.split('').map((n) => parseInt(n));
      const tableElement = element.parentElement.parentElement;
      let siblings = [element];
      for (let i = 1; i <= n; i++) {
        const nextSiblingV = tableElement.querySelector(
          `td[data-value="${x}${y + i}"]`
        );
        if (nextSiblingV) {
          siblings.push(nextSiblingV);
        } else {
          throw new Error('Not enought siblings');
        }
      }
      return siblings;
    }
  }

  dragProcessHandler(cellCallback) {
    return (event) => {
      let cells = [];
      try {
        if (this.shipStorage.orientation === 'h') {
          cells = this.getNextSiblingsH(event.target, this.shipInDrag - 1);
        } else {
          cells = this.getNextSiblingsV(event.target, this.shipInDrag - 1);
        }
        event.preventDefault();
        if (cellCallback) {
          cells.forEach((cell) => {
            cellCallback(cell);
          });
        }
      } catch {}
    };
  }

  dragEnterHandler() {
    return this.dragProcessHandler((cell) => cell.classList.add('cell-select'));
  }

  dragLeaveHadler() {
    return this.dragProcessHandler((cell) =>
      cell.classList.remove('cell-select')
    );
  }

  dragOverHandler() {
    return this.dragProcessHandler();
  }

  paintCells(cells, mask) {
    const flattenMask = mask.flat();
    this.dropHandlerRef = this.dropHandler.bind(this);
    cells.forEach((cell, index) => {
      if (flattenMask[index]) {
        cell.classList.add('placement-allowed');
        cell.addEventListener('dragenter', this.dragEnterHandler());
        cell.addEventListener('dragleave', this.dragLeaveHadler());
        cell.addEventListener('dragover', this.dragOverHandler());
        cell.addEventListener('drop', this.dropHandlerRef);
      } else {
        cell.classList.add('placement-forbidden');
      }
    });
  }
}
