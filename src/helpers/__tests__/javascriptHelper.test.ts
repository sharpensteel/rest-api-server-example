import { waitMilliseconds } from '../javascriptHelper';

test('waitMilliseconds()', async () => {
  const startedAt = new Date;
  await waitMilliseconds(200);
  const finishedAt = new Date;
  expect(Math.abs(finishedAt.getTime() - startedAt.getTime() - 200)).toBeLessThan(30);
});