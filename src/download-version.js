const fs = require('fs')
const stream = require('stream')
const util = require('util')
const core = require('@actions/core')
const axios = require('axios')
const tc = require('@actions/tool-cache')
const path = require('path')
const { clean } = require('./helpers')
const { decompressTempFolder, manifestBaseUrl } = require('./constants')

/**
 * Downloads a release version from the specified URL and extracts it if necessary.
 * @param {Object} releaseEntity - The release entity containing information about the release.
 * @returns {Promise<void>} - A promise that resolves when the download and extraction are complete.
 */
async function downloadVersion(releaseEntity) {
  if (!releaseEntity || releaseEntity.archive === '') {
    core.setFailed('No release defined to download')
    return
  }

  const finished = util.promisify(stream.finished)
  const filename = path.basename(releaseEntity.archive)
  const baseFolder = process.env['RUNNER_TEMP']
  const localFilePath = path.join(baseFolder, filename)
  const downloadUrl = `${manifestBaseUrl}/${releaseEntity.archive}`
  const tempFolder = path.join(baseFolder, decompressTempFolder)

  clean(localFilePath)

  core.info(`Downloading ${filename} from ${downloadUrl}`)
  const writer = fs.createWriteStream(localFilePath)
  const response = await axios.get(downloadUrl, { responseType: 'stream' })
  response.data.pipe(writer)

  // Wait for the stream to finish
  await finished(writer)
  core.info(`Downloaded ${filename}`)

  if (filename.endsWith('.zip')) {
    try {
      core.info(`Extracting ${filename} to ${baseFolder}`)
      const files = await tc.extractZip(localFilePath, tempFolder)
      core.info(`Extracted ${files} files`)
      return
    } catch (error) {
      clean(localFilePath)
      core.setFailed(`Error extracting ${filename}: ${error}`)
    }
    return
  }

  if (filename.endsWith('.tar.xz')) {
    try {
      core.info(`Extracting ${filename} to ${localFilePath}`)
      const files = await tc.extractTar(localFilePath, tempFolder)
      core.info(`Extracted ${files} files`)
      return
      // const decompressor = new xz.Decompressor()
      // const reader = fs.createReadStream(localFilePath).pipe(decompressor)
      // const tarWriter = tar.extract(tempFolder)
      // reader.pipe(tarWriter)
      // return new Promise((resolve, reject) => {
      //   tarWriter.on('finish', () => {
      //     core.info(`Extracted ${filename}`)
      //     resolve()
      //   })
      //   tarWriter.on('error', err => {
      //     core.setFailed(`Error extracting ${filename}: ${err}`)
      //     clean(localFilePath)
      //     reject(err)
      //   })
      // })
    } catch (error) {
      clean(localFilePath)
      core.setFailed(`Error extracting ${filename}: ${error}`)
    }

    return
  }
}

module.exports = { downloadVersion }
