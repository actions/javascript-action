const core = require('@actions/core')
const getLatestVersion = require('../src/get-latest-version')
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
const setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()

describe('getLatestVersion', () => {
  beforeEach(() => {
    process.env['RUNNER_OS'] = 'macos'
    process.env['RUNNER_ARCH'] = 'arm64'
    jest.clearAllMocks()
  })

  const getLatestVersionMock = jest.spyOn(getLatestVersion, 'getLatestVersion')

  it('[0] wrong os', async () => {
    process.env['RUNNER_OS'] = 'test'
    await getLatestVersion.getLatestVersion('', 'dev', 'x64', '3.16.3')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Failed to get the latest version'
    )
  })

  it('[1] convert darwin to macos', async () => {
    await getLatestVersion.getLatestVersion('darwin', 'beta', '', '')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'version',
      expect.any(String)
    )
  }, 300000)

  it('[2] gets the latest stable version', async () => {
    await getLatestVersion.getLatestVersion('', 'stable', '', '')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'version',
      expect.any(String)
    )
  })

  it('[3] gets the latest beta version', async () => {
    await getLatestVersion.getLatestVersion('', 'beta', '', '')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'version',
      expect.any(String)
    )
  })

  it('[4] gets the latest dev version', async () => {
    await getLatestVersion.getLatestVersion('', 'dev', '', '')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'version',
      expect.any(String)
    )
  })

  it('[5] gets a specific version', async () => {
    await getLatestVersion.getLatestVersion('', 'stable', '', '3.16.3')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'version',
      expect.any(String)
    )
  })

  it('[6] gets a specific arch', async () => {
    await getLatestVersion.getLatestVersion('', 'stable', 'arm64', '')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'version',
      expect.any(String)
    )
  })

  it('[7] gets a specific arch and version', async () => {
    await getLatestVersion.getLatestVersion('', 'stable', 'arm64', '3.16.3')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'version',
      expect.any(String)
    )
  })

  it('[8] gets the x64 as amd64 version', async () => {
    await getLatestVersion.getLatestVersion('', 'stable', 'amd64', '')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'version',
      expect.any(String)
    )
  })

  it('[9] no channel found', async () => {
    await getLatestVersion.getLatestVersion('', 'mock', '', '')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'Channel mock not found')
  })

  it('[10] no version found for version', async () => {
    await getLatestVersion.getLatestVersion('', 'dev', '', '3.16.3')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(1, expect.any(String))
  })

  it('[11] no version found for arch', async () => {
    await getLatestVersion.getLatestVersion('', 'dev', 'x641', '')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Architecture x641 not found'
    )
  })

  it('[12] no version found for version and arch', async () => {
    await getLatestVersion.getLatestVersion('', 'dev', 'x64', '3.16.3')
    expect(getLatestVersionMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Version 3.16.3 with architecture x64 not found'
    )
  })
})
