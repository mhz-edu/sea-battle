import BaseElement from './BaseElement.js';

export default class ShipStorageCell extends BaseElement {
  init(props) {
    this.needExternalStyles = true;
    this.shipSize = parseInt(props.shipsize, 10);
    this.orientation = props.orientation;
    this.quantity = props.quantity;
    this.template.innerHTML = `
        <div class="box">
          <div class="block">
            <slot name="ship"></slot>
          </div>
          <div class="block">
            <div class="tag is-link is-large">
              <my-text id="quantlable" text="x${this.quantity}"></my-text>
            </div>
          </div>
        </div>`;
    this.cellTemplate = document.createElement('template');
    this.cellTemplate.innerHTML = `<ship-element id="ship"></ship-element>`;
    this.cellRef = { ship: null, quantityLabel: null };
  }

  connectedCallback() {
    const cell = this.cellTemplate.content.firstChild.cloneNode(true);
    cell.setAttribute('shipsize', this.shipSize);
    cell.setAttribute('orientation', this.orientation);
    cell.setAttribute('slot', 'ship');
    this.cellRef.ship = cell;
    this.cellRef.quantityLabel = this.shadowRoot.querySelector('#quantlable');
    this.appendChild(cell);
  }

  notify(val) {
    if (val === 'h' || val === 'v') {
      this.cellRef.ship.notify(val);
    } else {
      this.cellRef.quantityLabel.notify(`x${val}`);
    }
  }
}
