class ShipPlaceState extends BaseState {
  init(params) {
    this.lastStateParams = params;
    this.playerModel = new Model();
    this.initialShips = { 1: 4, 2: 3, 3: 2, 4: 1 };
    this.shipStorage = new ShipStorage(this.initialShips);

    this.handlerRef = {
      dragenter: this.dragEnterHandler(),
      dragover: this.dragOverHandler(),
      dragleave: this.dragLeaveHadler(),
      drop: this.dropHandler.bind(this),
    };
    this.stateContainer = this.templateParser(`
      <div>
        <my-text text="Player field"></my-text>
        <game-field size="10" cellContent="def" data="playerModel" type="own"></game-field>
        <my-list click="processUserSelect">
          <li slot="item"><my-button title="Place ships randomly" data-value="random"></my-button></li>
          <li slot="item"><my-button title="Reset field" data-value="reset"></my-button></li>
          <li slot="item"><my-button title="Placement complete" data-value="complete"></my-button></li>
        </my-list>
        <my-text text="Drag and drop ships to the game field"></my-text>
        <ship-storage data="shipStorage", dragstart="dragStartHandler" dragend="dragEndHandler" click="changeOrientationHandler"></ship-storage>
        
      </div>
    `);
  }

  processUserSelect(clickEvent) {
    const options = {
      reset: this.fieldResetHandler,
      complete: this.placementCompleteHandler,
      random: this.randomPlacementHandler,
    };
    const userSelect = clickEvent.target.dataset.value;
    options[userSelect].call(this);
  }

  changeOrientationHandler(event) {
    if (event.path[0].localName === 'button') {
      this.shipStorage.toggleOrientation();
    }
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
    this.playerModel.resetField();
    this.shipStorage.resetStorage();
  }

  randomPlacementHandler() {
    this.playerModel.randomShipsFill(this.initialShips);
    this.shipStorage.clearStorage();
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
      Object.entries(this.handlerRef).forEach(([eventType, handler]) => {
        cell.removeEventListener(eventType, handler);
      });
    });
    this.paintCells(cells, mask);
  }

  dragEndHandler(event) {
    const cells = document.querySelectorAll('game-field my-cell');
    cells.forEach((cell) => {
      cell.classList.remove('placement-allowed');
      cell.classList.remove('placement-forbidden');
      Object.entries(this.handlerRef).forEach(([eventType, handler]) => {
        cell.removeEventListener(eventType, handler);
      });
    });
  }

  dropHandler(event) {
    console.log(this.shipInDrag);
    event.preventDefault();
    const [x, y] = event.target.dataset.value.split('').map((n) => parseInt(n));
    this.playerModel.placeShip(
      x,
      y,
      this.shipInDrag,
      this.shipStorage.orientation
    );
    this.shipStorage.decrementShipQuantity(this.shipInDrag);
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
      const tableElement = element.parentElement;
      let siblings = [element];
      for (let i = 1; i <= n; i++) {
        const nextSiblingV = tableElement.querySelector(
          `my-cell[data-value="${x}${y + i}"]`
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
    cells.forEach((cell, index) => {
      if (flattenMask[index]) {
        cell.classList.add('placement-allowed');
        Object.entries(this.handlerRef).forEach(([eventType, handler]) => {
          cell.addEventListener(eventType, handler);
        });
      } else {
        cell.classList.add('placement-forbidden');
      }
    });
  }
}
