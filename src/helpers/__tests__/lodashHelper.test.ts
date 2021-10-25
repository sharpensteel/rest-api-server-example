import { objectChangeDiff } from '../lodashHelper';

test('test objectChangeDiff deep', () => {

  const DEL = '<DEL>';

  const obj = {
    new: 1,
    sameShallow: 2,
    sameDeep: [3, 4],
    changed: [5, 6],
  };

  const objToCheck = {
    sameShallow: 2,
    sameDeep: [3, 4],
    changed: [5, 7],
    deleted: 8,
  };

  const diff = objectChangeDiff(obj, objToCheck, DEL);

  expect(diff).toEqual({
    new: 1,
    changed: [5, 6],
    deleted: DEL,
  });


  {
    // check omitDeletedProperties
    const diff = objectChangeDiff({new: 1, changed: 3}, {changed:2, old:4}, null, true, true);
    expect(diff).toEqual({new: 1, changed: 3});
  }

});

test('test objectChangeDiff shallow', () => {

  const DEL = '<DEL>';

  const obj = {
    new: 1,
    sameShallow: 2,
    sameDeep: [3, 4],
    changed: [5, 6],
  };

  const objToCheck = {
    sameShallow: 2,
    sameDeep: [3, 4],
    changed: [5, 7],
    deleted: 8,
  };

  const diff = objectChangeDiff(obj, objToCheck, DEL, false);

  expect(diff).toEqual({
    new: 1,
    sameDeep: [3, 4],
    changed: [5, 6],
    deleted: DEL,
  });

});
