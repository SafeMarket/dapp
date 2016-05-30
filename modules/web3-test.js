const Web3 = require('web3')
const TestRPC = require('ethereumjs-testrpc')

const web3 = new Web3()
const deferred = web3.Q.defer()

web3.setProvider(TestRPC.provider())

web3.Q.all([
  web3.eth.getAccounts.q().then((accounts) => {
    web3.accounts = accounts
    web3.eth.defaultAccount = accounts[0]
  }),
  web3.eth.getBlock.q('latest').then((block) => {
    web3.gasLimit = block.gasLimit
  })
]).then(() => {
  deferred.resolve(web3)
})

module.exports = deferred.promise
