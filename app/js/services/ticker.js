/* globals angular, blockchain, web3, contracts, deployer, _ */

angular.module('app').service('ticker', function tickerService() {

  this.contract = web3.eth.contract(contracts.Ticker.abi).at(contracts.Ticker.address)

  const symbols = ['WEI', 'ETH', 'BTC', 'USD', 'EUR', 'BTC']
  const prices = { ETH: web3.toBigNumber('1') }

  symbols.forEach((symbol) => {
    prices[symbol] = this.contract.getPrice(symbol)
  })

  this.prices = prices
})
