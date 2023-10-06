/**
 * Unit tests for the action's entrypoint, src/index.js
 */

const { run } = require('../src/main')

// Mock the action's entrypoint
jest.mock('../src/main', () => ({
  run: jest.fn()
}))

describe('index', () => {
  it('calls run when imported', async () => {
    require('../src/index')

    expect(run).toHaveBeenCalled()
  })
})
