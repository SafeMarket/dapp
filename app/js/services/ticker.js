/* globals angular, blockchain, web3, contracts, deployer, _ */

angular.module('app').service('ticker', function tickerService() {

  this.contract = web3.eth.contract(contracts.Ticker.abi).at(contracts.Ticker.address)

  const symbols = ['WEI', 'ETH', 'USD', 'BTC', 'EUR', 'AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK', 'GBP', 'HKD', 'HRK', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN', 'RON', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'ZAR'].sort()
  const prices = {}

  symbols.forEach((symbol) => {
    prices[symbol] = this.contract.getPrice(symbol)
  })

  this.prices = prices
})
