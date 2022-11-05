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

customElements.define(
  'loader-container',
  class extends BaseElement {
    constructor(props) {
      super(props);
      this.template.innerHTML = `
            <div>
                <slot name="content"></slot>
            </div>`;

      this.loaderTemplate = document.createElement('template');
      this.loaderTemplate.innerHTML = `
        <div>
            ${props.text || 'Loading...'}
        </div>`;
      this.loaderRef = this.loaderTemplate.content.firstElementChild;
    }

    connectedCallback() {
      super.connectedCallback();
      const slotContent = this.shadowRoot
        .querySelector('slot')
        .assignedElements();
      slotContent.forEach((element) => element.removeAttribute('slot'));
      this.insertLoader();
      this.updateElements(slotContent);
    }

    insertLoader() {
      this.loaderRef.setAttribute('slot', 'content');
      this.appendChild(this.loaderTemplate.content);
    }

    removeLoader() {
      this.loaderRef.removeAttribute('slot');
      this.loaderRef.remove();
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
          element.remove();
          const elementConstructor = customElements.get(
            element.tagName.toLocaleLowerCase()
          );
          this.appendChild(new elementConstructor(newPropsObj)).setAttribute(
            'slot',
            'content'
          );
        });
      });
    }
  }
);
