import BaseElement from './BaseElement.js';

export default class ShipElement extends BaseElement {
  init(props) {
    this.shipSize = parseInt(props.shipsize, 10);
    this.orientation = props.orientation;
    this.template.innerHTML = `
        <style>
            .wrapper {
              display: flex;
              width: 120px;
              height: 120px;
              justify-content: center;
              align-items: center;
            }
            .cell {
              display: grid;
              grid-template-columns: repeat(${
                this.orientation === 'h' ? this.shipSize : 1
              }, 30px);
              grid-auto-rows: 30px;
              justify-content: center;
            }
            .cell:hover {
              background-color: hsl(204, 86%, 53%);
            }
        </style>
        <div class="wrapper">
          <div class="cell">
            <slot name="cell"></slot>
          </div>
        </div>
      `;
    this.cellTemplate = document.createElement('template');
    this.cellTemplate.innerHTML = `<my-cell cellContent="${this.cellcontent}"></my-cell>`;
    this.setAttribute('draggable', true);
    this.setAttribute('data-value', this.shipSize);
  }

  connectedCallback() {
    Array(this.shipSize)
      .fill(null)
      .forEach(() => {
        const cell = this.cellTemplate.content.firstChild.cloneNode(true);
        cell.setAttribute('slot', 'cell');
        cell.setAttribute('cellcontent', 'S');
        this.appendChild(cell);
      });
  }

  notify(val) {
    if (val === 'h' || val === 'v') {
      this.orientation = val;
      this.shadowRoot.styleSheets
        .item(0)
        .cssRules.item(1)
        .style.setProperty(
          'grid-template-columns',
          `repeat(${this.orientation === 'h' ? this.shipSize : 1}, 30px)`,
        );
    }
  }
}
