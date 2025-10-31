describe('Basic Tests', () => {
  test('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  test('should validate environment', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
});