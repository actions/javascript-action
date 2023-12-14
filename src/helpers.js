const core = require('@actions/core')
const path = require('path')
const fs = require('fs')
const { decompressTempFolder } = require('./constants')

/**
 * Generates a cache key based on the provided release entity.
 * If no release entity is provided, the cache key is generated based on the current environment variables.
 *
 * @param {Object} releaseEntity - The release entity object.
 * @returns {string} The generated cache key.
 */
function getCacheKey(releaseEntity) {
  const cacheKey = core.getInput('cache-key')
  if (cacheKey && cacheKey !== '') {
    return cacheKey
  }

  if (!releaseEntity) {
    return `flutter-${process.env['RUNNER_OS']}-${process.env['RUNNER_ARCH']}`
  }

  return `flutter-${releaseEntity.channel}-${releaseEntity.version}-${releaseEntity.dart_sdk_arch}-${releaseEntity.hash}-${releaseEntity.sha256}`
}

/**
 * Cleans up the temporary folder used for decompression.
 */
function clean() {
  const baseFolder = process.env['RUNNER_TEMP']
  const tempFolder = path.join(baseFolder, decompressTempFolder)
  if (fs.existsSync(tempFolder)) {
    core.info(`Cleaning up ${tempFolder}`)
    fs.rm(tempFolder, { recursive: true }, err => {
      if (err) {
        core.warning(`Error cleaning up ${tempFolder}: ${err}`)
      }
    })
  }
}

module.exports = {
  getCacheKey,
  clean
}
