class ShipPlaceState {
  constructor(app) {
    this.app = app;
    this.mainElement = document.createElement('div');
    this.playerModel = new Model();
    this.view = new View(this.playerModel, this.mainElement);
    this.initialShips = { 1: 4, 2: 3, 3: 2, 4: 1 };
    this.shipStorage = null;
    this.shipInDrag = null;
    this.lastStateParams = null;
    this.dropHandlerRef = null;
  }

  enter(params) {
    this.lastStateParams = params;
    this.shipStorage = new ShipStorage(
      Object.assign({}, this.initialShips),
      this.dragStartHandler.bind(this),
      this.dragEndHandler.bind(this)
    );

    this.mainElement.innerHTML = `
    <div>Player field</div>
    <div id="player1-container"></div>`;
    this.app.appendChild(this.mainElement);
    this.view.displayOwnField();
    const resetBtn = document.createElement('button');
    resetBtn.innerText = 'Reset Field';
    resetBtn.addEventListener('click', this.fieldResetHandler.bind(this));
    this.mainElement.appendChild(resetBtn);
    const completeBtn = document.createElement('button');
    completeBtn.innerText = 'Placement complete';
    completeBtn.addEventListener(
      'click',
      this.placementCompleteHandler.bind(this)
    );
    this.mainElement.appendChild(completeBtn);
    this.shipStorage.display(this.mainElement);
  }

  exit() {
    this.app.removeChild(this.mainElement);
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
    this.view.updateOwnField();
    this.shipStorage.ships = Object.assign({}, this.initialShips);
    this.shipStorage.orientation = 'h';
    this.shipStorage.rootElement.querySelector('#ship-storage').remove();
    this.shipStorage.display(this.mainElement);
  }

  dragStartHandler(event) {
    console.log(event);
    this.shipInDrag = parseInt(event.target.dataset.value);
    event.dataTransfer.setDragImage(event.target, 13, 13);
    const mask = this.playerModel.getMask(
      this.shipInDrag,
      this.shipStorage.orientation
    );
    const cells = document.querySelectorAll('#player1-container td');
    cells.forEach((cell) => {
      cell.removeEventListener('drop', this.dropHandlerRef);
    });
    this.paintCells(cells, mask);
  }

  dragEndHandler(event) {
    const cells = document.querySelectorAll('#player1-container td');
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
    this.view.updateOwnField();
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
