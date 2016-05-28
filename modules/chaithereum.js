module.exports = function chaithereum(chai, utils) {

  /* hex */
  chai.Assertion.addProperty('hex', function addHexProperty() {
    new chai.Assertion(this._obj).to.be.a('string')
    new chai.Assertion(this._obj.substr(2)).to.match(/[0-9A-Fa-f]{6}/g)
  })

  /* address */
  chai.Assertion.addProperty('address', function addAddressProperty() {
    new chai.Assertion(this._obj).to.be.hex
    new chai.Assertion(this._obj).to.have.length(42)
  })

  /* zero bytes */
  utils.addProperty(chai.Assertion.prototype, 'zeros', function addZerosProperty() {
    new chai.Assertion(this._obj).to.be.hex
    this.assert(
      this._obj.replace('00', '').length === 2,
      'expected #{this} to be a string of 00 bytes',
      'expected #{this} to not be a string of 00 bytes'
    )
  })

}
