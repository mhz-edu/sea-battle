export default class BaseElement extends HTMLElement {
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

  // init() {}

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
          this.props[eventType].bind(this.props.context),
        );
      }
    });
  }

  createShadowRoot() {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(this.template.content);
    if (this.needExternalStyles) {
      shadowRoot.appendChild(BaseElement.createBaseStyleElement());
    }
  }

  static createBaseStyleElement() {
    const style = document.createElement('style');
    style.innerText = '@import "./main.css";';
    return style;
  }
}
