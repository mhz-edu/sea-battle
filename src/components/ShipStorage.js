import BaseElement from './BaseElement.js';

export default class ShipStorage extends BaseElement {
  init(props) {
    this.needExternalStyles = true;
    this.data = props.data;
    this.data.subscribe(this, 'ships');
    this.data.subscribe(this, 'orientation');
    this.template.innerHTML = `
        <style>
          .my-tile {
            display: flex;
            flex-flow: row nowrap;
            gap: 5px 5px;
          }
        </style>
        <div class="panel">
          <div class="panel-heading">
            <my-text text="Drag and drop ships to the game field"></my-text>
          </div>
          <div class="panel-block">
            <div> 
              <div class="my-tile">
                <slot name="item"></slot>
              </div>
            </div>
          </div>
          <div class="panel-block">
            <button class="button is-link">Change orientation</button>
          </div>
        </div>`;
    this.cellTemplate = document.createElement('template');
    this.cellTemplate.innerHTML = `<ship-storage-cell></ship-storage-cell>`;
    this.cellRef = {};
  }

  connectedCallback() {
    [...this.data.ships].forEach((quantity, shipSize) => {
      if (quantity > 0) {
        const cell = this.cellTemplate.content.firstChild.cloneNode(true);
        cell.setAttribute('shipsize', shipSize);
        cell.setAttribute('orientation', 'h');
        cell.setAttribute('quantity', quantity);
        cell.setAttribute('slot', 'item');
        this.cellRef[shipSize] = cell;
        this.appendChild(cell);
      }
    });
  }

  notify(val) {
    if (val === 'h' || val === 'v') {
      for (const ship in this.cellRef) {
        if (this.cellRef[ship]) {
          this.cellRef[ship].notify(val);
        }
      }
    } else {
      const [newQuantity, ship] = val;
      const oldQuantity = parseInt(
        this.cellRef[ship].getAttribute('quantity'),
        10,
      );
      if (newQuantity === 0) {
        this.cellRef[ship].removeAttribute('slot');
        this.cellRef[ship].setAttribute('quantity', newQuantity);
      }
      if (oldQuantity === 0 && newQuantity > 0) {
        this.cellRef[ship].setAttribute('slot', 'item');
        this.cellRef[ship].setAttribute('quantity', newQuantity);
        this.cellRef[ship].notify(newQuantity);
      } else {
        this.cellRef[ship].notify(newQuantity);
      }
    }
  }
}
