import { enumStringsGetValues } from '../typescriptHelper';

test('enumStringsGetValues()', () => {

  enum TestEnum {
    SomeKey = 'some-key',
  }
  expect(enumStringsGetValues(TestEnum)).toEqual(['some-key']);

});

