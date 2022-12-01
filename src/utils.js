import { GAMEFIELD_SIZE } from './config.js';

export function markAroundShipCell(x, y, mask) {
  const coordsMatrix = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [0, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
  ];
  coordsMatrix.forEach(([dx, dy]) => {
    const getX = x + dx;
    const getY = y + dy;
    if (
      getX >= 0 &&
      getX < GAMEFIELD_SIZE &&
      getY >= 0 &&
      getY < GAMEFIELD_SIZE
    ) {
      try {
        mask[x + dx][y + dy] = false;
      } catch (error) {}
    }
  });
}

export function getEmptyCellsInRow(rowArray) {
  const lengthsArray = rowArray
    .map((i) => (i ? 1 : 0))
    .join('')
    .split('0')
    .map((s) => s.length);
  const emptyCellsMap = [];
  let start = 0;
  let end = 0;
  lengthsArray.forEach((part) => {
    if (part === 0) {
      start = start + 1;
      end = end + 1;
    } else {
      emptyCellsMap.push({
        start: start,
        end: start + part - 1,
        length: part,
      });
      start = start + part + 1;
      end = end + part + 1;
    }
  });
  return emptyCellsMap;
}

export function templateParser(text) {
  const domParser = new DOMParser();
  const doc = domParser.parseFromString(text, 'text/html');
  const fragment = document.createDocumentFragment();
  fragment.append(doc.body.firstChild.cloneNode(true));
  const root = fragment.firstChild;
  const queue = [root];
  while (queue.length > 0) {
    let currentNode = queue.pop();
    queue.push(...currentNode.children);
    if (customElements.get(currentNode.tagName.toLocaleLowerCase())) {
      let props = {};
      props.context = this;
      const subscribeTo = [];

      const parsedAttrs = [...currentNode.attributes].reduce((acc, curr) => {
        if (props.context[curr.value]) {
          if (
            props.context.subscribable &&
            props.context.subscribable.includes(curr.value)
          ) {
            subscribeTo.push(curr.value);
          }
          acc[curr.name] = props.context[curr.value];
        } else {
          acc[curr.name] = curr.value;
        }
        return acc;
      }, {});

      props = { ...props, ...parsedAttrs };
      const newElement = new (customElements.get(
        currentNode.tagName.toLocaleLowerCase()
      ))(props);
      subscribeTo.forEach((propName) => {
        props.context.subscribe(newElement, propName);
      });
      newElement.append(...currentNode.childNodes);

      currentNode.replaceWith(newElement);
    }
  }
  return fragment;
}
