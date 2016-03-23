/* globals angular, web3 */

angular.module('app').controller('BarController', ($scope, helpers, Submarket, Store, AliasReg) => {

  $scope.submit = function submit() {

    const alias = $scope.alias
    const addr = AliasReg.getAddr(alias)
    const runtimeBytecode = web3.eth.getCode(addr)

    switch (runtimeBytecode) {
      case Submarket.runtimeBytecode:
        window.location.hash = helpers.getUrl('submarket', addr)
        break
      case Store.runtimeBytecode:
        window.location.hash = helpers.getUrl('store', addr)
        break
      default:
        window.location.hash = `/404/${alias}`
        break
    }

  }

})
