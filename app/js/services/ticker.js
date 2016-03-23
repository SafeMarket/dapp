/* globals angular, blockchain, web3, contracts, deployer, _ */

angular.module('app').service('ticker', function tickerService($interval, $http, $q, constants) {

  console.log(constants)

  let Infosphere
  let tickerAddress

  if (blockchain.env === 'production') {
    Infosphere = web3.eth.contract(contracts.Infosphere.abi).at('0xaf527686227cc508ead0d69c7f8a98f76b63e191')
    tickerAddress = '0xdc99b79555385ab2fe0ff28c3c954a07b28aac5e'
  } else {
    Infosphere = web3.eth.contract(contracts.Infosphere.abi).at(contracts.Infosphere.address)
    tickerAddress = deployer
  }

  const symbols = ['CMC:TETH:USD', 'CMC:TETH:EUR', 'CMC:TETH:CNY', 'CMC:TETH:CAD', 'CMC:TETH:RUB', 'CMC:TETH:BTC']
  const rates = { ETH: web3.toBigNumber('1') }

  symbols.forEach((symbol) => {
    const currency = _.last(symbol.split(':'))
    const rate = Infosphere.getUint(tickerAddress, symbol)
    rates[currency] = rate.div(constants.tera)
  })

  rates.WEI = rates.ETH.times('1000000000000000000')
  this.rates = rates
})
