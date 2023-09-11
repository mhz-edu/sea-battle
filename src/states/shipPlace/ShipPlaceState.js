import BaseState from '../BaseState.js';
import ShipStorage from './ShipStorage.js';
import Model from '../game/Model.js';
import { STATE_MACHINE } from '../../index.js';
import { GAMEFIELD_SIZE } from '../../config.js';

export default class ShipPlaceState extends BaseState {
  init(params) {
    this.lastStateParams = params;
    this.playerModel = new Model(GAMEFIELD_SIZE);
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
        <div class="hero is-link">
          <div class="hero-body title">
            <my-text text="Place the ships"></my-text>
          </div>
        </div>
        <div class="container section">
          <div class="columns">
            <div class="column">
              <ship-storage data="shipStorage", dragstart="dragStartHandler" dragend="dragEndHandler" click="changeOrientationHandler"></ship-storage>
              <div>
                <my-list click="processUserSelect">
                  <li slot="item"><my-button title="Place ships randomly" data-value="random"></my-button></li>
                  <li slot="item"><my-button color="is-success" title="Placement complete" data-value="complete"></my-button></li>
                  <li slot="item"><my-button color="is-danger" title="Reset field" data-value="reset"></my-button></li>
                </my-list>
              </div>
            </div>
            <div class="column">
              <div class="panel">
                <div class="panel-heading">
                  <my-text text="Player field"></my-text>
                </div>
                <div class="panel-block">
                  <game-field size="10" cellContent="def" data="playerModel" type="own"></game-field>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);
  }

  processUserSelect(clickEvent) {
    if (clickEvent.composedPath()[0].localName === 'button') {
      const options = {
        reset: this.fieldResetHandler,
        complete: this.placementCompleteHandler,
        random: this.randomPlacementHandler,
      };
      const userSelect = clickEvent.target.dataset.value;
      options[userSelect].call(this);
    }
  }

  changeOrientationHandler(event) {
    if (event.composedPath()[0].localName === 'button') {
      this.shipStorage.toggleOrientation();
    }
  }

  placementCompleteHandler() {
    if (this.shipStorage.isStorageEmpty()) {
      if (this.lastStateParams.gameType === 'single') {
        STATE_MACHINE.change('game', {
          playerModel: this.playerModel,
          ...this.lastStateParams,
        });
      } else if (this.lastStateParams.gameType === 'multi') {
        STATE_MACHINE.change('comms', {
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

  createShipDragImage(shipSize, orientation) {
    const gameFieldGridGap = 5;
    const cellSize = document
      .querySelector('game-field')
      .querySelector('my-cell').clientWidth;
    const singleShipCell = document.createElement('canvas');
    const ctx = singleShipCell.getContext('2d');
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, cellSize, cellSize);

    const shipImage = document.createElement('canvas');
    shipImage.setAttribute('style', 'position: absolute; top: -100%;');
    const shipImageCtx = shipImage.getContext('2d');
    for (let num = 0; num < shipSize; num++) {
      if (orientation === 'h') {
        shipImageCtx.drawImage(
          singleShipCell,
          cellSize * num + gameFieldGridGap * num,
          0
        );
      } else {
        shipImageCtx.drawImage(
          singleShipCell,
          0,
          cellSize * num + gameFieldGridGap * num
        );
      }
    }
    document.body.appendChild(shipImage);
    return [shipImage, Math.floor(cellSize / 2), Math.floor(cellSize / 2)];
  }

  dragStartHandler(event) {
    this.shipInDrag = parseInt(event.target.dataset.value);
    event.dataTransfer.setDragImage(
      ...this.createShipDragImage(this.shipInDrag, this.shipStorage.orientation)
    );
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
      cell.classList.remove('cell-select');
      Object.entries(this.handlerRef).forEach(([eventType, handler]) => {
        cell.removeEventListener(eventType, handler);
      });
    });
    document.querySelector('canvas').remove();
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
