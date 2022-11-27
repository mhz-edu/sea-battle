export default class Subscribable {
  constructor() {
    this.subs = {};
    this.subscribable = [];
  }

  subscribe(sub, prop) {
    this.subs[prop].push(sub);
  }

  createProp(sourcePropName, newPropName) {
    this[newPropName] = {};
    this.subs[newPropName] = [];
    Object.defineProperty(this, newPropName, {
      get: () => {
        console.log(`getter${sourcePropName}`);
        return this[sourcePropName];
      },
      set: (val) => {
        console.log(`setter${sourcePropName}`);
        this[sourcePropName] = val;
        this.subs[newPropName].forEach((sub) => sub.notify(val));
      },
    });
    this.subscribable.push(newPropName);
  }

  createArrayProp(sourcePropName, newPropName) {
    this[newPropName] = {};
    this.subs[newPropName] = [];
    this[sourcePropName].forEach((element, index) => {
      Object.defineProperty(this[newPropName], `${index}`, {
        get: () => {
          console.log(`getter${element}`);
          return this[sourcePropName][index];
        },
        set: (val) => {
          console.log(`setter${element}`);
          this[sourcePropName][index] = val;
          this.subs[newPropName].forEach((sub) => sub.notify([val, index]));
        },
      });
    });
    Object.defineProperty(this[newPropName], Symbol.iterator, {
      value: () => this[sourcePropName][Symbol.iterator](),
    });
    this.subscribable.push(newPropName);
  }

  createMatrixProp(sourcePropName, newPropName) {
    this[newPropName] = {};
    this.subs[newPropName] = [];
    this[sourcePropName].forEach((row, rowIndex) => {
      Object.defineProperty(this[newPropName], `${rowIndex}`, {
        value: Object.defineProperties(
          {},
          row.reduce(
            (acc, col, colIndex) => {
              acc[colIndex] = {
                get: () => {
                  // console.log(`getter ${colIndex}${rowIndex}`);
                  return this[sourcePropName][rowIndex][colIndex];
                },
                set: (val) => {
                  // console.log(`setter ${colIndex}${rowIndex}`);
                  this[sourcePropName][rowIndex][colIndex] = val;
                  this.subs[newPropName].forEach((sub) =>
                    sub.notify([val, colIndex, rowIndex])
                  );
                },
              };
              return acc;
            },
            {
              [Symbol.iterator]: {
                value: () => this[sourcePropName][rowIndex][Symbol.iterator](),
              },
            }
          )
        ),
      });
    });
    Object.defineProperty(this[newPropName], Symbol.iterator, {
      value: () => this[sourcePropName][Symbol.iterator](),
    });
    this.subscribable.push(newPropName);
  }
}
