/**
 * Unit tests for the action's main functionality, src/main.js
 */
const core = require('@actions/core')
const tc = require('@actions/tool-cache')
const main = require('../src/main')
const fs = require('fs')
const { t } = require('tar')

// Mock the GitHub Actions core library
const debugMock = jest.spyOn(core, 'debug').mockImplementation()
const getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
const getBooleanInput = jest.spyOn(core, 'getBooleanInput').mockImplementation()
const addPathMock = jest.spyOn(core, 'addPath').mockImplementation()
const exportVariableMock = jest
  .spyOn(core, 'exportVariable')
  .mockImplementation()
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
const setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
const tcFindMock = jest.spyOn(tc, 'find').mockImplementation()

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Other utilities
const timeRegex = /^\d{2}:\d{2}:\d{2}/

describe('run', () => {
  const tempDir = '/tmp/setup-flutter/temp'
  const tempCache = '/tmp/setup-flutter/cache'

  beforeAll(() => {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
    if (!fs.existsSync(tempCache)) {
      fs.mkdirSync(tempCache, { recursive: true })
    }
  })

  beforeEach(() => {
    process.env['RUNNER_OS'] = process.platform
    process.env['RUNNER_ARCH'] = process.arch
    process.env['RUNNER_TEMP'] = tempDir
    process.env['RUNNER_TOOL_CACHE'] = tempCache
    jest.clearAllMocks()
  })

  afterAll(() => {
    fs.rm(tempDir, { recursive: true }, () => {
      core.info('tempDir removed')
    })
    fs.rm(tempCache, { recursive: true }, () => {
      core.info('tempCache removed')
    })
  })

  const setupMock = jest.spyOn(main, 'run')

  it('[1] query only', async () => {
    getBooleanInput.mockImplementation(name => {
      switch (name) {
        case 'query-only':
          return true
        default:
          return ''
      }
    })

    await main.run()
    expect(setupMock).toHaveReturned()
    expect(setOutputMock).toHaveBeenCalledWith('channel', 'stable')
    expect(setOutputMock).toHaveBeenCalledWith('version', expect.any(String))
    expect(setOutputMock).toHaveBeenCalledWith('architecture', process.arch)
    expect(setOutputMock).toHaveBeenCalledWith('cache-path', expect.any(String))
    expect(setOutputMock).toHaveBeenCalledWith('cache-key', expect.any(String))
  }, 300000)

  it('[2] run without cache', async () => {
    getBooleanInput.mockImplementation(name => {
      switch (name) {
        case 'query-only':
          return false
        case 'cache':
          return false
        default:
          return ''
      }
    })

    await main.run()
    expect(setupMock).toHaveReturned()
    expect(setOutputMock).toHaveBeenCalledWith('channel', 'stable')
    expect(setOutputMock).toHaveBeenCalledWith('version', expect.any(String))
    expect(setOutputMock).toHaveBeenCalledWith('architecture', process.arch)
    expect(setOutputMock).toHaveBeenCalledWith('cache-path', expect.any(String))
    expect(setOutputMock).toHaveBeenCalledWith('cache-key', expect.any(String))

    expect(setOutputMock).toHaveBeenCalledWith(
      'doctor-output',
      expect.any(String)
    )
    expect(setOutputMock).toHaveBeenCalledWith(
      'version-output',
      expect.any(String)
    )
    expect(setOutputMock).toHaveBeenCalledWith(
      'precache-output',
      expect.any(String)
    )

    expect(addPathMock).toHaveBeenNthCalledWith(1, expect.any(String))
    expect(addPathMock).toHaveBeenNthCalledWith(2, expect.any(String))
    expect(addPathMock).toHaveBeenNthCalledWith(3, expect.any(String))
    expect(exportVariableMock).toHaveBeenNthCalledWith(
      1,
      'FLUTTER_HOME',
      expect.any(String)
    )
    expect(exportVariableMock).toHaveBeenNthCalledWith(
      2,
      'PUB_CACHE',
      expect.any(String)
    )
  }, 300000)

  it('[3] run with cache', async () => {
    getBooleanInput.mockImplementation(name => {
      switch (name) {
        case 'query-only':
          return false
        case 'cache':
          return true
        default:
          return ''
      }
    })

    tcFindMock.mockImplementation(() => {
      return tempCache
    })

    await main.run()
    expect(setupMock).toHaveReturned()
    expect(setOutputMock).toHaveBeenCalledWith('used-cached', 'true')
    expect(setOutputMock).toHaveBeenCalledWith('channel', 'stable')
    expect(setOutputMock).toHaveBeenCalledWith('version', expect.any(String))
    expect(setOutputMock).toHaveBeenCalledWith('architecture', process.arch)
    expect(setOutputMock).toHaveBeenCalledWith('cache-path', expect.any(String))
    expect(setOutputMock).toHaveBeenCalledWith('cache-key', expect.any(String))
    expect(addPathMock).toHaveBeenNthCalledWith(1, expect.any(String))
    expect(addPathMock).toHaveBeenNthCalledWith(2, expect.any(String))
    expect(addPathMock).toHaveBeenNthCalledWith(3, expect.any(String))
    expect(exportVariableMock).toHaveBeenNthCalledWith(
      1,
      'FLUTTER_HOME',
      expect.any(String)
    )
    expect(exportVariableMock).toHaveBeenNthCalledWith(
      2,
      'PUB_CACHE',
      expect.any(String)
    )
  }, 300000)
})
