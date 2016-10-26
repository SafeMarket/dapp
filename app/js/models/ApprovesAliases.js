/* globals angular */

angular.module('app').factory('ApprovesAliases', (utils) => {

  function ApprovesAliases(contract) {
    this.contract = contract
    this.update()
  }

  ApprovesAliases.prototype.getApprovedAliases = function getApprovedAliases() {
    const approvedAliasesLength = this.contract.getApprovedAliasesLength()
    const approvedAliases = []
    for (let i = 0; i < approvedAliasesLength; i ++) {
      const alias = this.contract.getApprovedAlias(i)
      if (this.contract.getIsAliasApproved(alias)) {
        approvedAliases.push(utils.toAscii(alias))
      }
    }
    return approvedAliases
  }

  ApprovesAliases.prototype.getMartyrCalls = function getMartyrCalls(newlyApprovedAliases) {
    console.log('getMartyrCalls')
    const calls = []

    newlyApprovedAliases.forEach((alias) => {
      if (this.approvedAliases.indexOf(alias) > -1) { return true }
      calls.push({
        address: this.contract.address,
        data: this.contract.approveAlias.getData(utils.toBytes32(alias))
      })
    })

    this.approvedAliases.forEach((alias) => {
      if (newlyApprovedAliases.indexOf(alias) > -1) { return true }
      calls.push({
        address: this.contract.address,
        data: this.contract.disapproveAlias.getData(utils.toBytes32(alias))
      })
    })

    return calls
  }

  ApprovesAliases.prototype.update = function(){
    this.approvedAliases = this.getApprovedAliases()
  }

  return ApprovesAliases

})
