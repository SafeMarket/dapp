const Web3 = require('web3')
const TestRPC = require('ethereumjs-testrpc')
const Q = require('Q')

const deferred = Q.defer()
const web3 = new Web3()

web3.setProvider(TestRPC.provider({
  logger: console
}))

web3.eth.getAccounts.q().then((accounts) => {
  web3.eth.defaultAccount = accounts[0]
  deferred.resolve(web3)
})

module.exports = deferred.promise
