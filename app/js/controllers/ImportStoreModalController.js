/* globals angular */

angular.module('app').controller('ImportStoreModalController', ($scope, $modalInstance, growl, user, utils, AliasReg, Store) => {

  $scope.cancel = function cancel() {
    $modalInstance.dismiss('cancel')
  }

  $scope.submit = function submit() {
    try {
      utils.check({
        alias: $scope.alias
      }, {
        alias: {
          presence: true,
          type: 'alias',
          aliasOfContract: 'Store'
        }
      })
    } catch (e) {
      return growl.addErrorMessage(e)
    }

    const storeAddr = AliasReg.getAddr($scope.alias)
    const store = new Store(storeAddr)

    if (store.owner !== user.getAccount()) {
      return growl.addErrorMessage('You are not the owner of that store')
    }

    user.addStore(storeAddr)
    user.save()

    $modalInstance.close()

  }

})
