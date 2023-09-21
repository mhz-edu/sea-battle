import BaseElement from './BaseElement.js';

export default class MyButton extends BaseElement {
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
