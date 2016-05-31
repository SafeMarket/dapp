
const chai = require('chai')
const Web3 = require('web3')
const TestRPC = require('ethereumjs-testrpc')

const web3 = new Web3()
web3.setProvider(TestRPC.provider())

chai.use(bindings)
chai.use(require('chai-bignumber')(web3.toBigNumber(0).constructor))
chai.use(require('chai-as-promised'))
chai.should()

const accounts = []

module.exports = {
  chai,
  web3,
  accounts,
  promise: web3.Q.all([
    web3.eth.getAccounts.q().then((_accounts) => {
      accounts.push.apply(accounts, _accounts)
      web3.eth.defaultAccount = _accounts[0]
    }),
    
  ])
}

function bindings(_chai, utils) {

  /* hex */
  _chai.Assertion.addProperty('hex', function addHexProperty() {
    new _chai.Assertion(this._obj).to.be.a('string')
    new _chai.Assertion(this._obj.substr(2)).to.match(/[0-9A-Fa-f]{6}/g)
  })

  /* address */
  _chai.Assertion.addProperty('address', function addAddressProperty() {
    new _chai.Assertion(this._obj).to.be.hex
    new _chai.Assertion(this._obj).to.have.length(42)
  })

  /* zero bytes */
  utils.addProperty(_chai.Assertion.prototype, 'zeros', function addZerosProperty() {
    new _chai.Assertion(this._obj).to.be.hex
    this.assert(
      this._obj.split('00').join('').length === 2,
      'expected #{this} to be a string of 00 bytes',
      'expected #{this} to not be a string of 00 bytes'
    )
  })

}
