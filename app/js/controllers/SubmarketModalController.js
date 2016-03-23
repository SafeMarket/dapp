/* globals angular, web3 */

angular.module('app').controller('SubmarketModalController', ($scope, ticker, growl, $modal, $modalInstance, submarket, user, helpers, utils, SubmarketReg, AliasReg, constants, Submarket) => {

  $scope.stores = []

  $scope.currencies = Object.keys(ticker.rates)

  if (submarket) {
    $scope.alias = submarket.alias
    $scope.currency = submarket.currency
    $scope.isEditing = true
    $scope.name = submarket.meta.data.name
    $scope.info = submarket.meta.data.info
    $scope.escrowFeeCentiperun = submarket.infosphered.data.escrowFeeCentiperun.toNumber()
    $scope.isOpen = submarket.infosphered.data.isOpen
    $scope.minTotal = submarket.infosphered.data.minTotal.div(constants.tera)

    if (submarket.meta.data.storeAddrs) {
      submarket.meta.data.storeAddrs.forEach((storeAddr) => {
        $scope.stores.push({ alias: utils.getAlias(storeAddr) })
      })
    }
  } else {
    $scope.currency = user.getCurrency()
    $scope.escrowFeeCentiperun = 3
    $scope.stores = []
    $scope.isOpen = true
    $scope.minTotal = 0
  }

  $scope.cancel = function cancel() {
    $modalInstance.dismiss('cancel')
  }

  $scope.submit = function submit() {
    const alias = $scope.alias
    const meta = {
      name: $scope.name,
      info: $scope.info,
      storeAddrs: []
    }
    const isOpen = !!$scope.isOpen

    $scope.stores.forEach((store) => {
      meta.storeAddrs.push(AliasReg.getAddr(store.alias))
    })

    try {
      Submarket.check(alias, meta)
    } catch (e) {
      growl.addErrorMessage(e)
      return
    }

    if (submarket) {

      submarket
        .set({
          isOpen: isOpen,
          currency: $scope.currency,
          minTotal: (web3.toBigNumber($scope.minTotal)).times(constants.tera),
          escrowFeeCentiperun: $scope.escrowFeeCentiperun
        }, meta, $scope.alias).then((_submarket) => {
          $modalInstance.close(_submarket)
        }, (error) => {
          $scope.error = error
        })

    } else {

      if (!utils.isAliasAvailable(alias)) {
        return growl.addErrorMessage(`The alias ${alias} is taken`)
      }

      Submarket
        .create(isOpen, $scope.currency, $scope.minTotal, $scope.escrowFeeCentiperun, meta, $scope.alias)
        .then((_submarket) => {
          user.addSubmarket(_submarket.addr)
          user.save()
          $modalInstance.dismiss()
        }, (error) => {
          $scope.error = error
        })
    }
  }
})
