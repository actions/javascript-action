const core = require('@actions/core')
const downloadVersion = require('../src/download-version')
const fs = require('fs')
const { t } = require('tar')

// Mock the GitHub Actions core library
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()

describe('downloadVersion', () => {
  const tempDir = '/tmp/setup-flutter/temp'
  const tempCache = '/tmp/setup-flutter/cache'
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }
  if (!fs.existsSync(tempCache)) {
    fs.mkdirSync(tempCache, { recursive: true })
  }

  beforeEach(() => {
    process.env['RUNNER_OS'] = 'macos'
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

  const downloadVersionMock = jest.spyOn(downloadVersion, 'downloadVersion')
  const tarReleaseMock = {
    hash: 'b0366e0a3f089e15fd89c97604ab402fe26b724c',
    channel: 'stable',
    version: '3.16.3',
    dart_sdk_version: '3.2.3',
    dart_sdk_arch: 'x64',
    release_date: '2023-12-06T18:02:04.383556Z',
    archive: 'stable/linux/flutter_linux_3.16.3-stable.tar.xz',
    sha256: '22196f6e5d8b67cbdddf1fc94f62da07addb67da0210d0498cbcff6ddcb7127e'
  }

  const zipReleaseMock = {
    hash: 'b0366e0a3f089e15fd89c97604ab402fe26b724c',
    channel: 'stable',
    version: '3.16.3',
    dart_sdk_version: '3.2.3',
    dart_sdk_arch: 'x64',
    release_date: '2023-12-06T17:56:58.013613Z',
    archive: 'stable/macos/flutter_macos_3.16.3-stable.zip',
    sha256: '0230d67d13817b65e2006bcd3330d72e4161f5c10b558afd1c72a818cd7c578e'
  }

  it('no release defined', async () => {
    await downloadVersion.downloadVersion()
    expect(downloadVersionMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'No release defined to download'
    )
  })

  it('get zip version', async () => {
    await downloadVersion.downloadVersion(zipReleaseMock)
    expect(downloadVersionMock).toHaveReturned()
  }, 300000)

  it('get tar version', async () => {
    await downloadVersion.downloadVersion(tarReleaseMock)
    expect(downloadVersionMock).toHaveReturned()
  }, 300000)
})
