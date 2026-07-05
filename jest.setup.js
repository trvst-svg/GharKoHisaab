jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() =>
    Promise.resolve({
      execAsync: jest.fn(),
      runAsync: jest.fn(),
      getAllAsync: jest.fn(() => Promise.resolve([])),
      getFirstAsync: jest.fn(() => Promise.resolve(null)),
      prepareSync: jest.fn(() => ({
        executeSync: jest.fn(() => []),
        executeForRawResultSync: jest.fn(() => ({ getAllSync: () => [] }))
      })),
      prepareAsync: jest.fn(() => Promise.resolve({ executeAsync: jest.fn(() => Promise.resolve([])) })),
    })
  ),
}));
