import { testFunction } from '../../dist/features/auth/__mocks__/test.js'

test('check manual mock is used', () => {
    const result = testFunction()
    expect(result).toBe('This is a mock functions') // Should log: 'This is a mock function'
})
