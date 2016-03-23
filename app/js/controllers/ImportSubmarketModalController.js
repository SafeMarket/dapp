/* globals angular */

angular.module('app').controller('ImportSubmarketModalController', ($scope, $modalInstance, growl, user, utils, AliasReg, Submarket) => {

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
          aliasOfContract: 'Submarket'
        }
      })
    } catch (e) {
      growl.addErrorMessage(e)
      return
    }

    const submarketAddr = AliasReg.getAddr($scope.alias)
    const submarket = new Submarket(submarketAddr)

    if (submarket.owner !== user.getAccount()) {
      growl.addErrorMessage('You are not the owner of that submarket')
      return
    }

    user.addSubmarket(submarketAddr)
    user.save()

    $modalInstance.close()

  }

})
