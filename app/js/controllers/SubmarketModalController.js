/* globals angular, web3 */

angular.module('app').controller('SubmarketModalController', ($scope, ticker, growl, $modal, $modalInstance, submarket, user, helpers, utils, SubmarketReg, AliasReg, constants, Submarket, Coinage) => {

  $scope.currencies = Object.keys(ticker.prices)

  if (submarket) {
    submarket.updatePromise.then(() => {})
    $scope.alias = submarket.alias
    $scope.currency = submarket.currency
    $scope.isEditing = true
    $scope.name = submarket.meta.name
    $scope.info = submarket.meta.info
    $scope.escrowFeeBase = angular.copy(submarket.escrowFeeBase)
    $scope.escrowFeeCentiperun = submarket.infosphered.data.escrowFeeCentiperun.toNumber()
    $scope.isOpen = submarket.infosphered.data.isOpen
    $scope.escrowFeeBase = angular.copy(submarket.escrowFeeBase)
    $scope.stores = submarket.approvesAliases.approvedAliases.map((alias) => { return { alias } })

  } else {
    $scope.currency = user.getCurrency()
    $scope.escrowFeeBase = new Coinage(0, $scope.currency)
    $scope.escrowFeeCentiperun = 3
    $scope.stores = []
    $scope.isOpen = true
  }

  $scope.cancel = function cancel() {
    $modalInstance.dismiss('cancel')
  }

  $scope.submit = function submit() {
    const alias = $scope.alias
    const meta = {
      name: $scope.name,
      info: $scope.info
    }
    const isOpen = !!$scope.isOpen

    try {
      Submarket.check(alias, meta)
    } catch (e) {
      growl.addErrorMessage(e)
      return
    }

    const escrowFeeTerabase = $scope.escrowFeeBase.in($scope.currency).times(constants.tera)
    const approvedAliases = $scope.stores.map((store) => {return utils.toBytes32(store.alias)})

    if (submarket) {

      return submarket
        .set({
          isOpen,
          currency: $scope.currency,
          escrowFeeTerabase,
          escrowFeeCentiperun: $scope.escrowFeeCentiperun
        }, approvedAliases, meta, $scope.alias).then(() => {
          return submarket.update().then(() => {
            return $modalInstance.close(submarket)
          })
        }, (error) => {
          $scope.error = error
        })

    } else {

      if (!utils.isAliasAvailable(alias)) {
        return growl.addErrorMessage(`The alias ${alias} is taken`)
      }

      return Submarket
        .create(
          user.getAccount(),
          isOpen,
          $scope.currency,
          escrowFeeTerabase,
          $scope.escrowFeeCentiperun,
          meta,
          $scope.alias,
          approvedAliases
        )
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
