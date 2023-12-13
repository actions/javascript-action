const core = require('@actions/core')
const axios = require('axios')
const { wait } = require('./wait')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const ms = core.getInput('milliseconds', { required: true })

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.debug(`Waiting ${ms} milliseconds ...`)

    // Log the current timestamp, wait, then log the new timestamp
    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    // Set outputs for other workflow steps to use
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

async function getLatestVersion(channel, arch, version) {
  let osName = process.env['RUNNER_OS']
  if (osName === 'darwin') {
    osName = 'macos'
  }

  // sometimes the x64 architecture is reported as amd64
  if (arch !== undefined && arch !== '') {
    if (arch === 'amd64') {
      arch = 'x64'
    }
  }

  const manifestBaseUrl =
    'https://storage.googleapis.com/flutter_infra_release/releases'
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
      if (value.hash === channelHash) {
        channelEntries.push(value)
      }
    }

    if ((!arch || arch === '') && (!version || version === '')) {
      core.setOutput('version', channelEntries[0].version)
      core.info(`Latest version: ${channelEntries[0].version}`)
      return channelEntries[0].version
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
      core.info(`Latest version: ${filteredEntry.version}`)
      return filteredEntry.version
    }
  } catch (error) {
    core.setFailed('Failed to get the latest version')
  }
}

module.exports = {
  run,
  getLatestVersion
}
