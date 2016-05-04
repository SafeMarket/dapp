module.exports = function exportTicker(grunt) {
  grunt.registerMultiTask('ticker', function registerTickerMultiTask() {
    const Web3 = require('web3')
    const Q = require('q')
    const web3 = new Web3
    const options = this.options()
    const gethConfig = grunt.file.readYAML('config/geth.yml')[options.env]
    const contracts = grunt.file.readYAML('generated/contracts.json').contracts
    const chain = grunt.file.readJSON(`config/${options.env}/chain.json`)
    const prices = grunt.file.readJSON('config/prices.json')
    const done = this.async()

    web3.setProvider(new web3.providers.HttpProvider(`http://localhost:${gethConfig.rpcport}`))
    web3.eth.defaultAccount = web3.eth.accounts[0]

    const Ticker = web3.eth.contract(JSON.parse(contracts.Ticker.interface)).at(chain.Ticker.address)
    const priceSetters = Object.keys(prices).map((symbol) => {
      return getPriceSetter(symbol, prices[symbol])
    })

    priceSetters.reduce((soFar, f) => {
      return soFar.then(f)
    }, Q()).then(() => {
      grunt.log.success('All prices are set')
      done(true)
    })


    function getPriceSetter(symbol, value) {
      return function priceSetter() {
        const deferred = Q.defer()
        setPrice(symbol, value).then(() => {
          deferred.resolve()
        })
        return deferred.promise
      }
    }

    function setPrice(symbol, value) {

      grunt.log.writeln(`${symbol} is ${value}`)

      const deferred = Q.defer()

      const _value = Ticker.getPrice(symbol)
      const diff = _value.minus(value)
      const diffPerun = diff.div(_value)

      if (diffPerun.lessThanOrEqualTo('.01')) {
        grunt.log.writeln(`${symbol} has moved less than 1%. Skipping`)
        deferred.resolve()
        return deferred.promise
      }

      Ticker.setPrice(symbol, value, {
        gas: Ticker.setPrice.estimateGas(symbol, value)
      }, (err, txHex) => {
        if (err) {
          grunt.log.error(err)
          return done(false)
        }

        waitForTx(txHex).then(() => {
          grunt.log.writeln(`${symbol} updated`)
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
