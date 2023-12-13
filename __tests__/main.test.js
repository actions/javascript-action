/**
 * Unit tests for the action's main functionality, src/main.js
 */
const core = require('@actions/core')
const main = require('../src/main')

// Mock the GitHub Actions core library
const debugMock = jest.spyOn(core, 'debug').mockImplementation()
const getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
const setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Other utilities
const timeRegex = /^\d{2}:\d{2}:\d{2}/

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sets the time output', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'milliseconds':
          return '500'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(debugMock).toHaveBeenNthCalledWith(1, 'Waiting 500 milliseconds ...')
    expect(debugMock).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(timeRegex)
    )
    expect(debugMock).toHaveBeenNthCalledWith(
      3,
      expect.stringMatching(timeRegex)
    )
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'time',
      expect.stringMatching(timeRegex)
    )
  })

  it('sets a failed status', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'milliseconds':
          return 'this is not a number'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'milliseconds not a number'
    )
  })

  it('fails if no input is provided', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'milliseconds':
          throw new Error('Input required and not supplied: milliseconds')
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Input required and not supplied: milliseconds'
    )
  })
})

describe('getLatestVersion', () => {
  beforeEach(() => {
    process.env['RUNNER_OS'] = 'macos'
    jest.clearAllMocks()
  })

  const getLatestVersionMock = jest.spyOn(main, 'getLatestVersion')

  it('wrong os', async () => {
    process.env['RUNNER_OS'] = 'test'
    await main.getLatestVersion('dev', 'x64', '3.16.3')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Failed to get the latest version'
    )
  })

  it('convert darwin to macos', async () => {
    process.env['RUNNER_OS'] = 'darwin'
    await main.getLatestVersion('stable')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'version',
      expect.any(String)
    )
  })

  it('gets the latest stable version', async () => {
    await main.getLatestVersion('stable')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'version',
      expect.any(String)
    )
  })

  it('gets the latest beta version', async () => {
    await main.getLatestVersion('beta')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'version',
      expect.any(String)
    )
  })

  it('gets the latest dev version', async () => {
    await main.getLatestVersion('dev')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'version',
      expect.any(String)
    )
  })

  it('gets a specific version', async () => {
    await main.getLatestVersion('stable', '', '3.16.3')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'version',
      expect.any(String)
    )
  })

  it('gets a specific arch', async () => {
    await main.getLatestVersion('stable', 'arm64', '')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'version',
      expect.any(String)
    )
  })

  it('gets a specific arch and version', async () => {
    await main.getLatestVersion('stable', 'arm64', '3.16.3')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'version',
      expect.any(String)
    )
  })

  it('gets the x64 as amd64 version', async () => {
    await main.getLatestVersion('stable', 'amd64', '')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'version',
      expect.any(String)
    )
  })

  it('no version found', async () => {
    await main.getLatestVersion('mock')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'Channel mock not found')
  })

  it('no version found for version', async () => {
    await main.getLatestVersion('dev', '', '3.16.3')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'Version 3.16.3 not found')
  })

  it('no version found for arch', async () => {
    await main.getLatestVersion('dev', 'x641', '')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Architecture x641 not found'
    )
  })

  it('no version found for version and arch', async () => {
    await main.getLatestVersion('dev', 'x64', '3.16.3')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Version 3.16.3 with architecture x64 not found'
    )
  })
})
