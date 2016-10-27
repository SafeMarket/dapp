/* globals angular */

angular.module('app').factory('Affiliate', (AffiliateReg, txMonitor, constants) => {

  function Affiliate(code) {
    this.code = code
    this.update()
  }

  Affiliate.create = function createAffiliate(code, owner, coinbase) {
    return txMonitor.propose('Create an Affiliate', AffiliateReg.setAffiliate, [code, owner, coinbase])
  }

  Affiliate.prototype.update = function updateAffiliate() {
    this.owner = AffiliateReg.getAffiliateOwner(this.code)
    this.coinbase = AffiliateReg.getAffiliateCoinbase(this.code)
  }

  Affiliate.prototype.set = function setAffiliate(owner, coinbase) {
    return txMonitor.propose('Edit an Affiliate', AffiliateReg.setAffiliate, [this.code, owner, coinbase])
  }

  Affiliate.prototype.delete = function deleteAffiliate() {
    return txMonitor.propose('Delete an Affiliate', AffiliateReg.setAffiliate, [this.code, constants.nullAddr, constants.nullAddr])
  }

  return Affiliate

})
