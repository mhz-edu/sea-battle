const utils = {
  markAroundShipCell(x, y, mask) {
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
      if (getX >= 0 && getX < size && getY >= 0 && getY < size) {
        mask[x + dx][y + dy] = false;
      }
    });
  },

  updateFieldMask(field, mask) {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (field[row][col] === 'S') {
          utils.markAroundShipCell(row, col, mask);
        }
      }
    }
  },

  getEmptyCellsInRow(rowArray) {
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
  },

  templateParser(text) {
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
        const props = [...currentNode.attributes].reduce((acc, curr) => {
          acc[curr.name] = curr.value;
          return acc;
        }, {});

        props.context = this;
        const newElement = new (customElements.get(
          currentNode.tagName.toLocaleLowerCase()
        ))(props);
        newElement.append(...currentNode.childNodes);

        currentNode.replaceWith(newElement);
      }
    }
    return fragment;
  },
};
