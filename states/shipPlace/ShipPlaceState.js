class ShipPlaceState {
  constructor(app) {
    this.app = app;
    this.mainElement = document.createElement('div');
    this.playerModel = new Model();
    this.view = new View(this.playerModel, this.mainElement);
    this.initialShips = { 1: 2, 2: 1 };
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
    const mask = this.getAvailableCells(
      this.shipInDrag,
      this.shipStorage.orientation,
      this.playerModel.ownField
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
    if (this.shipStorage.orientation === 'h') {
      for (let i = 0; i < this.shipInDrag; i++) {
        this.playerModel.updateCell(x + i, y, 'S', 'own');
      }
    } else {
      for (let i = 0; i < this.shipInDrag; i++) {
        this.playerModel.updateCell(x, y + i, 'S', 'own');
      }
    }
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

  getAvailableCells(shipSize, orientation, field) {
    const markAroundShipCell = (x, y, mask) => {
      const coordsMatrix = [
        [-1, -1],
        [0, -1],
        [1, -1],
        [-1, 0],
        [0, 0],
        [1, 0],
        [-1, 1],
        [0, 1],
        [1, 1],
      ];
      coordsMatrix.forEach(([dx, dy]) => {
        const getX = x + dx;
        const getY = y + dy;
        if (getX >= 0 && getX < size && getY >= 0 && getY < size) {
          mask[x + dx][y + dy] = false;
        }
      });
    };

    const getEmptyCellsInRow = (rowArray) => {
      const lengthsArray = rowArray
        .map((i) => (i ? 1 : 0))
        .join('')
        .split('0')
        .map((s) => s.length);
      const emptyCellsMap = [];
      let start = 0;
      let end = 0;
      lengthsArray.forEach((part) => {
        if (part === 0) {
          start = start + 1;
          end = end + 1;
        } else {
          emptyCellsMap.push({
            start: start,
            end: start + part - 1,
            length: part,
          });
          start = part;
          end = part;
        }
      });
      return emptyCellsMap;
    };

    const mask = Array(size)
      .fill(null)
      .map(() => Array(size).fill(true));

    // First pass to mark area around the ships
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (field[row][col] === 'S') {
          markAroundShipCell(row, col, mask);
        }
      }
    }
    // Second pass to mark available space in rows or columns
    if (orientation === 'h') {
      mask.forEach((row, rowIndex) => {
        const emptyCellsMap = getEmptyCellsInRow(row);
        emptyCellsMap.forEach(({ start, end, length }) => {
          if (length < shipSize) {
            for (let i = start; i <= end; i++) {
              mask[rowIndex][i] = false;
            }
          }
        });
      });
    } else if (orientation === 'v') {
      for (let colIndex = 0; colIndex < size; colIndex++) {
        const col = [];
        for (let rowIndex = 0; rowIndex < size; rowIndex++) {
          col.push(mask[rowIndex][colIndex]);
        }
        const emptyCellsMap = getEmptyCellsInRow(col);
        emptyCellsMap.forEach(({ start, end, length }) => {
          if (length < shipSize) {
            for (let i = start; i <= end; i++) {
              mask[i][colIndex] = false;
            }
          }
        });
      }
    }

    return mask;
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
