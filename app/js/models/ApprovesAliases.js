/* globals angular */

angular.module('app').factory('ApprovesAliases', (utils) => {

  function ApprovesAliases() {}

  ApprovesAliases.prototype.getApprovedAliases = function getApprovedAliases() {
    const approvedAliasesLength = this.contract.getApprovedAliasesLength()
    const approvedAliases = []
    for (let i = 0; i < approvedAliasesLength; i ++) {
      const alias = this.contract.getApprovedAlias(i)
      if (!this.contract.getIsAliasApproved(alias)) {
        approvedAliases.push(utils.toAscii(alias))
      }
    }
    return approvedAliases
  }

  ApprovesAliases.prototype.getMartyrCalls = function getMartyrCalls(newlyApprovedAliases) {
    const calls = []

    newlyApprovedAliases.forEach((alias) => {
      if (this.contract.getIsAliasApproved(alias)) { return true }
      calls.push({
        address: this.contract.address,
        data: this.contract.approveAlias.getData(alias)
      })
    })

    this.approvedAliases.forEach((alias) => {
      if (newlyApprovedAliases.indexOf(alias) > -1) { return true }
      calls.push({
        address: this.contract.address,
        data: this.contract.disapproveAlias.getData(alias)
      })
    })
  }

  return ApprovesAliases

})
