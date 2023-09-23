import BaseElement from './BaseElement.js';

export default class GameField extends BaseElement {
  init(props) {
    this.size = parseInt(props.size, 10);
    this.cellcontent = props.cellcontent;
    this.data = props.data;
    this.type = props.type;
    this.data.subscribe(this, this.type);
    this.template.innerHTML = `
          <style>
            div {
              display: grid;
              grid-template-columns: repeat(${this.size}, 1fr);
              grid-template-rows: repeat(${this.size}, 1fr);
              grid-gap: 5px;
              aspect-ratio: 1/1;
            }
            :host {
              width: 100%;
            }
          </style>
          <div>
            <slot name="cell"></slot>
          </div>
      `;

    this.cellTemplate = document.createElement('template');
    this.cellTemplate.innerHTML = `<my-cell cellContent="${this.cellcontent}"></my-cell>`;
    this.cellRef = {};
  }

  connectedCallback() {
    let rowIndex = 0;
    for (const row of this.props.data.rows(this.props.type)) {
      row.forEach((dataCell, colIndex) => {
        const cell = this.cellTemplate.content.firstChild.cloneNode(true);
        cell.setAttribute('data-value', `${colIndex}${rowIndex}`);
        cell.setAttribute('cellcontent', dataCell);
        cell.setAttribute('slot', 'cell');
        cell.setAttribute('hover', this.props.type === 'enemy');
        this.cellRef[`${colIndex}${rowIndex}`] = cell;
        this.appendChild(cell);
        if (dataCell === 'S') {
          cell.ref.classList.add('ship');
        }
      });
      rowIndex += 1;
    }
  }

  notify([val, x, y]) {
    if (val === 'H') {
      this.cellRef[`${x}${y}`].ref.classList.remove('ship');
      this.cellRef[`${x}${y}`].ref.classList.add('hit');
    } else if (val === 'M') {
      this.cellRef[`${x}${y}`].ref.classList.add('miss');
    } else if (val === 'S') {
      this.cellRef[`${x}${y}`].ref.classList.add('ship');
    } else if (val === 'E') {
      this.cellRef[`${x}${y}`].ref.classList.remove('ship');
    }
  }
}
