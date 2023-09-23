import BaseElement from './BaseElement.js';

export default class MyText extends BaseElement {
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
