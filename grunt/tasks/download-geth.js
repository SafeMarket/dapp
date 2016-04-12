"use strict";

module.exports = function exportDownloadGeth(grunt) {

  grunt.registerTask('download-geth', function downloadGethTask() {

    const done = this.async()

    const request = require('request')
    const Q = require('Q')
    const download = require('url-download')
    const mkdirp = require('mkdirp')
    const fs = require('fs')
    const unzip = require('unzip')
    const tar = require('tar')
    const Bunzip = require('seek-bzip')

    const assetNames = []
    const workspace = this.options().workspace
    const output = this.options().output

    grunt.log.writeln('Using', workspace, 'as workspace')
    mkdirp.sync(workspace)

    getJson('https://api.github.com/repos/ethereum/go-ethereum/releases').then((releases) => {
      downloadAsset(releases[0].assets, 0)
    })

    function downloadAsset(assets, assetIndex) {

      const asset = assets[assetIndex]
      assetNames.push(asset.name)
      grunt.log.writeln('Downloading', asset.browser_download_url)

      download(asset.browser_download_url, workspace).on('close', () => {
        if (assetIndex === assets.length - 1) {
          handleDownloadedAssets()
        } else {
          downloadAsset(assets, assetIndex + 1)
        }
      })

    }

    function handleDownloadedAssets() {

      let handledCount = 0

      assetNames.forEach((assetName) => {

        const assetPath = `${workspace}/${assetName}`
        const _output = getOutput(assetName)

        mkdirp.sync(_output)

        if (assetName.indexOf('.zip') > -1) {
          unzipAsset(assetPath, _output).then(handled)
        } else if (assetName.indexOf('.tar.bz2') > -1) {
          untarAsset(assetPath, _output).then(handled)
        } else {
          grunt.log.error('Do not know how to handle', assetName)
          done(false)
        }

      })

      function handled() {
        handledCount ++
        if (handledCount === assetNames.length) {
          grunt.log.success('All assets downloaded and uncompressed')
          done(true)
        }
      }

    }

    function unzipAsset(assetPath, _output) {
      const deferred = Q.defer()
      grunt.log.writeln('Unzipping', assetPath)
      fs.createReadStream(assetPath).pipe(unzip.Extract({ path: _output }).on('close', () => {
        deferred.resolve()
      }))
      return deferred.promise
    }

    function untarAsset(assetPath, _output) {

      const deferred = Q.defer()
      const tarPath = assetPath.replace('.tar.bz2', '.tar')

      grunt.log.writeln('Uncompressing', assetPath, 'to', tarPath)

      const compressedData = fs.readFileSync(assetPath)
      const data = Bunzip.decode(compressedData)

      fs.writeFileSync(tarPath, data)

      grunt.log.writeln('Untarring', tarPath)

      const extractor = tar.Extract({ path: _output })
        .on('error', (err) => {
          grunt.log.error(err)
          done(false)
        })
        .on('end', () => {
          deferred.resolve()
        })

      fs.createReadStream(tarPath).pipe(extractor)

      return deferred.promise
    }


    function getJson(url) {

      const deferred = Q.defer()

      request(url, { headers: { 'User-Agent': 'SafeMarket' } }, (error, response, body) => {
        if (error || response.statusCode !== 200) {
          grunt.log.error(error || body)
          return done(false)
        }

        if (typeof body === 'string') {
          deferred.resolve(JSON.parse(body))
        } else {
          deferred.resolve(body)
        }

      })

      return deferred.promise

    }

    function getOutput(assetName) {
      const lowerCaseAssetName = assetName.toLowerCase()

      if (lowerCaseAssetName.indexOf('-arm-') > -1) {
        return output.arm
      } else if (lowerCaseAssetName.indexOf('-linux64-') > -1) {
        return output.linux64
      } else if (lowerCaseAssetName.indexOf('-win64-') > -1) {
        return output.win64
      }

      grunt.log.error('Could not determine output for', assetName)
      done(false)
    }

  })
}
