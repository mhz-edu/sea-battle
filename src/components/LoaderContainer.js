import BaseElement from './BaseElement.js';

export default class LoaderContainer extends BaseElement {
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
      elements.map(
        (element) =>
          new Promise((resolve) => {
            Promise.all(Object.values(element.props)).then((propsArr) => {
              resolve([element, propsArr]);
            });
          }),
      ),
    ).then((elementsAndProps) => {
      this.removeLoader();
      elementsAndProps.forEach(([element, resolvedPropsArr]) => {
        const newPropsObj = Object.keys(element.props).reduce(
          (acc, curr, index) => {
            acc[curr] = resolvedPropsArr[index];
            return acc;
          },
          {},
        );
        const ElementConstructor = customElements.get(
          element.tagName.toLocaleLowerCase(),
        );
        const newElement = new ElementConstructor(newPropsObj);
        element.remove();
        newElement.setAttribute('slot', 'content');
        this.append(newElement);
      });
    });
  }
}
