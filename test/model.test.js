const size = 5;

describe('Model getMask()', () => {
  const tests = [
    {
      desc: '1C ship on empty field,',
      playerField: [
        ['E', 'E', 'E', 'E', 'E'],
        ['E', 'E', 'E', 'E', 'E'],
        ['E', 'E', 'E', 'E', 'E'],
        ['E', 'E', 'E', 'E', 'E'],
        ['E', 'E', 'E', 'E', 'E'],
      ],
      ship: [1, 'h'],
      expectedMask: [
        [true, true, true, true, true],
        [true, true, true, true, true],
        [true, true, true, true, true],
        [true, true, true, true, true],
        [true, true, true, true, true],
      ],
    },

    {
      desc: '1C ship on field with one 1C ship in top-left',
      playerField: [
        ['E', 'E', 'E', 'E', 'E'],
        ['E', 'S', 'E', 'E', 'E'],
        ['E', 'E', 'E', 'E', 'E'],
        ['E', 'E', 'E', 'E', 'E'],
        ['E', 'E', 'E', 'E', 'E'],
      ],
      ship: [1, 'h'],
      expectedMask: [
        [false, false, false, true, true],
        [false, false, false, true, true],
        [false, false, false, true, true],
        [true, true, true, true, true],
        [true, true, true, true, true],
      ],
    },

    {
      desc: '3C hor ship on field with one 1C ship in top-left',
      playerField: [
        ['E', 'E', 'E', 'E', 'E'],
        ['E', 'S', 'E', 'E', 'E'],
        ['E', 'E', 'E', 'E', 'E'],
        ['E', 'E', 'E', 'E', 'E'],
        ['E', 'E', 'E', 'E', 'E'],
      ],
      ship: [3, 'h'],
      expectedMask: [
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [true, true, true, true, true],
        [true, true, true, true, true],
      ],
    },

    {
      desc: '3C ver ship on field with one 1C ship in top-left',
      playerField: [
        ['E', 'E', 'E', 'E', 'E'],
        ['E', 'S', 'E', 'E', 'E'],
        ['E', 'E', 'E', 'E', 'E'],
        ['E', 'E', 'E', 'E', 'E'],
        ['E', 'E', 'E', 'E', 'E'],
      ],
      ship: [3, 'v'],
      expectedMask: [
        [false, false, false, true, true],
        [false, false, false, true, true],
        [false, false, false, true, true],
        [false, false, false, true, true],
        [false, false, false, true, true],
      ],
    },

    {
      desc: '1C ver ship on field with one 1C ship in top-left and 1C ship in bottom-left',
      playerField: [
        ['S', 'E', 'E', 'E', 'E'],
        ['E', 'E', 'E', 'E', 'E'],
        ['E', 'E', 'E', 'E', 'E'],
        ['E', 'E', 'E', 'E', 'E'],
        ['S', 'E', 'E', 'E', 'E'],
      ],
      ship: [1, 'v'],
      expectedMask: [
        [false, false, true, true, true],
        [false, false, true, true, true],
        [true, true, true, true, true],
        [false, false, true, true, true],
        [false, false, true, true, true],
      ],
    },

    {
      desc: '4C hor ship on field with one 1C ship in top-left and 1C ship in center',
      playerField: [
        ['S', 'E', 'E', 'E', 'E'],
        ['E', 'E', 'E', 'E', 'E'],
        ['E', 'E', 'S', 'E', 'E'],
        ['E', 'E', 'E', 'E', 'E'],
        ['E', 'E', 'E', 'E', 'E'],
      ],
      ship: [4, 'h'],
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
      const model = new Model();
      model.own = playerField;
      const mask = model.getMask(...ship);
      console.log(mask);
      chai.expect(mask).to.deep.equal(expectedMask);
    });
  });
});
