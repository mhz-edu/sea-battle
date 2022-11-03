class BaseElement extends HTMLElement {
  constructor(props) {
    super();
    if (!props) {
      console.log('Element constructor without props');
      console.log(this.attributes);
      this.props = [...this.attributes].reduce((acc, curr) => {
        acc[curr.name] = curr.value;
        return acc;
      }, {});
    } else {
      console.log('Element constructor with props');
      this.props = props;
      if (this.props.slot) {
        this.setAttribute('slot', this.props.slot);
      }
      this.parseDataValues();
      this.parseEventListeners();
    }
    this.template = document.createElement('template');
  }

  parseDataValues() {
    Object.keys(this.props).forEach((key) => {
      if (key.startsWith('data')) {
        this.setAttribute(key, this.props[key]);
      }
    });
  }

  parseEventListeners() {
    const events = ['click'];
    events.forEach((eventType) => {
      if (this.props[eventType]) {
        this.addEventListener(
          eventType,
          this.props.context[this.props[eventType]]
        );
      }
    });
  }

  render() {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(this.template.content);
  }

  connectedCallback() {
    this.render();
  }
}

customElements.define(
  'my-text',
  class extends BaseElement {
    constructor(props) {
      super(props);
      this.text = props.text;
      this.template.innerHTML = `
          <div>
              <div>${this.text}</div>
          </div>
          `;
    }
  }
);

customElements.define(
  'my-button',
  class extends BaseElement {
    constructor(props) {
      super(props);
      this.title = props.title;
      this.template.innerHTML = `
          <div>
              <button>${this.title}</button>
          </div>
          `;
    }
  }
);

customElements.define(
  'my-list',
  class extends BaseElement {
    constructor(props) {
      super(props);
      this.template.innerHTML = `<div>
          <ul><slot name="item"></slot></ul>
          </div>`;
    }
  }
);
