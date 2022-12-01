class BaseElement extends HTMLElement {
  constructor(props) {
    super();
    if (!props) {
      // console.log(`${this.localName} constructor without props`);
      this.props = [...this.attributes].reduce((acc, curr) => {
        acc[curr.name] = curr.value;
        return acc;
      }, {});
    } else {
      // console.log(`${this.localName} constructor with props`);
      this.props = props;
      if (this.props.slot) {
        this.setAttribute('slot', this.props.slot);
      }
      this.parseDataValues();
      this.parseEventListeners();
    }
    this.template = document.createElement('template');
    this.needExternalStyles = false;
    this.init(this.props);
    this.createShadowRoot();
  }

  init() {}

  parseDataValues() {
    Object.keys(this.props).forEach((key) => {
      if (key.startsWith('data')) {
        this.setAttribute(key, this.props[key]);
      }
    });
  }

  parseEventListeners() {
    const events = ['click', 'dragstart', 'dragend'];
    events.forEach((eventType) => {
      if (this.props[eventType]) {
        this.addEventListener(
          eventType,
          this.props[eventType].bind(this.props.context)
        );
      }
    });
  }

  createShadowRoot() {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(this.template.content);
    if (this.needExternalStyles) {
      shadowRoot.appendChild(this.createBaseStyleElement());
    }
  }

  createBaseStyleElement() {
    const style = document.createElement('style');
    style.innerText = '@import "./main.css";';
    return style;
  }
}

customElements.define(
  'my-text',
  class extends BaseElement {
    init(props) {
      this.text = props.text;
      this.template.innerHTML = `
          <div>
              <div id="main">${this.text}</div>
          </div>
          `;
    }

    connectedCallback() {
      this.ref = this.shadowRoot.firstElementChild.querySelector('#main');
    }

    notify(val) {
      this.ref.innerText = val;
    }
  }
);

customElements.define(
  'my-button',
  class extends BaseElement {
    init(props) {
      this.needExternalStyles = true;
      this.title = props.title;
      this.template.innerHTML = `
          <div class="block">
              <button class="button ${
                props.color ? props.color : 'is-link'
              } is-fullwidth">${this.title}</button>
          </div>
          `;
    }
  }
);

customElements.define(
  'input-and-button',
  class extends BaseElement {
    init(props) {
      this.needExternalStyles = true;
      this.title = props.title;
      this.template.innerHTML = `
          <div>
            <div class="level">
                <input class="input level-item" id="main"></input>
                <button class="button is-link level-item">${this.title}</button>
            </div>
          </div>
            `;
    }

    connectedCallback() {
      this.ref = this.shadowRoot.firstElementChild.querySelector('#main');
      let timerId;
      this.ref.addEventListener('input', (event) => {
        if (timerId) {
          clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
          this.props.context.input = event.path[0].value;
        }, 500);
      });
    }
  }
);

customElements.define(
  'my-list',
  class extends BaseElement {
    init(props) {
      this.needExternalStyles = true;
      this.template.innerHTML = `<div>
          <ul><slot name="item"></slot></ul>
          </div>`;
    }
  }
);

customElements.define(
  'loader-container',
  class extends BaseElement {
    init(props) {
      this.template.innerHTML = `
            <div>
                <slot name="content"></slot>
            </div>`;

      this.loaderTemplate = document.createElement('template');
      this.loaderTemplate.innerHTML = `
                <div id="loader">
                    ${props.text || 'Loading...'}
                </div>
          `;
      this.appendChild(this.loaderTemplate.content);
      this.loaderRef = this.querySelector('#loader');
    }

    connectedCallback() {
      const slotContent = this.shadowRoot
        .querySelector('slot')
        .assignedElements();
      slotContent.forEach((element) => element.removeAttribute('slot'));
      this.updateElements(slotContent);
      this.insertLoader();
    }

    insertLoader() {
      this.loaderRef.setAttribute('slot', 'content');
    }

    removeLoader() {
      this.loaderRef.removeAttribute('slot');
    }

    updateElements(elements) {
      Promise.all(
        elements.map((element) => {
          return new Promise((resolve, reject) => {
            Promise.all(Object.values(element.props)).then((propsArr) => {
              resolve([element, propsArr]);
            });
          });
        })
      ).then((elementsAndProps) => {
        this.removeLoader();
        elementsAndProps.forEach(([element, resolvedPropsArr]) => {
          const newPropsObj = Object.keys(element.props).reduce(
            (acc, curr, index) => {
              acc[curr] = resolvedPropsArr[index];
              return acc;
            },
            {}
          );
          const elementConstructor = customElements.get(
            element.tagName.toLocaleLowerCase()
          );
          const newElement = new elementConstructor(newPropsObj);
          element.remove();
          newElement.setAttribute('slot', 'content');
          this.append(newElement);
        });
      });
    }
  }
);

customElements.define(
  'game-field',
  class extends BaseElement {
    init(props) {
      this.size = parseInt(props.size);
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
      for (let row of this.props.data.rows(this.props.type)) {
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
        rowIndex++;
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
);

customElements.define(
  'my-cell',
  class extends BaseElement {
    init(props) {
      this.template.innerHTML = `
      <style> 
        div {
          border: 1px solid;
          border-color: black;
          box-sizing: border-box;
          height: 100%;
        }
        ${
          props.hover === 'true'
            ? `div:hover {
                background-color: hsl(204, 86%, 53%);
              }`
            : ''
        }
        .miss {
          background-color: hsl(0, 0%, 71%);
        }
        .hit {
          background-color: hsl(348, 100%, 61%);
        }
        .ship {
          background-color: hsl(217, 71%, 53%);
        }
      </style>
      <div id="cell"></div>`;
    }

    connectedCallback() {
      this.ref = this.shadowRoot.querySelector('#cell');
    }
  }
);

customElements.define(
  'ship-element',
  class extends BaseElement {
    init(props) {
      this.shipSize = parseInt(props.shipsize);
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
            `repeat(${this.orientation === 'h' ? this.shipSize : 1}, 30px)`
          );
      }
    }
  }
);

customElements.define(
  'ship-storage',
  class extends BaseElement {
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
        for (let ship in this.cellRef) {
          this.cellRef[ship].notify(val);
        }
      } else {
        const [newQuantity, ship] = val;
        const oldQuantity = this.cellRef[ship].getAttribute('quantity');
        if (newQuantity == 0) {
          this.cellRef[ship].removeAttribute('slot');
          this.cellRef[ship].setAttribute('quantity', newQuantity);
        }
        if (oldQuantity == 0 && newQuantity > 0) {
          this.cellRef[ship].setAttribute('slot', 'item');
          this.cellRef[ship].setAttribute('quantity', newQuantity);
          this.cellRef[ship].notify(newQuantity);
        } else {
          this.cellRef[ship].notify(newQuantity);
        }
      }
    }
  }
);

customElements.define(
  'ship-storage-cell',
  class extends BaseElement {
    init(props) {
      this.needExternalStyles = true;
      this.shipSize = parseInt(props.shipsize);
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
);
