const Q = require('Q')
const request = require('request')
const BigNumber = require('bignumber.js')
const fs = require('fs')

module.exports = function exportSetPrices(grunt) {
  grunt.registerTask('set-prices', function setPrices() {

    const done = this.async()
    const prices = {
      WEI: '1',
      ETH: '1000000000000000000'
    }

    getUsdPrice('ETH').then((ethPriceInUsd) => {
      prices.USD = ethPriceInUsd.div(prices.ETH).pow('-1').floor().toString()
      getUsdPrice('BTC').then((btcPriceInUsd) => {
        prices.BTC = btcPriceInUsd.times(prices.USD).floor().toString()
        getJson('http://api.fixer.io/latest').then((data) => {
          const priceOfBaseInUsd = new BigNumber(data.rates.USD)

          prices[data.base] = priceOfBaseInUsd.times(prices.USD).floor().toString()


          Object.keys(data.rates).forEach((symbol) => {
            if (symbol === 'USD') return true
            const priceOfBaseInSym = new BigNumber(data.rates[symbol])
            const priceOfSymInBase = priceOfBaseInSym.pow(-1)
            const priceOfSymInUsd = priceOfSymInBase.times(priceOfBaseInUsd)
            prices[symbol] = priceOfSymInUsd.times(prices.USD).floor().toString()
          })

          Object.keys(prices).forEach((symbol) => {
            const priceOfSymbolInWei = new BigNumber(prices[symbol])
            const priceOfSymbolInUsd = priceOfSymbolInWei.div(prices.USD)

            grunt.log.writeln(`1 ${symbol} = ${priceOfSymbolInUsd.toFixed(2)} USD`)
          })

          fs.writeFileSync('generated/prices.json', JSON.stringify(prices))

          grunt.log.success('prices.json written')
          done()
        }, (err) => {
          console.log(err)
        }).catch((err) => {
          console.log(err)
        })
      })
    })

  })
}

function getDoc(url) {
  const deferred = Q.defer()

  request(url, (error, response, body) => {
    if (error) {
      deferred.reject(error)
    } else if (response.statusCode !== 200) {
      deferred.reject()
    } else {
      deferred.resolve(body)
    }
  })

  return deferred.promise
}

function getJson(url) {
  const deferred = Q.defer()

  getDoc(url).then((doc) => {
    deferred.resolve(JSON.parse(doc))
  }, (error) => {
    deferred.reject(error)
  })

  return deferred.promise
}

function getUsdPrice(symbol) {
  const deferred = Q.defer()

  getJson(`http://socket.coincap.io/page/${symbol}`).then((data) => {
    deferred.resolve(new BigNumber(data.usdPrice))
  })

  return deferred.promise
}
