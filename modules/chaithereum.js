
const chai = require('chai')
const Web3 = require('web3')
const TestRPC = require('ethereumjs-testrpc')

const web3 = new Web3()
web3.setProvider(TestRPC.provider())

chai.use(bindings)
chai.use(require('chai-bignumber')(web3.toBigNumber(0).constructor))
chai.use(require('chai-as-promised'))
chai.should()


const chaithereum = {
  chai,
  web3,
  accounts: [],
  blockNumber: 0,
  promise: web3.Q.all([
    web3.eth.getAccounts.q().then((_accounts) => {
      chaithereum.accounts.push.apply(chaithereum.accounts, _accounts)
      chaithereum.account = web3.eth.defaultAccount = _accounts[0]
    }),
    web3.eth.getBlock.q('latest').then((block) => {
      chaithereum.gasLimit = block.gasLimit
    })
  ])
}

web3.eth.filter('latest').watch((err) => {
  if (err) return
  chaithereum.blockNumber ++
})

module.exports = chaithereum

function bindings(_chai, utils) {

  _chai.Assertion.addProperty('hex', function addHexProperty() {
    new _chai.Assertion(this._obj).to.be.a('string')
    new _chai.Assertion(this._obj.substr(2)).to.match(/[0-9A-Fa-f]{6}/g)
  })

  _chai.Assertion.addProperty('address', function addAddressProperty() {
    new _chai.Assertion(this._obj).to.be.hex
    new _chai.Assertion(this._obj).to.have.length(42)
  })

  _chai.Assertion.addProperty('zeros', function addZerosProperty() {
    new _chai.Assertion(this._obj).to.be.hex
    this.assert(
      this._obj.split('00').join('').length === 2,
      'expected #{this} to be a string of 00 bytes',
      'expected #{this} to not be a string of 00 bytes'
    )
  })

  _chai.Assertion.addProperty('contract', function addContractPropertyProperty() {

    new _chai.Assertion(this._obj.address).to.be.address
    new _chai.Assertion(this._obj.address).to.not.be.zeros
    new _chai.Assertion(this._obj.code).to.not.be.zeros

  })

  chai.Assertion.addMethod('ascii', function addContractPropertyProperty(ascii) {

    const _ascii = web3.toAscii(this._obj).split(String.fromCharCode(0)).join('')
    new _chai.Assertion(_ascii).to.equal(ascii)

  })

}
