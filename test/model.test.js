import * as chai from "chai";
import Model from "../src/states/game/Model.js";

const GAMEFIELD_SIZE = 5;

describe("Model", () => {
  describe("getMask()", () => {
    const tests = [
      {
        desc: "1C ship on empty field,",
        playerField: [
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
        ],
        ship: [1, "h"],
        expectedMask: [
          [true, true, true, true, true],
          [true, true, true, true, true],
          [true, true, true, true, true],
          [true, true, true, true, true],
          [true, true, true, true, true],
        ],
      },

      {
        desc: "1C ship on field with one 1C ship in top-left",
        playerField: [
          ["E", "E", "E", "E", "E"],
          ["E", "S", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
        ],
        ship: [1, "h"],
        expectedMask: [
          [false, false, false, true, true],
          [false, false, false, true, true],
          [false, false, false, true, true],
          [true, true, true, true, true],
          [true, true, true, true, true],
        ],
      },

      {
        desc: "3C hor ship on field with one 1C ship in top-left",
        playerField: [
          ["E", "E", "E", "E", "E"],
          ["E", "S", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
        ],
        ship: [3, "h"],
        expectedMask: [
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
          [true, true, true, true, true],
          [true, true, true, true, true],
        ],
      },

      {
        desc: "3C ver ship on field with one 1C ship in top-left",
        playerField: [
          ["E", "E", "E", "E", "E"],
          ["E", "S", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
        ],
        ship: [3, "v"],
        expectedMask: [
          [false, false, false, true, true],
          [false, false, false, true, true],
          [false, false, false, true, true],
          [false, false, false, true, true],
          [false, false, false, true, true],
        ],
      },

      {
        desc: "1C ver ship on field with one 1C ship in top-left and 1C ship in bottom-left",
        playerField: [
          ["S", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["S", "E", "E", "E", "E"],
        ],
        ship: [1, "v"],
        expectedMask: [
          [false, false, true, true, true],
          [false, false, true, true, true],
          [true, true, true, true, true],
          [false, false, true, true, true],
          [false, false, true, true, true],
        ],
      },

      {
        desc: "4C hor ship on field with one 1C ship in top-left and 1C ship in center",
        playerField: [
          ["S", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "S", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
        ],
        ship: [4, "h"],
        expectedMask: [
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
          [true, true, true, true, true],
        ],
      },
    ];

    tests.forEach(({ desc, playerField, ship, expectedMask }) => {
      it(`it should return correct mask for ${desc}`, function () {
        const model = new Model(GAMEFIELD_SIZE);
        model.own = playerField;
        const mask = model.getMask(...ship);
        chai.expect(mask).to.deep.equal(expectedMask);
      });
    });
  });

  describe("placeShips()", () => {
    const tests = [
      {
        ship: [1, 1, 1, "h"],
        expectedField: [
          ["E", "E", "E", "E", "E"],
          ["E", "S", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
        ],
      },
      {
        ship: [1, 1, 3, "h"],
        expectedField: [
          ["E", "E", "E", "E", "E"],
          ["E", "S", "S", "S", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
        ],
      },
      {
        ship: [1, 1, 3, "v"],
        expectedField: [
          ["E", "E", "E", "E", "E"],
          ["E", "S", "E", "E", "E"],
          ["E", "S", "E", "E", "E"],
          ["E", "S", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
        ],
      },
    ];

    tests.forEach(({ ship, expectedField }) => {
      it(`it should place ${ship} ship correctly`, function () {
        const model = new Model(GAMEFIELD_SIZE);
        model.placeShip(...ship);
        chai.expect(model._own).to.deep.equal(expectedField);
      });
    });
  });

  describe("checkCell()", () => {
    const tests = [
      {
        desc: "H when given cell of own field contains ship",
        playerField: [
          ["E", "E", "E", "E", "E"],
          ["E", "S", "S", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
        ],
        coords: { x: 2, y: 1 },
        expected: "H",
      },
      {
        desc: "M when given cell of own field is empty",
        playerField: [
          ["E", "E", "E", "E", "E"],
          ["E", "S", "S", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
        ],
        coords: { x: 1, y: 4 },
        expected: "M",
      },
    ];

    tests.forEach(({ desc, playerField, coords, expected }) => {
      it(`it should return ${desc}`, function () {
        const model = new Model(GAMEFIELD_SIZE);
        const { x, y } = coords;
        model.own = playerField;
        chai.expect(model.checkCell(x, y)).to.be.equal(expected);
      });
    });
  });

  describe("checkField()", () => {
    const tests = [
      {
        desc: "true when own field contains at least one ship cell",
        playerField: [
          ["E", "E", "E", "E", "E"],
          ["E", "S", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
        ],
        expected: true,
      },
      {
        desc: "true when own field contains at more than one ship cell",
        playerField: [
          ["E", "E", "E", "E", "E"],
          ["E", "S", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "S", "S"],
          ["E", "E", "E", "E", "E"],
        ],
        expected: true,
      },
      {
        desc: "false when own field has no ship cells",
        playerField: [
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
        ],
        expected: false,
      },
    ];

    tests.forEach(({ desc, playerField, expected }) => {
      it(`it should return ${desc}`, function () {
        const model = new Model(GAMEFIELD_SIZE);
        model._own = playerField;
        chai.expect(model.checkField()).to.be.equal(expected);
      });
    });
  });

  describe("updateCell()", () => {
    const tests = [
      {
        desc: "update own field",
        fieldType: "_own",
        field: [
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
        ],
        params: [2, 3, "S", "own"],
        expectedField: [
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "S", "E", "E"],
          ["E", "E", "E", "E", "E"],
        ],
      },
      {
        desc: "update enemy field",
        fieldType: "_enemy",
        field: [
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
        ],
        params: [4, 4, "S", "enemy"],
        expectedField: [
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "S"],
        ],
      },
      {
        desc: "update mask field",
        fieldType: "_mask",
        field: [
          [true, true, true, true, true],
          [true, true, true, true, true],
          [true, true, true, true, true],
          [true, true, true, true, true],
          [true, true, true, true, true],
        ],
        params: [0, 4, false, "_mask"],
        expectedField: [
          [true, true, true, true, true],
          [true, true, true, true, true],
          [true, true, true, true, true],
          [true, true, true, true, true],
          [false, true, true, true, true],
        ],
      },
    ];

    tests.forEach(({ desc, fieldType, field, params, expectedField }) => {
      it(`it should correctly ${desc}`, function () {
        const model = new Model(GAMEFIELD_SIZE);
        model[fieldType] = field;
        model.updateCell(...params);
        chai.expect(model[fieldType]).to.deep.equal(expectedField);
      });
    });
  });

  describe("fieldReset()", () => {
    const tests = [
      {
        desc: "reset own field that has ships",
        field: [
          ["E", "E", "E", "E", "E"],
          ["E", "S", "S", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "S", "E"],
          ["E", "E", "E", "E", "E"],
        ],
      },
      {
        desc: "reset own field that has no ships",
        field: [
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
          ["E", "E", "E", "E", "E"],
        ],
      },
    ];

    const expectedField = [
      ["E", "E", "E", "E", "E"],
      ["E", "E", "E", "E", "E"],
      ["E", "E", "E", "E", "E"],
      ["E", "E", "E", "E", "E"],
      ["E", "E", "E", "E", "E"],
    ];

    tests.forEach(({ desc, field }) => {
      it(`it should correctly ${desc}`, function () {
        const model = new Model(GAMEFIELD_SIZE);
        model.own = field;
        model.resetField();
        chai.expect(model.own).to.deep.equal(expectedField);
      });
    });
  });

  describe("with Subscribable", () => {
    const tests = [
      {
        desc: "update own field",
        fieldType: "own",
        params: [2, 3, "S", "own"],
      },
      {
        desc: "update enemy field",
        fieldType: "enemy",
        params: [2, 3, "H", "enemy"],
      },
    ];

    const expected = {
      result: null,
      notify(val) {
        this.result = val;
      },
    };

    tests.forEach(({ desc, fieldType, params }) => {
      it(`it should trigger notify method of subcriber when ${desc}`, function () {
        const model = new Model(GAMEFIELD_SIZE);
        model.subscribe(expected, fieldType);
        model.updateCell(...params);
        chai
          .expect(expected.result)
          .to.deep.equal([params[2], ...params.slice(0, -2)]);
      });
    });
  });
});
