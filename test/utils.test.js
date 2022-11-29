import * as chai from "chai";
import { getEmptyCellsInRow } from "../src/utils.js";

describe("utils getEmptyCellsInRow()", () => {
  const tests = [
    {
      row: [true, true, true],
      expectedMap: [
        {
          start: 0,
          end: 2,
          length: 3,
        },
      ],
    },
    {
      row: [false, false, false],
      expectedMap: [],
    },
    {
      row: [true, true, false, false, false],
      expectedMap: [
        {
          start: 0,
          end: 1,
          length: 2,
        },
      ],
    },
    {
      row: [false, false, false, true, true],
      expectedMap: [
        {
          start: 3,
          end: 4,
          length: 2,
        },
      ],
    },
    {
      row: [false, false, true, true, false],
      expectedMap: [
        {
          start: 2,
          end: 3,
          length: 2,
        },
      ],
    },

    {
      row: [false, false, true, false, true, true],
      expectedMap: [
        {
          start: 2,
          end: 2,
          length: 1,
        },
        {
          start: 4,
          end: 5,
          length: 2,
        },
      ],
    },
    {
      row: [true, false, true, true, true, false, true],
      expectedMap: [
        {
          start: 0,
          end: 0,
          length: 1,
        },
        {
          start: 2,
          end: 4,
          length: 3,
        },
        {
          start: 6,
          end: 6,
          length: 1,
        },
      ],
    },
  ];

  tests.forEach(({ row, expectedMap }) => {
    it(`should return correct empty cells for the row with ${expectedMap.length} empty part(s)`, () => {
      const emptyCellsMap = getEmptyCellsInRow(row);

      chai.expect(emptyCellsMap).to.deep.equal(expectedMap);
    });
  });
});
