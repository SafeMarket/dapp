module.exports = function exportTicker(grunt) {
  grunt.registerMultiTask('ticker', function registerTickerMultiTask() {
    const Web3 = require('web3')
    const Q = require('q')
    const web3 = new Web3
    const options = this.options()
    const gethConfig = grunt.file.readYAML('config/geth.yml')[options.env]
    const contracts = grunt.file.readYAML('node_modules/safemarket-protocol/generated/contracts.json').contracts
    const chain = grunt.file.readJSON(`config/${options.env}/chain.json`)
    const rates = grunt.file.readJSON('config/rates.json')
    const done = this.async()

    web3.setProvider(new web3.providers.HttpProvider(`http://localhost:${gethConfig.rpcport}`))
    web3.eth.defaultAccount = web3.eth.accounts[0]

    const Infosphere = web3.eth.contract(JSON.parse(contracts.Infosphere.interface)).at(chain.Infosphere.address)
    const rateSetters = Object.keys(rates).map((symbol) => {
      return getRateSetter(symbol, rates[symbol])
    })

    rateSetters.reduce((soFar, f) => {
      return soFar.then(f)
    }, Q()).then(() => {
      grunt.log.success('All rates are set')
      done(true)
    })


    function getRateSetter(symbol, value) {
      return function rateSetter() {
        const deferred = Q.defer()
        setRate(symbol, value).then(() => {
          deferred.resolve()
        })
        return deferred.promise
      }
    }

    function setRate(symbol, value) {

      grunt.log.writeln(`Setting ${symbol} to ${value}...`)

      const deferred = Q.defer()

      Infosphere.setUint(symbol, value, {
        gas: Infosphere.setUint.estimateGas(symbol, value)
      }, (err, txHex) => {
        if (err) {
          grunt.log.error(err)
          return done(false)
        }

        waitForTx(txHex).then(() => {
          grunt.log.writeln(`Set ${symbol} to ${value}...`)
          deferred.resolve()
        })
      })

      return deferred.promise
    }

    function waitForTx(txHex) {
      const deferred = Q.defer()
      const waitInterval = setInterval(() => {

        const txReceipt = web3.eth.getTransactionReceipt(txHex)

        if (!txReceipt) {
          return
        }

        clearInterval(waitInterval)
        deferred.resolve(txReceipt)

      }, 1000)

      return deferred.promise
    }
  })
}
