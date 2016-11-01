/* globals angular, web3, IpfsApi, bs58, Unixfs, DagNode */

angular.module('app').service('ipfs', function ipfsService($q, utils, growl) {

  this.api = IpfsApi('ipfs.infura.io', '5001', { protocol: 'https' })


  this.upload = function upload(files) {

    const wait = utils.wait()

    if (!Array.isArray(files)) {
      return $q.reject(new Error('files should be an array'))
    }

    if (files.length === 0) {
      return $q.fulfill([])
    }

    files.forEach((file) => {
      if (! file instanceof Buffer) {
        return $q.reject(new Error('file should be instance of buffer'))
      }
    })

    growl.addInfoMessage('Uploading '+files.length+' files to IPFS')

    return this.api.add(files).then((results) => {
      wait.cancel()
      growl.addSuccessMessage('Upload to IPFS complete!')
      return results.map((result, index) => {
        return result.hash
      })
    })

  }

  this.hash = function hash(file) {
    return this.api.util.hashFile(file)
  }

  this.fetch = function fetch(hash) {
    const wait = utils.wait()
    const deferred = $q.defer()
    let data = ''
      this.api.get(hash).then((readable) => {
        readable.on('readable', (a, b) => { console.log(a, b)
        const result = readable.read();
        if(!result) return

        let data = ''

        result.content.on('data', (_data) => {
          data += _data
        })
        result.content.on('end', () => {
          deferred.resolve(data)
          wait.cancel()
        })
      })
      
    })
    return deferred.promise
  }

})
