import { LogContext } from '../LogContext';

test('LogContext passing context data', async () => {

  await LogContext.runInContext(async () => {
    LogContext.setData({'user.id': 42});

    // check CLS works
    expect(LogContext.getData()!['user.id']).toEqual(42);

    await (async () => {
      // check CLS passing via promise chain
      expect(LogContext.getData()!['user.id']).toEqual(42);

      await LogContext.runInContext(async () => {
        // check reentrancy
        expect(LogContext.getData()!['user.id']).toEqual(42);
      });
    })();
  });

});

test('LogContext must fail if context was not created', async () => {
  await expect(async () => LogContext.setData({'user.id': 42})).rejects.toThrow(Error);
});