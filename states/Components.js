class BaseElement extends HTMLElement {
  constructor(props) {
    super();
    if (!props) {
      console.log(`${this.localName} constructor without props`);
      console.log(this.attributes);
      this.props = [...this.attributes].reduce((acc, curr) => {
        acc[curr.name] = curr.value;
        return acc;
      }, {});
    } else {
      console.log(`${this.localName} constructor with props`);
      this.props = props;
      if (this.props.slot) {
        this.setAttribute('slot', this.props.slot);
      }
      this.parseDataValues();
      this.parseEventListeners();
    }
    this.template = document.createElement('template');
    this.init(props);
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
    const events = ['click'];
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
  'input-and-button',
  class extends BaseElement {
    init(props) {
      this.title = props.title;
      this.template.innerHTML = `
            <div>
                <input id="main"></input>
                <button>${this.title}</button>
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
