/**
 * @fileoverview This file contains the main logic for the setup-flutter action.
 * It exports the `run` and `getLatestVersion` functions.
 * The `run` function is the entry point of the action and handles the main workflow.
 * The `getLatestVersion` function retrieves the latest version of Flutter based on the specified channel, architecture, and version.
 */

const fs = require('fs')
const core = require('@actions/core')
const path = require('path')
const { getLatestVersion } = require('./get-latest-version')
const exec = require('@actions/exec')
const { clean, getCacheKey } = require('./helpers')
const { downloadVersion } = require('./download-version')
const tc = require('@actions/tool-cache')

const decompressTempFolder = '__decompress_temp'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    let arch = core.getInput('architecture')
    const version = core.getInput('flutter-version')
    let channel = core.getInput('channel')

    let osName = process.env['RUNNER_OS']
    if (osName === 'darwin') {
      osName = 'macos'
    }

    if (!arch || arch === '') {
      arch = process.env['RUNNER_ARCH'].toLowerCase()
    }

    if (!channel || channel === '') {
      channel = 'stable'
    }

    // sometimes the x64 architecture is reported as amd64
    if (arch !== undefined && arch !== '') {
      if (arch === 'amd64') {
        arch = 'x64'
      }
    }

    const releaseEntity = await getLatestVersion(osName, channel, arch, version)

    const baseFolder = process.env['RUNNER_TEMP']
    const tempFolder = path.join(baseFolder, decompressTempFolder)
    const flutterFolder = path.join(tempFolder, 'flutter')
    let cacheBaseFolder = core.getInput('cache-path')
    if (!cacheBaseFolder || cacheBaseFolder === '') {
      cacheBaseFolder = process.env['RUNNER_TOOL_CACHE']
    }

    const cacheFolder = path.join(cacheBaseFolder, getCacheKey(releaseEntity))
    if (core.getBooleanInput('query-only')) {
      core.setOutput('channel', releaseEntity.channel)
      core.setOutput('version', releaseEntity.version)
      core.setOutput('architecture', releaseEntity.dart_sdk_arch)
      core.setOutput('cache-path', cacheFolder)
      core.setOutput('cache-key', getCacheKey(releaseEntity))
    } else {
      const flutterDirectory = tc.find(
        'flutter',
        releaseEntity.version,
        releaseEntity.dart_sdk_arch
      )
      if (flutterDirectory) {
        core.info(
          `Found Flutter in cache ${flutterDirectory}, skipping installation`
        )
        core.setOutput('used-cached', 'true')
        core.addPath(path.join(flutterDirectory, 'bin'))
        core.exportVariable('FLUTTER_HOME', flutterDirectory)
        core.exportVariable(
          'PUB_CACHE',
          path.join(flutterDirectory, '.pub-cache')
        )
        core.addPath(path.join(flutterDirectory, 'bin'))
        core.addPath(
          path.join(flutterDirectory, 'bin', 'cache', 'dart-sdk', 'bin')
        )
        core.addPath(path.join(flutterDirectory, '.pub-cache', 'bin'))

        core.setOutput('channel', releaseEntity.channel)
        core.setOutput('version', releaseEntity.version)
        core.setOutput('architecture', releaseEntity.dart_sdk_arch)
        core.setOutput('cache-path', cacheFolder)
        core.setOutput('cache-key', getCacheKey(releaseEntity))
        return
      }

      try {
        await downloadVersion(releaseEntity)
      } catch (error) {
        core.setFailed(error)
        return
      }

      core.info(`Installing Flutter ${releaseEntity.version}...`)

      fs.mkdirSync(cacheFolder, { recursive: true })
      try {
        fs.renameSync(flutterFolder, cacheFolder)
      } catch (error) {
        core.error(`Error moving ${flutterFolder} to ${cacheFolder}: ${error}`)
        core.setFailed(
          `Error moving ${flutterFolder} to ${cacheFolder}: ${error}`
        )
        return
      }

      let output = ''
      let errorOutput = ''

      const options = {}
      options.listeners = {
        stdout: data => {
          output += data.toString()
        },
        stderr: data => {
          errorOutput += data.toString()
        }
      }
      await exec.exec(
        `"${path.join(cacheFolder, 'bin', 'flutter')}"`,
        ['doctor', '-v'],
        options
      )
      core.setOutput('doctor-output', output)

      output = ''
      errorOutput = ''
      await exec.exec(
        `"${path.join(cacheFolder, 'bin', 'flutter')}"`,
        ['--version'],
        options
      )
      core.setOutput('version-output', output)

      output = ''
      errorOutput = ''
      await exec.exec(
        `"${path.join(cacheFolder, 'bin', 'flutter')}"`,
        ['precache'],
        options
      )
      core.setOutput('precache-output', output)

      core.exportVariable('FLUTTER_HOME', path.join(cacheFolder))
      core.exportVariable('PUB_CACHE', path.join(cacheFolder, '.pub-cache'))
      core.addPath(path.join(cacheFolder, 'bin'))
      core.addPath(path.join(cacheFolder, 'bin', 'cache', 'dart-sdk', 'bin'))
      core.addPath(path.join(cacheFolder, '.pub-cache', 'bin'))

      core.setOutput('channel', releaseEntity.channel)
      core.setOutput('version', releaseEntity.version)
      core.setOutput('architecture', releaseEntity.dart_sdk_arch)
      core.setOutput('cache-path', cacheFolder)
      core.setOutput('cache-key', getCacheKey(releaseEntity))
      clean()

      if (core.getBooleanInput('cache')) {
        core.info(`Caching ${cacheFolder}...`)
        const cachePath = await tc.cacheDir(
          cacheFolder,
          'flutter',
          releaseEntity.version,
          releaseEntity.dart_sdk_arch
        )
        core.info(`Cache ID: ${cachePath}`)
        core.addPath(cachePath)
      }
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
