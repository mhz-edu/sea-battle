import BaseElement from './BaseElement.js';

export default class MyCell extends BaseElement {
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
