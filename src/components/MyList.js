import BaseElement from './BaseElement.js';

export default class MyList extends BaseElement {
  init() {
    this.needExternalStyles = true;
    this.template.innerHTML = `<div>
            <ul><slot name="item"></slot></ul>
            </div>`;
  }
}
