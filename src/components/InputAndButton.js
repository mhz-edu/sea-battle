import BaseElement from './BaseElement.js';

export default class InputAndButton extends BaseElement {
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
    this.ref.addEventListener('input', () => {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        this.props.context.input = this.ref.value;
      }, 500);
    });
  }
}
