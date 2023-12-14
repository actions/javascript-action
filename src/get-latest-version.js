const core = require('@actions/core')
const axios = require('axios')
const { manifestBaseUrl } = require('./constants')

/**
 * Retrieves the latest version of a Flutter SDK release based on the specified parameters.
 * @param {string} osName - The name of the operating system.
 * @param {string} channel - The release channel (e.g., stable, beta, dev).
 * @param {string} arch - The architecture (e.g., x64, arm64).
 * @param {string} version - The specific version of the Flutter SDK (optional).
 * @returns {Promise<Object>} - The filtered entry containing the latest version details.
 * @throws {Error} - If the latest version cannot be retrieved or if the specified version or architecture is not found.
 */
async function getLatestVersion(osName, channel, arch, version) {
  if (!osName || osName === '') {
    osName = process.env['RUNNER_OS']
  }
  if (osName === 'darwin') {
    osName = 'macos'
  }
  if (!channel || channel === '') {
    channel = 'stable'
  }
  if (!arch || arch === '') {
    arch = process.env['RUNNER_ARCH'].toLowerCase()
  }
  if (arch === 'amd64') {
    arch = 'x64'
  }

  const json_path = `releases_${osName}.json`
  const manifestUrl = `${manifestBaseUrl}/${json_path}`

  try {
    core.info('Getting latest version...')
    const response = await axios.get(manifestUrl)
    const channelHash = response.data.current_release[channel]
    if (!channelHash) {
      core.setFailed(`Channel ${channel} not found`)
      return
    }

    const channelEntries = []
    for (const [key, value] of Object.entries(response.data.releases)) {
      if (!version || version === '') {
        if (value.channel === channel) {
          channelEntries.push(value)
        }
      } else {
        if (arch && arch !== '') {
          if (
            value.version === version &&
            value.dart_sdk_arch === arch &&
            value.channel === channel
          ) {
            channelEntries.push(value)
          }
        } else {
          channelEntries.push(value)
        }
      }
    }

    let filteredEntry = {}

    for (const entry of channelEntries) {
      if (version && version !== '' && arch && arch !== '') {
        if (entry.version === version && entry.dart_sdk_arch === arch) {
          filteredEntry = entry
          break
        }
      } else if (version && version !== '') {
        if (entry.version === version) {
          filteredEntry = entry
          break
        }
      } else if (arch && arch !== '') {
        if (entry.dart_sdk_arch === arch) {
          filteredEntry = entry
          break
        }
      }
    }

    if (!filteredEntry.version) {
      if (version && version !== '' && arch && arch !== '') {
        core.setFailed(`Version ${version} with architecture ${arch} not found`)
        return
      }
      if (version && version !== '') {
        core.setFailed(`Version ${version} not found`)
        return
      }
      if (arch && arch !== '') {
        core.setFailed(`Architecture ${arch} not found`)
        return
      }
    } else {
      core.setOutput('version', filteredEntry.version)
      core.setOutput('channel', filteredEntry.channel)
      core.setOutput('arch', filteredEntry.dart_sdk_arch)
      core.setOutput('archive', filteredEntry.archive)
      core.setOutput('hash', filteredEntry.sha256)
      core.info(`Latest version: ${filteredEntry.version}`)
      return filteredEntry
    }
  } catch (error) {
    core.setFailed('Failed to get the latest version')
  }
}

module.exports = { getLatestVersion }
