class ShipStorage {
  constructor(ships, dragStartHandler, dragEndHandler) {
    this.ships = ships;
    this.orientation = 'h';
    this.rootElement = null;
    this.innerDataStructure = {};
    this.dragStartHandler = dragStartHandler;
    this.dragEndHandler = dragEndHandler;
  }

  isStorageEmpty() {
    return Object.values(this.ships).every((val) => val === 0);
  }

  decrementShipQuantity(size) {
    this.ships[size] = this.ships[size] - 1;
  }

  changeOrientationHandler(event) {
    if (this.orientation === 'h') {
      this.orientation = 'v';
      for (let ship in this.innerDataStructure) {
        this.innerDataStructure[ship].storageCell
          .querySelectorAll('div')
          .forEach((div) => div.classList.remove('horizontal'));
      }
    } else {
      this.orientation = 'h';
      for (let ship in this.innerDataStructure) {
        this.innerDataStructure[ship].storageCell
          .querySelectorAll('div')
          .forEach((div) => div.classList.add('horizontal'));
      }
    }
  }

  display(element) {
    this.rootElement = element;
    const wrapper = document.createElement('div');
    wrapper.innerText = 'Drag and drop ships onto available cells';
    wrapper.setAttribute('id', 'ship-storage');
    for (let ship in this.ships) {
      const storageCell = document.createElement('div');
      this.innerDataStructure[ship] = { storageCell };
      const shipWrapper = document.createElement('div');
      shipWrapper.classList.add('horizontal');
      shipWrapper.setAttribute('draggable', 'true');
      shipWrapper.setAttribute('data-value', ship);
      shipWrapper.addEventListener('dragstart', this.dragStartHandler);
      shipWrapper.addEventListener('dragend', this.dragEndHandler);
      for (let i = 1; i <= ship; i++) {
        const shipCell = document.createElement('div');
        shipCell.innerText = 'S';
        shipCell.classList.add('ship-cell');
        shipCell.classList.add('horizontal');
        shipWrapper.appendChild(shipCell);
      }
      storageCell.appendChild(shipWrapper);
      const counter = document.createElement('div');
      counter.innerText = `x${this.ships[ship]}`;
      this.innerDataStructure[ship].counter = counter;
      storageCell.appendChild(counter);
      wrapper.appendChild(storageCell);
    }
    const orientationBtn = document.createElement('button');
    orientationBtn.innerText = 'Change orientation';
    orientationBtn.addEventListener(
      'click',
      this.changeOrientationHandler.bind(this)
    );

    wrapper.appendChild(orientationBtn);
    this.rootElement.appendChild(wrapper);
  }

  updateDisplay() {
    if (this.rootElement) {
      for (let ship in this.innerDataStructure) {
        if (this.ships[ship] === 0) {
          this.innerDataStructure[ship].storageCell.remove();
        } else {
          this.innerDataStructure[
            ship
          ].counter.innerText = `x${this.ships[ship]}`;
        }
      }
    }
  }
}
